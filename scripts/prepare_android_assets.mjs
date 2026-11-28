import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const androidMainDir = path.join(rootDir, 'android', 'app', 'src', 'main');
const resDir = path.join(androidMainDir, 'res');

if (!fs.existsSync(resDir)) {
  console.error('Android res directory not found:', resDir);
  process.exit(1);
}

// 1. Remove adaptive XML so crisp GraçaPlay PNG launcher icons render on all Android versions
const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
if (fs.existsSync(anydpiDir)) {
  fs.rmSync(anydpiDir, { recursive: true, force: true });
}

const icon512 = path.join(rootDir, 'public', 'pwa-512x512.png');
const icon192 = path.join(rootDir, 'public', 'pwa-192x192.png');

const densitySources = [
  ['mipmap-xxxhdpi', icon512],
  ['mipmap-xxhdpi', icon512],
  ['mipmap-xhdpi', icon512],
  ['mipmap-hdpi', icon192],
  ['mipmap-mdpi', icon192],
];

for (const [folder, srcFile] of densitySources) {
  if (!fs.existsSync(srcFile)) continue;
  const targetDir = path.join(resDir, folder);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(srcFile, path.join(targetDir, 'ic_launcher.png'));
  fs.copyFileSync(srcFile, path.join(targetDir, 'ic_launcher_round.png'));
}

console.log('Android launcher icons updated for GraçaPlay.');

// 2. Enable Picture-in-Picture & configChanges on MainActivity in AndroidManifest.xml
const manifestPath = path.join(androidMainDir, 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const requiredConfigChanges =
    'orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode';

  manifest = manifest.replace(/<activity\b([\s\S]*?)>/g, (fullTag, attrs) => {
    if (!/android:name="[^"]*MainActivity"/i.test(attrs)) {
      return fullTag;
    }

    let nextAttrs = attrs;
    if (/android:supportsPictureInPicture=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(
        /android:supportsPictureInPicture="[^"]*"/i,
        'android:supportsPictureInPicture="true"'
      );
    } else {
      nextAttrs += '\n            android:supportsPictureInPicture="true"';
    }

    if (/android:configChanges=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(
        /android:configChanges="[^"]*"/i,
        `android:configChanges="${requiredConfigChanges}"`
      );
    } else {
      nextAttrs += `\n            android:configChanges="${requiredConfigChanges}"`;
    }

    if (/android:launchMode=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(
        /android:launchMode="[^"]*"/i,
        'android:launchMode="singleTask"'
      );
    } else {
      nextAttrs += '\n            android:launchMode="singleTask"';
    }

    if (/android:screenOrientation=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(
        /android:screenOrientation="[^"]*"/i,
        'android:screenOrientation="fullUser"'
      );
    } else {
      nextAttrs += '\n            android:screenOrientation="fullUser"';
    }

    return `<activity${nextAttrs}>`;
  });

  if (!/android\.permission\.POST_NOTIFICATIONS/i.test(manifest)) {
    manifest = manifest.replace(
      /<application\b/i,
      '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <application'
    );
  }
  if (!/android\.permission\.RECEIVE_BOOT_COMPLETED/i.test(manifest)) {
    manifest = manifest.replace(
      /<application\b/i,
      '    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n    <application'
    );
  }
  if (!/VideoCheckReceiver/i.test(manifest)) {
    manifest = manifest.replace(
      /<\/application>/i,
      '        <receiver android:name=".VideoCheckReceiver" android:exported="false" />\n    </application>'
    );
  }
  if (!/BootReceiver/i.test(manifest)) {
    manifest = manifest.replace(
      /<\/application>/i,
      '        <receiver android:name=".BootReceiver" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.BOOT_COMPLETED" />\n            </intent-filter>\n        </receiver>\n    </application>'
    );
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('AndroidManifest.xml configured for Picture-in-Picture, orientation, and notifications.');
}

// 3. Configure MainActivity.java, VideoCheckReceiver.java, and BootReceiver.java
function findFileRecursive(dir, targetName) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFileRecursive(full, targetName);
      if (found) return found;
    } else if (entry.name === targetName) {
      return full;
    }
  }
  return null;
}

