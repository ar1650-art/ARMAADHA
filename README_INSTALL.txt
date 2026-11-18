ARMAADHA – Final Role Permissions Update

ROLE RULES
1. Admin
   - Account management only: create/enable/disable student accounts, create/manage faculty accounts, and convert student roles.
   - Fund-management permissions remain as in the existing app.
   - No Work & Assignments / Academic Work access.
2. Faculty
   - Can view and manage their own assignments.
   - Can view submissions for their own assignments.
   - Only Faculty can enter/edit marks, grades, and feedback.
3. Studio Head
   - Can create/edit/delete assignments only when Subject is exactly Architectural Design (case/spacing tolerant).
   - Can view Architectural Design submissions and update submission status only.
   - Cannot edit marks, grades, or feedback.
4. Class Representative
   - Can create/edit/delete assignments for all subjects.
   - Can edit assignment deadlines through the assignment edit form (the calendar deadline changes accordingly).
   - Can view all subjects' submissions and update submission status only.
   - Cannot edit marks, grades, or faculty feedback.
5. Student
   - Can view open assignments and submit PDF, images, DOC/DOCX.
   - Can view their own submission status, marks and feedback.

CALENDAR
- Monthly calendar shows assignment due dates and student submission dates.
- Studio Head sees only Architectural Design items.
- Class Representative sees all subjects.
- Faculty sees own assignments and their submissions.
- Students see open assignments and their own submissions.
- Calendar deadlines are edited using the assignment's “Edit / Change Deadline” action. Saving the assignment updates the calendar date.

INSTALL
1. Back up your current GitHub index.html and Apps Script Code.gs.
2. Replace the GitHub repository's index.html with ARMAADHA_Role_Permissions_Calendar.html (rename it to index.html in GitHub).
3. Replace the existing Apps Script Code.gs with ARMAADHA_Role_Permissions_Code.gs (rename it to Code.gs).
4. Save and deploy the Apps Script project as a new version, keeping the same web app URL.
5. Keep your existing config.js unchanged.
6. Test each role using separate accounts. In particular, verify:
   - Admin cannot open Work & Assignments.
   - Studio Head is limited to Architectural Design.
   - Class Rep can manage all subjects.
   - Faculty can grade only their own assignment submissions.
   - Existing submissions remain after assignment soft-delete.

IMPORTANT
This is a code update package, not a live deployment. It has not been connected to or tested against your live Google Sheet / Apps Script deployment. The backend applies permissions server-side as well as hiding unauthorized UI controls. Back up the existing files before replacing them.
