ARMAADHA — REAL IN-APP NOTIFICATIONS

This package adds event-triggered notifications stored in Apps Script Properties and shown in the notification bell. The app polls for new notifications every 45 seconds while open.

Events:
- Admin receives a notification when a student payment is recorded.
- Admin receives a notification when a new expense is added.
- Admin receives a notification when a student submits UPI payment proof.
- Student receives a notification when a category is assigned.
- Student receives a notification when their UPI payment proof is approved or rejected.

Notifications are private to the matching role/user, have read/unread status and display timestamps. Up to 400 recent notifications are retained globally; each user sees up to 50 matching notifications.

INSTALL
1. Replace index.html in GitHub Pages and commit.
2. Replace Code.gs in Apps Script and save.
3. Deploy > Manage deployments > Edit > New version > Deploy.
4. Hard refresh the site (Ctrl+Shift+R).

NOTE
- These are in-app notifications while the web app is open; this package does not implement push notifications when the app/browser is closed.
- Existing spreadsheet/payment/student data is not reset.
- No setup/reset function is required.
