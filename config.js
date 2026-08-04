// ============================================================
// CONFIG (PUBLIC) — this file is downloaded by every visitor,
// even before they type a password. Only put non-secret values
// here. The real Apps Script URL/key live in secure-config.js,
// which only loads AFTER a correct password.
// ============================================================

const CONFIG = {
  // How often to auto-refresh the page data, in milliseconds
  // (5 * 60 * 1000 = every 5 minutes). Set to 0 to disable auto-refresh.
  REFRESH_INTERVAL_MS: 5 * 60 * 1000,

  // Password protection for the site itself.
  // Leave SITE_PASSWORD_HASH empty ("") to disable the login screen.
  // To set/change the password: open generate-password-hash.html in your
  // browser (works offline, nothing is sent anywhere), type your password,
  // and paste BOTH values it gives you here.
  SITE_PASSWORD_SALT: "446d09b823b8145f8a5ed94c0e12b8d4",
  SITE_PASSWORD_HASH: "b7e2dc0d3187f42ead640f875f8e5a71da2ad096a72356c7aedb233552e6291d"
};
