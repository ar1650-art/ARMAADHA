B ARCH 2025-30 CLASS FUND — NEW COMPLETE REPLACEMENT

This package includes the existing Class Fund features and selected-AR-ID Full Admin Access.

FEATURES
- Student-wise payment and balance dashboard
- Category assignment to multiple selected students in one operation
- Select All / Clear All for category assignment
- Duplicate same-category assignments are skipped
- Remove an individual student's category without deleting payment history
- Payment history Edit / Remove
- Admin permission management: grant/revoke Full Admin Access for selected AR IDs only
- Student account management and UPI proof verification
- PWA manifest, service worker, and app icons

ADMIN ACCESS RULES
- Only the primary admin account ASIF can grant or revoke delegated admin access.
- Only AR IDs explicitly granted access receive Full Admin Access.
- Delegated admin permissions are checked server-side for each API request.
- Revoking access removes delegated admin rights; the account remains a student account.

BACKUP FIRST
1. Back up the existing Apps Script Code.gs and GitHub Pages repository.
2. Do not delete, clear, or recreate existing spreadsheet tabs or data.

APPS SCRIPT BACKEND
1. Open the existing Apps Script project connected to the current Class Fund spreadsheet.
2. Replace Code.gs with the Code.gs in this package and save.
3. Do NOT run setupStudentCategorySystem(), initializeStudentAccounts(), or any reset/setup helper.
4. Deploy > Manage deployments > Edit the existing Web App deployment.
5. Select New version and Deploy. Keep the existing deployment and URL.

GITHUB PAGES FRONTEND
1. Open the existing GitHub repository used for Class Fund.
2. Replace index.html, service-worker.js, manifest.webmanifest, and icons/ with these files.
3. Keep config.js as supplied; it contains the existing Apps Script API URL.
4. Commit to the same branch/folder used by GitHub Pages.
5. Open the website and hard refresh (Ctrl+Shift+R). Close/reopen the installed PWA if it shows an old version.

TEST
1. Sign in as primary admin ASIF.
2. Open Admin Permission Management and select an active student AR ID.
3. Grant Admin Access.
4. Sign in with that student's existing AR ID/password in a separate browser/incognito window.
5. Confirm the student sees admin functions. Revoke access and confirm the account returns to student access.
6. Test payment edit/remove and category multi-select/remove with test data first.

DATA AND SECURITY
- Admin permissions are stored in a separate ADMIN_USERS sheet created on first use.
- Existing student, login, category, and payment data are not intentionally cleared by these changes.
- Fingerprint/passkey login is not included; the user declined the extra passkey setup.
- The package has not been deployed or live-tested against the user's spreadsheet. Back up first and test carefully.

NEW CATEGORY MANAGEMENT OPTION
- Admins can now select a category and remove that category assignment from ALL students.
- This removes only rows from STUDENT_CATEGORIES. It does NOT delete payment history.
- Student balances are recalculated after removal.
- The action is protected by the existing admin-only server authorization.
