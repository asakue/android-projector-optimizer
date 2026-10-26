// Security & Reliability Validator for Android Projector Optimizer

const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const ALLOWED_DOWNLOAD_DOMAINS = [
  'github.com',
  'objects.githubusercontent.com',
  'github-releases.githubusercontent.com',
  'gitlab.com',
  'aptoide.org',
  'aptoide.com',
  'f-droid.org'
];

// Critical System Packages that must NEVER be disabled or uninstalled (Brick-Proof Whitelist)
const PROTECTED_SYSTEM_PACKAGES = new Set([
  'android',
  'com.android.systemui',
  'com.android.settings',
  'com.android.settings.intelligence',
  'com.android.providers.settings',
  'com.android.packageinstaller',
  'com.google.android.packageinstaller',
  'com.android.inputmethod.latin',
  'com.google.android.inputmethod.latin',
  'com.android.bluetooth',
  'com.android.server.telecom',
  'com.android.keychain',
  'com.android.shell',
  'com.android.systemui.res',
  // Projector Optical & Display Hardware Stack
  'com.softwinner.tcorrection', // Keystone / Trapezoid hardware correction
  'com.droidlogic.tcorrection',
  'com.droidlogic.tvinput',     // HDMI / AV video input framework
  'com.master.accessibility',   // Virtual remote control cursor (NetflixMouse)
  'com.jm.jmlauncher',          // Chinese firmware boot coordinator
  'com.master.t972',            // Primary projector launcher
  'com.bozee.usbdisplay',       // Screen mirroring daemon
  'com.droidlogic.miracast'     // Wireless display receiver
]);

const PROTECTED_PATTERNS = [
  /keystone/i,
  /correction/i,
  /trapezoid/i,
  /projector/i,
  /optics/i,
  /focus/i,
  /motor/i,
  /tvinput/i,
  /miracast/i,
  /inputmethod/i,
  /keyboard/i
];

function isValidIp(ip) {
  if (typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  return IP_REGEX.test(trimmed);
}

function isValidPort(port) {
  const num = parseInt(port, 10);
  return !isNaN(num) && num >= 1 && num <= 65535;
}

function isPackageProtected(packageId) {
  if (!packageId || typeof packageId !== 'string') return true;
  const cleanId = packageId.trim().toLowerCase();

  // Check exact blacklist
  if (PROTECTED_SYSTEM_PACKAGES.has(cleanId)) {
    return true;
  }

  // Check sensitive hardware/optical driver patterns
  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.test(cleanId)) {
      // Don't accidentally protect standard bloat markets
      if (cleanId.includes('market') || cleanId.includes('adware')) continue;
      return true;
    }
  }

  return false;
}

function isSafeDownloadUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOWNLOAD_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch (_) {
    return false;
  }
}

module.exports = {
  isValidIp,
  isValidPort,
  isPackageProtected,
  isSafeDownloadUrl
};
