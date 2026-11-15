# B ARCH 2025–30 Class Fund PWA

This package uses the supplied `Code.gs` and `Index.html` as its source. The existing maroon/gold interface and embedded AB MAADHA logo are retained. The GitHub Pages frontend communicates with Google Apps Script using a JSONP bridge so it can call the existing spreadsheet functions cross-origin.

## Important before publishing
- Do **not** upload any spreadsheet ID, private API key, or password to this public repository.
- `config.js` contains only the public Apps Script Web App URL.
- The Apps Script web app must be deployed to execute as the spreadsheet owner and be accessible to anyone. The app's own password gate protects the data actions.
- The existing spreadsheet is selected by the Script Property `FUND_ID`. Do not run `createNewClassFund()` or any reset function.
- Do not run `setupStudentCategorySystem()` if you already have student category assignments you need to preserve: that function clears the `STUDENT_CATEGORIES` assignment rows and the old `CATEGORIES` contents. Only run it if you intentionally want a clean category setup.
- This PWA needs an internet connection for live data. The service worker caches the app shell only; it does not cache or queue payments offline.

## 1. Prepare the existing Apps Script project
1. Open the Apps Script project attached to your existing class fund spreadsheet.
2. Replace the contents of `Code.gs` with the `Code.gs` file in this package.
3. Keep the existing spreadsheet and its Script Property `FUND_ID` unchanged.
4. In Apps Script Project Settings > Script Properties, confirm `FUND_ID` points to the **existing** class fund spreadsheet.
5. Set a new password: temporarily add this helper at the bottom of `Code.gs`, replace the sample with your own unique password (at least 10 characters), save, and run `initializeAppPassword` once:
   ```javascript
   function initializeAppPassword() {
     setupAppPassword("REPLACE-WITH-YOUR-OWN-LONG-PASSWORD");
   }
   ```
   After it succeeds, delete the temporary helper and save again. Do not put your real password in GitHub or share it.
6. If the `Index` HTML file is not present in the Apps Script project, add the original supplied `Index.html` there (the API endpoint works independently of the HTML page, but the existing `/exec` page expects it).
7. Deploy > New deployment > Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy and authorize.
8. Copy the Web App URL ending in `/exec`.

## 2. Configure GitHub Pages
1. The supplied `config.js` is already populated with the `/exec` URL you provided. If you create a new Apps Script deployment later, update this URL.
2. Commit/upload all package files to the GitHub repository.
3. In repository Settings > Pages:
   - Build and deployment: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Save.
4. Wait for GitHub Pages to publish. Your app URL will be shown on the Pages settings screen.

## 3. Install on Android
1. Open the GitHub Pages URL in Chrome.
2. Log in using the new app password.
3. Chrome menu (⋮) > Install app / Add to Home screen.

## API bridge and security notes
The HTML bridge translates the UI method `checkLogin()` into the API action `login`; this is required because login also returns a six-hour session token. All subsequent dashboard, payment, expense, opening-balance, and category-cart calls are routed through the same JSONP bridge. The browser sends the password only during login; Apps Script creates a six-hour server-side cache token for subsequent API calls. The API uses JSONP GET requests because Apps Script web app redirects and cross-origin fetch handling can be problematic from static hosting. Do not share the password. Treat repository collaborators as trusted because they can change the frontend. For a high-sensitivity financial system, use a stronger authenticated backend with OAuth and audited server-side sessions rather than a public JSONP endpoint.

## Data preservation
Normal dashboard, payment, expense, opening-balance, and category assignment actions operate on the existing sheets. No spreadsheet is created by this package. The `setupStudentCategorySystem()` helper is destructive to category assignment rows; do not run it unless you intentionally want to reset those assignments.
