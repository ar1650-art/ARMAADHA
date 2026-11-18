ARMAADHA – BIRTHDAY WISHES, EVENTS & COMPLETE STUDENT PROFILES

WHAT'S INCLUDED
- Dashboard Birthday Wishes section showing birthdays today and within the next 7 days.
- Birthday cards display the student's saved profile photo when available.
- Events page for the whole class.
- Admin-only Add / Edit / Delete Event form.
- Students can view upcoming events; they cannot create, edit or delete events.
- My Profile page for every signed-in account.
- Student profiles include name, AR ID, college email, date of birth, phone, place, full address, guardian name/phone, emergency contact and blood group.
- Student accounts can edit their own contact/family fields. Name and date of birth are admin-managed.
- Admin can search, view and edit all 55 student profiles.
- Profile photo remains stored in the existing private Google Drive-backed profile-photo storage.
- Existing app features retained from the previous package: notification-only bell, Dark/Light/ARMAADHA themes, gallery/video next/previous controls, and existing fund features.

INSTALLATION
1. Extract this ZIP.
2. GitHub Pages: replace the repository's index.html with this index.html and commit/push.
3. Google Apps Script: replace the existing Code.gs with the Code.gs in this ZIP.
4. Apps Script > Deploy > Manage deployments > Edit > select New version > Deploy.
5. Keep the existing Apps Script deployment URL in config.js unchanged.
6. Refresh the app (Ctrl+Shift+R on desktop).

DATA SAFETY
- The backend creates two new sheets automatically when first used: STUDENT_PROFILES and EVENTS.
- STUDENT_PROFILES is seeded from the supplied B.Arch 2025–2030 roster only when the sheet is empty. Existing rows are not overwritten.
- Events are stored in the EVENTS sheet.
- Existing STUDENTS, PAYMENTS, EXPENSES, STUDENT_CATEGORIES, payment proofs, Script Properties, login accounts and Drive files are not cleared or reset.
- DO NOT run setupStudentCategorySystem() for this update. Do not clear any sheets or Script Properties.

PROFILE DATA
- The supplied roster provides student name, AR ID, college email, date of birth, phone and place.
- Full address, guardian details, emergency contact and blood group start blank and can be filled in by the student or admin.
- Students can edit only their own profile fields. Admin can edit all profiles.
- Birthday cards show limited public-in-app details (name, AR ID, DOB and profile photo); private contact details are not included in dashboard birthday responses.

VALIDATION
- Inline JavaScript syntax checked.
- Apps Script JavaScript syntax checked with Node.
- ZIP integrity checked after packaging.
- Live Apps Script deployment, Drive access, and real browser workflow have not been tested. Deploy the matching Code.gs as a new version before using the new backend features.
