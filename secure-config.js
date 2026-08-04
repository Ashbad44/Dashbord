// ============================================================
// SECURE CONFIG — this file only loads AFTER the visitor enters
// the correct password (see index.html). It still ends up in
// their browser once they're logged in (that's unavoidable for
// a static site), but it is no longer handed to every visitor
// on page load regardless of the password.
// ============================================================

Object.assign(CONFIG, {
  // Paste the "Web app" URL you get after deploying Code.gs
  // Looks like: https://script.google.com/macros/s/AKfycb.../exec
  APPS_SCRIPT_URL: "",

  // The same secret key you set inside Code.gs (SHEET_KEY)
  ACCESS_KEY: ""
});
