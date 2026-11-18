ARMAADHA – Notifications Only

Change:
- Notification bell panel now shows ONLY actual app notifications.
- Removed the Pending Collection, Payment History, and Photos & Videos shortcut tabs/items from the notification panel.
- Loads notifications for the signed-in user's role/account from the existing Apps Script notification backend.
- Shows unread indicator, timestamps, and Mark read action.
- Refreshes when the bell is opened and polls every 45 seconds while signed in.

Install:
1. Extract this ZIP.
2. Replace index.html in the GitHub Pages repository with this index.html.
3. Commit/push changes and hard refresh the site (Ctrl+Shift+R).
4. Keep Code.gs and config.js unchanged. This package uses the notification API actions already present in the bundled Code.gs; if the live Apps Script deployment does not yet contain those actions, deploy the matching Code.gs from this ZIP as a new version. Do not run any setup/reset functions and do not clear Script Properties or spreadsheet data.

Validation: inline JavaScript syntax checked. Live Apps Script/Drive/browser behavior not tested.
