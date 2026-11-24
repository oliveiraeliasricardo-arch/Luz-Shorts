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

    return `<activity${nextAttrs}>`;
  });

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('AndroidManifest.xml configured for Picture-in-Picture.');
}

// 3. Configure MainActivity.java with native Android Picture-in-Picture & WebView keep-alive
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

  const mainActivityCode = `package ${packageName};

import android.app.PictureInPictureParams;
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
  private volatile boolean isVideoPlaying = false;
  private volatile int pipAspectWidth = 9;
  private volatile int pipAspectHeight = 16;
  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    configureWebViewForPip();
  }

  @Override
  public void onStart() {
    super.onStart();
    configureWebViewForPip();
  }

  private void configureWebViewForPip() {
    if (getBridge() == null) return;
    WebView webView = getBridge().getWebView();
    if (webView == null) return;

    WebSettings settings = webView.getSettings();
    if (settings != null) {
      settings.setMediaPlaybackRequiresUserGesture(false);
    }
    webView.addJavascriptInterface(new PipJsBridge(), "GracaPlayNativePip");
    syncAutoEnterPipParams();
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
  public void onPause() {
    super.onPause();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode()) {
      keepWebViewActive();
      mainHandler.postDelayed(this::keepWebViewActive, 100);
    }
  }

  @Override
  public void onPictureInPictureModeChanged(
    boolean isInPictureInPictureMode,
    @NonNull Configuration newConfig
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
    notifyWebPipState(isInPictureInPictureMode);
    if (isInPictureInPictureMode) {
      keepWebViewActive();
      mainHandler.postDelayed(this::keepWebViewActive, 120);
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
}
`;

  fs.writeFileSync(mainActivityPath, mainActivityCode, 'utf8');
  console.log('MainActivity.java updated with native Android Picture-in-Picture support.');
}
