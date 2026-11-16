B ARCH 2025-30 CLASS FUND — COMPLETE REPLACEMENT PACKAGE
Includes: Code.gs, index.html, config.js, manifest.webmanifest, service-worker.js, icons.

IMPORTANT BACKUP
1. Download/backup the current Apps Script Code.gs.
2. Download/backup the current GitHub Pages repository files.
3. Do not delete or clear any Google Sheet tabs or data.

A. GOOGLE APPS SCRIPT (BACKEND)
1. Open the EXISTING Apps Script project connected to your current Class Fund spreadsheet.
2. Replace the contents of Code.gs with this package's Code.gs and Save.
3. Do NOT run setupStudentCategorySystem(), initializeStudentAccounts(), or any reset/setup helper.
4. Deploy > Manage deployments > Edit the existing Web App deployment.
5. Select New version and Deploy. Keep the same deployment and URL.
6. If Google asks for authorization, review and authorize using the existing authorized account.

B. GITHUB PAGES (FRONTEND)
1. Open the existing GitHub repository for the Class Fund website.
2. Replace index.html with this package's index.html.
3. Replace service-worker.js, manifest.webmanifest, and icons/ with the included versions.
4. Keep config.js exactly as supplied in this package; it contains the existing Apps Script API URL.
5. Commit changes to the same branch/folder used by GitHub Pages.
6. Open the website and hard refresh (Ctrl+Shift+R). If an old PWA version remains, close the installed app and refresh the website again.

C. TEST
1. Login as the primary admin.
2. Open Payment History. Test Edit and Remove with a test payment record first.
3. In Students > Admin Permission Management, select an active student AR ID and Grant Admin.
4. Sign in with that student's existing AR ID/password in a separate browser/incognito window to verify delegated admin access.
5. Revoke access and verify that the student account returns to student access.

SECURITY / DATA NOTES
- Admin permissions are stored in a separate ADMIN_USERS sheet created on first use; existing payment/student/category/login data is not cleared.
- Only primary ASIF can grant/revoke delegated admin access.
- Delegated admin role is checked server-side on each API request.
- The Edit/Remove payment buttons use delegated click handling and escaped data attributes, avoiding inline onclick quoting failures.
- This package has not been deployed or live-tested against your spreadsheet. Test carefully before wider use.