const javaRoot = path.join(androidMainDir, 'java');
const mainActivityPath = findFileRecursive(javaRoot, 'MainActivity.java');

if (mainActivityPath) {
  const existing = fs.readFileSync(mainActivityPath, 'utf8');
  const pkgMatch = existing.match(/^\s*package\s+([a-zA-Z0-9_.]+)\s*;/m);
  const packageName = pkgMatch ? pkgMatch[1] : 'com.luzshorts.app';
  const packageDir = path.dirname(mainActivityPath);

  const bootReceiverCode = `package ${packageName};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class BootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
      return;
    }
    SharedPreferences prefs = context.getSharedPreferences(VideoCheckReceiver.PREFS_NAME, Context.MODE_PRIVATE);
    if (prefs.getBoolean("enabled", false)) {
      VideoCheckReceiver.schedulePeriodic(context);
    }
  }
}
`;
  fs.writeFileSync(path.join(packageDir, 'BootReceiver.java'), bootReceiverCode, 'utf8');

  const videoCheckReceiverCode = `package ${packageName};

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

public class VideoCheckReceiver extends BroadcastReceiver {
  public static final String PREFS_NAME = "gracaplay_notif_prefs";
  public static final String CHANNEL_ID = "gracaplay_new_videos";
  private static final String CHANNEL_NAME = "Novos vídeos do GraçaPlay";
  private static final String ACTION_CHECK = "${packageName}.ACTION_CHECK_NEW_VIDEOS";
  private static final int ALARM_REQUEST_CODE = 7701;
  private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

  private static final class VideoCandidate {
    final String id;
    final String title;
    final String channelTitle;
    final String category;

    VideoCandidate(String id, String title, String channelTitle, String category) {
      this.id = id;
      this.title = title;
      this.channelTitle = channelTitle;
      this.category = category;
    }
  }

  public static void schedulePeriodic(Context context) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (alarmManager == null) return;
    Intent intent = new Intent(context, VideoCheckReceiver.class);
    intent.setAction(ACTION_CHECK);
    PendingIntent pi = PendingIntent.getBroadcast(
      context,
      ALARM_REQUEST_CODE,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
    alarmManager.setInexactRepeating(
      AlarmManager.ELAPSED_REALTIME_WAKEUP,
      SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_FIFTEEN_MINUTES,
      AlarmManager.INTERVAL_FIFTEEN_MINUTES,
      pi
    );
  }

  public static void cancelPeriodic(Context context) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (alarmManager == null) return;
    Intent intent = new Intent(context, VideoCheckReceiver.class);
    intent.setAction(ACTION_CHECK);
    PendingIntent pi = PendingIntent.getBroadcast(
      context,
      ALARM_REQUEST_CODE,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
    alarmManager.cancel(pi);
  }

  public static void warmOrCheckAsync(Context context, boolean forceTest) {
    final Context appCtx = context.getApplicationContext();
    EXECUTOR.execute(() -> checkAndNotify(appCtx, forceTest));
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    final PendingResult pendingResult = goAsync();
    final Context appCtx = context.getApplicationContext();
    EXECUTOR.execute(() -> {
      try {
        checkAndNotify(appCtx, false);
      } finally {
        pendingResult.finish();
      }
    });
  }

  private static void ensureChannel(Context context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      if (nm != null) {
        NotificationChannel channel = new NotificationChannel(
          CHANNEL_ID,
          CHANNEL_NAME,
          NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Avisos de novos vídeos cristãos disponíveis no GraçaPlay");
        nm.createNotificationChannel(channel);
      }
    }
  }

  private static boolean hasPostNotificationPermission(Context context) {
    if (Build.VERSION.SDK_INT >= 33) {
      return context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
        == PackageManager.PERMISSION_GRANTED;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
      return nm == null || nm.areNotificationsEnabled();
    }
    return true;
  }

  private static void checkAndNotify(Context context, boolean forceTest) {
    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    if (!forceTest && !prefs.getBoolean("enabled", false)) {
      return;
    }
    if (!hasPostNotificationPermission(context)) {
      return;
    }

    String categoriesCsv = prefs.getString("categories", "pregacoes,escola_sabatina,louvores,testemunhos,feliz7play");
    String apiBaseUrl = prefs.getString("apiBaseUrl", "");
    String knownCsv = prefs.getString("knownIds", "");
    List<String> knownList = new ArrayList<>();
    Set<String> knownSet = new HashSet<>();
    if (knownCsv != null && !knownCsv.isEmpty()) {
      for (String id : knownCsv.split(",")) {
        String trimmed = id.trim();
        if (!trimmed.isEmpty() && knownSet.add(trimmed)) {
          knownList.add(trimmed);
        }
      }
    }

    List<VideoCandidate> fetched = fetchCandidatesFromApi(apiBaseUrl, categoriesCsv);
    if (fetched.isEmpty()) {
      fetched = fetchCandidatesFromRss(categoriesCsv);
    }

    if (fetched.isEmpty()) {
      if (forceTest) {
        postNotification(
          context,
          "",
          "GraçaPlay · Notificações ativas",
          "Você receberá avisos aqui sempre que entrarem novos vídeos cristãos."
        );
      }
      return;
    }

    boolean isFirstWarmup = knownList.isEmpty() && !forceTest;
    VideoCandidate freshPick = null;
    for (VideoCandidate c : fetched) {
      if (!knownSet.contains(c.id)) {
        freshPick = c;
        break;
      }
    }

    for (VideoCandidate c : fetched) {
      if (knownSet.add(c.id)) {
        knownList.add(0, c.id);
      }
    }
    if (knownList.size() > 250) {
      knownList = new ArrayList<>(knownList.subList(0, 250));
    }
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < knownList.size(); i++) {
      if (i > 0) sb.append(",");
      sb.append(knownList.get(i));
    }
    prefs.edit().putString("knownIds", sb.toString()).apply();

    if (isFirstWarmup) {
      return;
    }

    if (forceTest && freshPick == null) {
      freshPick = fetched.get(0);
    }
    if (freshPick == null) {
      return;
    }

    String catLabel = categoryLabel(freshPick.category);
    String notifTitle = forceTest
      ? "GraçaPlay · Teste em " + catLabel
      : "Novo vídeo em " + catLabel;
    String notifBody = freshPick.channelTitle != null && !freshPick.channelTitle.isEmpty()
      ? freshPick.title + " — " + freshPick.channelTitle
      : freshPick.title;
    postNotification(context, freshPick.id, notifTitle, notifBody);
  }

  private static String categoryLabel(String category) {
    if ("pregacoes".equals(category)) return "Pregações e Bíblia";
    if ("escola_sabatina".equals(category)) return "Escola Sabatina";
    if ("louvores".equals(category)) return "Louvores";
    if ("testemunhos".equals(category)) return "Testemunhos";
    if ("feliz7play".equals(category)) return "Feliz7Play";
    return "Cristão";
  }

  private static void postNotification(Context context, String videoId, String title, String body) {
    ensureChannel(context);
    NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (nm == null) return;

    Intent openIntent = new Intent(context, MainActivity.class);
    openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    if (videoId != null && !videoId.isEmpty()) {
      openIntent.putExtra("gracaplay_video_id", videoId);
    }
    PendingIntent tapPi = PendingIntent.getActivity(
      context,
      (int) (System.currentTimeMillis() & 0x7fffffff),
      openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );

    int smallIcon = context.getApplicationInfo().icon != 0
      ? context.getApplicationInfo().icon
      : android.R.drawable.ic_dialog_info;

    Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
      ? new Notification.Builder(context, CHANNEL_ID)
      : new Notification.Builder(context);

    builder
      .setSmallIcon(smallIcon)
      .setContentTitle(title)
      .setContentText(body)
      .setStyle(new Notification.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setContentIntent(tapPi);

    nm.notify((int) (System.currentTimeMillis() & 0x7fffffff), builder.build());
  }

  private static List<VideoCandidate> fetchCandidatesFromApi(String apiBaseUrl, String categoriesCsv) {
    List<VideoCandidate> list = new ArrayList<>();
    if (apiBaseUrl == null) return list;
    String base = apiBaseUrl.trim().replaceAll("/+$", "");
    if (!base.startsWith("http") || base.contains("://localhost") || base.contains("://127.0.0.1")) {
      return list;
    }
    try {
      String query = URLEncoder.encode(categoriesCsv == null ? "" : categoriesCsv, "UTF-8");
      String raw = httpGet(base + "/api/push/latest?categories=" + query, 8000);
      if (raw == null || raw.isEmpty()) return list;
      JSONObject json = new JSONObject(raw);
      JSONArray items = json.optJSONArray("items");
      if (items == null) return list;
      for (int i = 0; i < items.length(); i++) {
        JSONObject obj = items.optJSONObject(i);
        if (obj == null) continue;
        String id = obj.optString("id", "");
        String title = obj.optString("title", "");
        if (id.length() == 11 && !title.isEmpty()) {
          list.add(new VideoCandidate(
            id,
            title,
            obj.optString("channelTitle", ""),
            obj.optString("category", "pregacoes")
          ));
        }
      }
    } catch (Throwable ignored) {
    }
    return list;
  }

  private static List<VideoCandidate> fetchCandidatesFromRss(String categoriesCsv) {
    List<VideoCandidate> list = new ArrayList<>();
    Set<String> selected = new HashSet<>(Arrays.asList(
      (categoriesCsv == null ? "pregacoes,louvores,feliz7play" : categoriesCsv).split(",")
    ));

    List<String[]> feeds = new ArrayList<>();
    if (selected.contains("pregacoes")) {
      feeds.add(new String[]{"UC_OaSsAydgSIjUtjYn9qLog", "pregacoes", "Rede Novo Tempo"});
      feeds.add(new String[]{"UCs5jiNO6fntcZcCn7sUO6VA", "pregacoes", "Pr. Alejandro Bullón"});
    }
    if (selected.contains("louvores")) {
      feeds.add(new String[]{"UCj14fcdKiGxi2qQsqhPf9tg", "louvores", "Adoradores Novo Tempo"});
      feeds.add(new String[]{"UCIvT_5iKmxPksHRqv4g_GZQ", "louvores", "Ministério Jovem"});
    }
    if (selected.contains("feliz7play")) {
      feeds.add(new String[]{"UC8PS8EsZsWXOQ1YmlJwCaYw", "feliz7play", "Feliz7Play"});
    }
    if (selected.contains("testemunhos")) {
      feeds.add(new String[]{"UCJAO3KgZdEhCqwpkZyAYY6A", "testemunhos", "Adventistas Brasil"});
    }
    if (selected.contains("escola_sabatina")) {
      feeds.add(new String[]{"UCSIjHSkAS_IpF7R-HIsn88Q", "escola_sabatina", "Pr Dudu Batista"});
    }

    Pattern entryPat = Pattern.compile("<entry>([\\\\s\\\\S]*?)</entry>");
    Pattern idPat = Pattern.compile("<yt:videoId>([^<]+)</yt:videoId>");
    Pattern titlePat = Pattern.compile("<title>([\\\\s\\\\S]*?)</title>");

    for (String[] feed : feeds) {
      String xml = httpGet("https://www.youtube.com/feeds/videos.xml?channel_id=" + feed[0], 5500);
      if (xml == null || xml.isEmpty()) continue;
      Matcher mEntry = entryPat.matcher(xml);
      int count = 0;
      while (mEntry.find() && count < 3) {
        String block = mEntry.group(1);
        Matcher mId = idPat.matcher(block);
        Matcher mTitle = titlePat.matcher(block);
        if (!mId.find() || !mTitle.find()) continue;
        String vid = mId.group(1).trim();
        String title = decodeXml(mTitle.group(1).trim());
        String lower = title.toLowerCase(Locale.ROOT);
        if (
          vid.length() != 11 ||
          lower.contains("estreia") ||
          lower.contains("estréia") ||
          lower.contains("trailer") ||
          lower.contains("teaser") ||
          lower.contains("em breve") ||
          lower.contains("ao vivo")
        ) {
          continue;
        }
        list.add(new VideoCandidate(vid, title, feed[2], feed[1]));
        count++;
      }
    }
    return list;
  }

  private static String decodeXml(String s) {
    return s
      .replace("&amp;", "&")
      .replace("&lt;", "<")
      .replace("&gt;", ">")
      .replace("&quot;", "\\"")
      .replace("&#39;", "'")
      .replace("&apos;", "'");
  }

  private static String httpGet(String urlStr, int timeoutMs) {
    HttpURLConnection conn = null;
    try {
      URL url = new URL(urlStr);
      conn = (HttpURLConnection) url.openConnection();
      conn.setConnectTimeout(timeoutMs);
      conn.setReadTimeout(timeoutMs);
      conn.setRequestMethod("GET");
      conn.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; GracaPlay/1.0)");
      if (conn.getResponseCode() < 200 || conn.getResponseCode() >= 300) {
        return null;
      }
      StringBuilder out = new StringBuilder();
      try (BufferedReader br = new BufferedReader(
        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8)
      )) {
        String line;
        while ((line = br.readLine()) != null) {
          out.append(line).append("\\n");
        }
      }
      return out.toString();
    } catch (Throwable ignored) {
      return null;
    } finally {
      if (conn != null) conn.disconnect();
    }
  }
}
`;
  fs.writeFileSync(path.join(packageDir, 'VideoCheckReceiver.java'), videoCheckReceiverCode, 'utf8');

  const mainActivityCode = `package ${packageName};

import android.Manifest;
import android.app.NotificationManager;
import android.app.PictureInPictureParams;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Rational;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int REQ_POST_NOTIFICATIONS = 4401;
  private volatile boolean isVideoPlaying = false;
  private volatile int pipAspectWidth = 9;
  private volatile int pipAspectHeight = 16;
  private volatile String pendingNotificationVideoId = "";
  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    captureNotificationVideoIntent(getIntent());
    configureWebViewForPip();
    SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
    if (prefs.getBoolean("enabled", false)) {
      VideoCheckReceiver.schedulePeriodic(this);
    }
  }

  @Override
  public void onStart() {
    super.onStart();
    configureWebViewForPip();
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    captureNotificationVideoIntent(intent);
  }

  private void captureNotificationVideoIntent(Intent intent) {
    if (intent == null) return;
    String vid = intent.getStringExtra("gracaplay_video_id");
    if (vid != null && vid.length() == 11) {
      pendingNotificationVideoId = vid;
      intent.removeExtra("gracaplay_video_id");
      if (getBridge() != null && getBridge().getWebView() != null) {
        WebView webView = getBridge().getWebView();
        final String safeId = vid.replaceAll("[^a-zA-Z0-9_-]", "");
        webView.post(() ->
          webView.evaluateJavascript(
            "try{window.dispatchEvent(new CustomEvent('gracaplay-open-video',{detail:{videoId:'" + safeId + "'}}));}catch(e){}",
            null
          )
        );
      }
    }
  }

  private void configureWebViewForPip() {
    if (getBridge() == null) return;
    WebView webView = getBridge().getWebView();
    if (webView == null) return;

    WebSettings settings = webView.getSettings();
    if (settings != null) {
      settings.setMediaPlaybackRequiresUserGesture(false);
      settings.setDomStorageEnabled(true);
      settings.setDatabaseEnabled(true);
      settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    }
    webView.addJavascriptInterface(new PipJsBridge(), "GracaPlayNativePip");
    webView.addJavascriptInterface(new OrientationJsBridge(), "GracaPlayOrientation");
    webView.addJavascriptInterface(new NotificationJsBridge(), "GracaPlayNotifications");
    syncAutoEnterPipParams();
  }

  private String resolveNotificationPermissionState() {
    if (Build.VERSION.SDK_INT >= 33) {
      boolean granted = checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
        == PackageManager.PERMISSION_GRANTED;
      if (granted) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        return (nm == null || nm.areNotificationsEnabled()) ? "granted" : "denied";
      }
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      return prefs.getBoolean("askedPermission", false) ? "denied" : "default";
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
      return (nm == null || nm.areNotificationsEnabled()) ? "granted" : "denied";
    }
    return "granted";
  }

  private void notifyPermissionResultToWeb(String permission) {
    if (getBridge() == null || getBridge().getWebView() == null) return;
    WebView webView = getBridge().getWebView();
    final String js =
      "try{window.dispatchEvent(new CustomEvent('gracaplay-native-notif-permission',{detail:{permission:'" + permission + "'}}));}catch(e){}";
    webView.post(() -> webView.evaluateJavascript(js, null));
  }

  @Override
  public void onRequestPermissionsResult(
    int requestCode,
    @NonNull String[] permissions,
    @NonNull int[] grantResults
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == REQ_POST_NOTIFICATIONS) {
      boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
      notifyPermissionResultToWeb(granted ? "granted" : "denied");
    }
  }

  private boolean isPipSupportedOnDevice() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false;
    return getPackageManager().hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE);
  }

  private Rational getSafeAspectRatio() {
    int w = Math.max(1, pipAspectWidth);
    int h = Math.max(1, pipAspectHeight);
    double ratio = (double) w / (double) h;
    if (ratio < 0.5d) {
      return new Rational(9, 16);
    }
    if (ratio > 2.0d) {
      return new Rational(16, 9);
    }
    return new Rational(w, h);
  }

  private PictureInPictureParams buildPipParams() {
    PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder()
      .setAspectRatio(getSafeAspectRatio());
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.setAutoEnterEnabled(isVideoPlaying);
      builder.setSeamlessResizeEnabled(true);
    }
    return builder.build();
  }

  private void syncAutoEnterPipParams() {
    if (!isPipSupportedOnDevice()) return;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      try {
        setPictureInPictureParams(buildPipParams());
      } catch (Throwable ignored) {
      }
    }
  }

  private void enterPipNow() {
    if (!isPipSupportedOnDevice()) return;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !isInPictureInPictureMode()) {
      try {
        enterPictureInPictureMode(buildPipParams());
      } catch (Throwable ignored) {
      }
    }
  }

  private void keepWebViewActive() {
    if (getBridge() == null) return;
    WebView webView = getBridge().getWebView();
    if (webView == null) return;
    try {
      webView.onResume();
      webView.resumeTimers();
    } catch (Throwable ignored) {
    }
  }

  private void notifyWebPipState(boolean active) {
    if (getBridge() == null) return;
    WebView webView = getBridge().getWebView();
    if (webView == null) return;
    final String flag = active ? "true" : "false";
    final String js =
      "try{" +
      "document.documentElement.dataset.pipMode='" + flag + "';" +
      "window.dispatchEvent(new CustomEvent('gracaplay-pip-change',{detail:{active:" + flag + "}}));" +
      "}catch(e){}";
    webView.post(() -> webView.evaluateJavascript(js, null));
  }

  @Override
  public void onUserLeaveHint() {
    super.onUserLeaveHint();
    if (isVideoPlaying) {
      enterPipNow();
    }
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
      pipAspectWidth = 16;
      pipAspectHeight = 9;
    } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
      pipAspectWidth = 9;
      pipAspectHeight = 16;
    }
    syncAutoEnterPipParams();
    keepWebViewActive();
  }

  @Override
  public void onPause() {
    super.onPause();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode()) {
      keepWebViewActive();
      mainHandler.postDelayed(this::keepWebViewActive, 100);
    }
  }

  @Override
  public void onStop() {
    super.onStop();
    boolean inPip = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode();
    if (!inPip && !isChangingConfigurations()) {
      if (getBridge() != null && getBridge().getWebView() != null) {
        WebView webView = getBridge().getWebView();
        webView.post(() ->
          webView.evaluateJavascript(
            "try{window.dispatchEvent(new CustomEvent('gracaplay-app-stopped'));}catch(e){}",
            null
          )
        );
      }
    }
  }

  @Override
  public void onPictureInPictureModeChanged(
    boolean isInPictureInPictureMode,
    @NonNull Configuration newConfig
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
    if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
      pipAspectWidth = 16;
      pipAspectHeight = 9;
    } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
      pipAspectWidth = 9;
      pipAspectHeight = 16;
    }
    notifyWebPipState(isInPictureInPictureMode);
    if (isInPictureInPictureMode) {
      keepWebViewActive();
      mainHandler.postDelayed(this::keepWebViewActive, 90);
      mainHandler.postDelayed(() -> {
        keepWebViewActive();
        if (getBridge() != null && getBridge().getWebView() != null) {
          getBridge().getWebView().evaluateJavascript(
            "try{window.dispatchEvent(new CustomEvent('gracaplay-pip-resume'));}catch(e){}",
            null
          );
        }
      }, 220);
    }
  }

  public class PipJsBridge {
    @JavascriptInterface
    public boolean isSupported() {
      return isPipSupportedOnDevice();
    }

    @JavascriptInterface
    public void setPlaybackState(boolean playing, int width, int height) {
      isVideoPlaying = playing;
      if (width > 0 && height > 0) {
        pipAspectWidth = width;
        pipAspectHeight = height;
      }
      mainHandler.post(MainActivity.this::syncAutoEnterPipParams);
    }

    @JavascriptInterface
    public void enterPip() {
      mainHandler.post(MainActivity.this::enterPipNow);
    }
  }

  public class OrientationJsBridge {
    @JavascriptInterface
    public boolean isSupported() {
      return true;
    }

    @JavascriptInterface
    public void requestOrientation(String mode) {
      mainHandler.post(() -> {
        if ("landscape".equals(mode)) {
          setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        } else if ("portrait".equals(mode)) {
          setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        } else {
          setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_USER);
        }
      });
    }
  }

  public class NotificationJsBridge {
    @JavascriptInterface
    public boolean isSupported() {
      return true;
    }

    @JavascriptInterface
    public String getPermissionState() {
      return resolveNotificationPermissionState();
    }

    @JavascriptInterface
    public boolean isEnabled() {
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      return prefs.getBoolean("enabled", false);
    }

    @JavascriptInterface
    public void requestPermission() {
      if (Build.VERSION.SDK_INT >= 33) {
        SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putBoolean("askedPermission", true).apply();
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
          notifyPermissionResultToWeb(resolveNotificationPermissionState());
          return;
        }
        mainHandler.post(() ->
          requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_POST_NOTIFICATIONS)
        );
      } else {
        notifyPermissionResultToWeb(resolveNotificationPermissionState());
      }
    }

    @JavascriptInterface
    public void enable(String categoriesCsv, String apiBaseUrl) {
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      prefs.edit()
        .putBoolean("enabled", true)
        .putString("categories", categoriesCsv != null ? categoriesCsv : "")
        .putString("apiBaseUrl", apiBaseUrl != null ? apiBaseUrl : "")
        .apply();
      VideoCheckReceiver.schedulePeriodic(MainActivity.this);
      VideoCheckReceiver.warmOrCheckAsync(MainActivity.this, false);
    }

    @JavascriptInterface
    public void updateCategories(String categoriesCsv, String apiBaseUrl) {
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      prefs.edit()
        .putString("categories", categoriesCsv != null ? categoriesCsv : "")
        .putString("apiBaseUrl", apiBaseUrl != null ? apiBaseUrl : "")
        .apply();
    }

    @JavascriptInterface
    public void disable() {
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      prefs.edit().putBoolean("enabled", false).apply();
      VideoCheckReceiver.cancelPeriodic(MainActivity.this);
    }

    @JavascriptInterface
    public void sendTestNotification(String categoriesCsv, String apiBaseUrl) {
      SharedPreferences prefs = getSharedPreferences(VideoCheckReceiver.PREFS_NAME, MODE_PRIVATE);
      prefs.edit()
        .putString("categories", categoriesCsv != null ? categoriesCsv : "")
        .putString("apiBaseUrl", apiBaseUrl != null ? apiBaseUrl : "")
        .apply();
      VideoCheckReceiver.warmOrCheckAsync(MainActivity.this, true);
    }

    @JavascriptInterface
    public String consumePendingVideoId() {
      String vid = pendingNotificationVideoId;
      pendingNotificationVideoId = "";
      return vid != null ? vid : "";
    }
  }
}
`;

  fs.writeFileSync(mainActivityPath, mainActivityCode, 'utf8');
  console.log('MainActivity.java and Android background notification receivers updated.');
}
