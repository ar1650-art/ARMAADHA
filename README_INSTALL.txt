ARMAADHA — COMPLETE REPLACEMENT PACKAGE
B ARCH 2025–30 Class Fund | Updated 17 November 2026

INCLUDED FEATURES
- ARMAADHA app branding, PWA manifest and icons
- Existing student dashboard, payments, expenses and histories
- Multiple-student category assignment with Select All / Clear All
- Duplicate category assignments skipped
- Remove a category from one student
- Remove a selected category from ALL students (payment history is retained)
- Selected AR IDs only receive Full Admin Access
- Only primary admin ASIF can grant/revoke delegated admin access
- Server-side admin checks on each API request
- Student account creation and password reset (temporary password shown once)
- Student passwords stored as salted HMAC-SHA256 hashes; legacy SHA-256 hashes are upgraded after successful login
- Public Google Drive Photos & Videos gallery embedded in the app
- Existing Apps Script API URL and Google Sheet ID configured

CONNECTED SERVICES
Google Apps Script API:
https://script.google.com/macros/s/AKfycbwuFNeaBXfVLt5iZPl1vSYwquBrh6DVsKsRTS9qeUT_--LeERo75Ak_L5PQLATEoG0y/exec
Google Sheet ID:
1FYxlQy5TsMxerZrx62_xTrnJxhHjbccYH_aqvwmWhYk
Google Drive public gallery folder:
https://drive.google.com/drive/folders/16jM9g9-DaIjlQM-g86G-dAPKGMiktpNN?usp=drive_link

IMPORTANT BACKUP AND DATA SAFETY
1. Back up the current Apps Script project, GitHub Pages repository, and Google Sheet.
2. Do NOT run setupStudentCategorySystem(), initializeStudentAccounts(), setAllStudentPasswordsToUsername(), or any reset/setup helper unless you deliberately intend that action. setupStudentCategorySystem() clears category assignment data.
3. This package does not intentionally delete existing payments, expenses, students, or login records.
4. Never delete the existing spreadsheet or change its ID.

APPS SCRIPT INSTALL
1. Open the existing Apps Script project connected to the Class Fund spreadsheet.
2. Replace Code.gs with this package's Code.gs and Save.
3. The spreadsheet ID is configured as a fallback in Code.gs. If you already use Script Properties > FUND_ID, that value takes priority.
4. Student password pepper is created automatically in Script Properties as STUDENT_PASSWORD_PEPPER when a new-format student password is generated. Keep Script Properties private and preserve this value in a secure backup; losing it makes v2 password hashes unverifiable.
5. Deploy > Manage deployments > Edit the existing Web App deployment > New version > Deploy. Keep the same deployment URL and access settings.

GITHUB PAGES INSTALL
1. Replace index.html, config.js, service-worker.js, manifest.webmanifest, and icons/ in the existing GitHub Pages repository.
2. Keep the existing repository and published path.
3. Commit/push the changes, then hard refresh the site (Ctrl+Shift+R). Close and reopen the installed PWA to refresh its cache.

GOOGLE DRIVE GALLERY
The app embeds the folder using Drive's public embedded-folder view. In Google Drive, open the folder > Share > General access > Anyone with the link > Viewer. Keep in mind that anyone with the link may view public photos/videos. Some videos may open in Google Drive for playback depending on browser support.

ADMIN ACCESS
- Primary admin username: ASIF (existing admin password remains managed by the existing Apps Script password setting).
- Only ASIF can grant/revoke Admin Access.
- Grant only the required AR IDs. Admin permission is stored in ADMIN_USERS.
- Revoking access removes delegated admin rights; the student account itself remains.

PASSWORDS
- Student passwords are not stored in readable form.
- New passwords use HMAC-SHA256 with a unique salt and a server-side pepper in Script Properties.
- Existing legacy password hashes are checked during login and upgraded after a successful login.
- Admin > Students > Create / Reset Login creates a new temporary password and displays it once. Share it privately; the student should change it after login.
- The pepper is not stored in the spreadsheet. Do not expose Script Properties.

TEST BEFORE LIVE USE
- Test login, category assign/remove, remove-from-all, payment edit/remove, UPI review, delegated admin grant/revoke, password reset, and Drive gallery using test records first.
- The package has been syntax-checked locally but has NOT been deployed or live-tested against your Google account, spreadsheet, or Drive permissions.
