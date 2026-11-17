// B ARCH 2025-30 CLASS FUND MANAGEMENT
// Student-wise Category + Add All Students + Cart
// Existing PAYMENTS / EXPENSES / opening balance history are preserved.

const STUDENTS = [
"ARUN A","AYISHA NALAKATH","AYISHA RIDHA E","DIVANI PP",
"FAHIM M FAISAL","FARSEENA V","FATHIMA BAYAN","FATHIMA HAIZA CMK",
"FATHIMA HAMDAH P","FATHIMA HIBA PE","FATHIMA NASRIN K",
"FATHIMA NIDHA K P","FATHIMA RASHFIN TA","FATHIMA RENA KC",
"FATHIMA RIZA TE","FATHIMATHUL ASNA M","HIBA SHARIN KT",
"JAZL AHMAD PM","KADEEJA JOUNA C","LIYA EP","LIYA MEHJABIN",
"MEERA U","MINHA K","MOHAMMED BASITH","MUHAMMED ADEEB VM",
"MUHAMMED ARSHAK K","MUHAMMED ASIF PARI","MUHAMMED LIYAN P",
"MUHAMMED NAVEDUL ANJOOM AT","MUHAMMED RAYAN M","MUHAMMED SHAN K",
"NADHA MEHJABIN V","NAFIDA VP","NAJA FATHIMA","NAJMA V",
"NAMITHA M","NASHVA PV","RENA MEHRIN AM","RIMA FATHIMA",
"RINSHA SHANAVAS","RIYA FIBIN P","SANA N",
"SHAFRIN RAHMAN ALYATHODI","SHAHEEM NADUTHODI",
"SHAIMA SHIREEN K","SHEBA IQBAL","SHEMIL MUHAMMED",
"SHINA FATHIMA CK","FATHIMA JUNNA K.K","FATHIMA SHAHNA M",
"JYOTSNA RAJ","RAHMA K.","SANA K.","SHAHDHA A.K","ZENHA FATHIMA"
];
const AUTHORIZED_EMAIL = "ar1650@ekc.edu.in";

/**
 * Web app entry:
 * - Normal browser visits show the legacy Apps Script UI (if Index.html exists).
 * - ?api=1 enables the JSONP bridge used by the GitHub Pages PWA.
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.api === '1') return handlePwaApi_(e);
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ARMAADHA')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}


function pushAppNotification_(recipient, role, title, message, type) {
  var props = PropertiesService.getScriptProperties();
  var key = 'ARMAADHA_NOTIFICATIONS';
  var rows = [];
  try { rows = JSON.parse(props.getProperty(key) || '[]'); } catch (e) { rows = []; }
  rows.unshift({
    id: Utilities.getUuid(), recipient: String(recipient || '*'),
    role: String(role || 'admin'), title: String(title || 'Notification'),
    message: String(message || ''), type: String(type || 'info'),
    createdAt: new Date().toISOString(), read: false
  });
  if (rows.length > 400) rows = rows.slice(0, 400);
  props.setProperty(key, JSON.stringify(rows));
}
function getAppNotifications_(session) {
  var rows = [];
  try { rows = JSON.parse(PropertiesService.getScriptProperties().getProperty('ARMAADHA_NOTIFICATIONS') || '[]'); } catch (e) {}
  return rows.filter(function(n) {
    return n.role === session.role &&
      (n.recipient === '*' || String(n.recipient).toUpperCase() === String(session.username).toUpperCase());
  }).slice(0, 50);
}
function markAppNotificationRead_(session, id) {
  var props = PropertiesService.getScriptProperties(), key = 'ARMAADHA_NOTIFICATIONS';
  var rows = [];
  try { rows = JSON.parse(props.getProperty(key) || '[]'); } catch (e) {}
  rows.forEach(function(n) {
    if (n.id === String(id) &&
      (n.recipient === '*' || String(n.recipient).toUpperCase() === String(session.username).toUpperCase()) &&
      n.role === session.role) n.read = true;
  });
  props.setProperty(key, JSON.stringify(rows));
  return {ok:true};
}

function handlePwaApi_(e) {
  var callback = String((e.parameter && e.parameter.callback) || '');
  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput('/* invalid callback */').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  var result;
  try {
    var action = String(e.parameter.action || '');
    var payloadText = Utilities.newBlob(Utilities.base64DecodeWebSafe(String(e.parameter.payload || ''))).getDataAsString();
    var args = payloadText ? JSON.parse(payloadText) : [];
    if (!Array.isArray(args)) throw new Error('Invalid request payload.');
    if (action === 'logout') {
      var logoutToken = String(e.parameter.token || '');
      if (logoutToken) {
        CacheService.getScriptCache().remove('PWA_SESSION_' + logoutToken);
        var logoutDigest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, logoutToken)).replace(/=+$/g, '');
        PropertiesService.getScriptProperties().deleteProperty('PWA_REMEMBER_' + logoutDigest);
      }
      result = { ok: true };
    } else if (action === 'logout') {
      var logoutToken = String(e.parameter.token || '');
      if (logoutToken) {
        CacheService.getScriptCache().remove('PWA_SESSION_' + logoutToken);
        var logoutDigest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, logoutToken)).replace(/=+$/g, '');
        PropertiesService.getScriptProperties().deleteProperty('PWA_REMEMBER_' + logoutDigest);
      }
      result = { ok: true };
    } else if (action === 'login') {
      var auth = loginAccount_(String(args[0] || ''), String(args[1] || ''));
      if (!auth) result = false;
      else {
        var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
        CacheService.getScriptCache().put('PWA_SESSION_' + token, JSON.stringify(auth), 21600);
        var tokenDigest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).replace(/=+$/g, '');
        PropertiesService.getScriptProperties().setProperty('PWA_REMEMBER_' + tokenDigest, JSON.stringify({ auth: auth }));
        result = { ok: true, token: token, role: auth.role, name: auth.name, username: auth.username, mustChangePassword: !!auth.mustChangePassword };
      }
    } else {
      var token = String(e.parameter.token || '');
      var sessionRaw = token ? CacheService.getScriptCache().get('PWA_SESSION_' + token) : null;
      if (!sessionRaw && token) {
        var tokenDigest = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).replace(/=+$/g, '');
        var rememberedRaw = PropertiesService.getScriptProperties().getProperty('PWA_REMEMBER_' + tokenDigest);
        if (rememberedRaw) {
          var remembered = JSON.parse(rememberedRaw);
          if (remembered.auth) {
            sessionRaw = JSON.stringify(remembered.auth);
            CacheService.getScriptCache().put('PWA_SESSION_' + token, sessionRaw, 21600);
          } else {
            PropertiesService.getScriptProperties().deleteProperty('PWA_REMEMBER_' + tokenDigest);
          }
        }
      }
      if (!sessionRaw) throw new Error('Session expired. Please log in again.');
      var session = JSON.parse(sessionRaw);
      // Re-check the current role on every request so a revoked admin loses access immediately.
      session.role = isPrimaryAdmin_(session.username) ? 'admin' : (isDelegatedAdmin_(session.username) ? 'admin' : 'student');
      var primaryAdminOnly = ['grantAdminAccess','revokeAdminAccess','listAdminUsers'];
      if (primaryAdminOnly.indexOf(action) >= 0 && !isPrimaryAdmin_(session.username)) throw new Error('Only the primary admin can manage admin permissions.');
      var adminOnly = ['updateOpeningBalance','addPayment','addExpense','saveCategoryAssignments','removeStudentCategory','removeCategoryFromAllStudents','createStudentAccount','setStudentAccountActive','listStudentAccounts','listPendingUpiPayments','approveUpiPayment','rejectUpiPayment','editPayment','deletePayment','grantAdminAccess','revokeAdminAccess','listAdminUsers'];
      if (adminOnly.indexOf(action) >= 0 && session.role !== 'admin') throw new Error('Admin access required.');
      if (action === 'getAppNotifications') result = getAppNotifications_(session);
      else if (action === 'markAppNotificationRead') result = markAppNotificationRead_(session, args[0]);
      else if (action === 'changeMyPassword') {
         result = changeMyPassword_(session, String(args[0] || ''), String(args[1] || ''));
         CacheService.getScriptCache().remove('PWA_SESSION_' + token);
       }
       else if (session.role === 'student' && studentMustChangePassword_(session.username)) {
         throw new Error('Change your temporary password before continuing.');
       }
       else if (action === 'getDashboard' || action === 'refreshDashboard') result = getDashboardForSession_(session);
      else {
        var handlers = {
          updateOpeningBalance: updateOpeningBalance,
          addPayment: addPayment,
          addExpense: addExpense,
          saveCategoryAssignments: saveCategoryAssignments,
          removeStudentCategory: removeStudentCategory,
          removeCategoryFromAllStudents: removeCategoryFromAllStudents,
          createStudentAccount: createStudentAccount,
          setStudentAccountActive: setStudentAccountActive,
          listStudentAccounts: listStudentAccounts,
          grantAdminAccess: grantAdminAccess,
          revokeAdminAccess: revokeAdminAccess,
          listAdminUsers: listAdminUsers,
          listDriveGallery: listDriveGallery,
          submitUpiPayment: function(category, amount, utr, note){ return submitUpiPayment_(session, category, amount, utr, note); },
          listPendingUpiPayments: listPendingUpiPayments,
          approveUpiPayment: approveUpiPayment,
          rejectUpiPayment: rejectUpiPayment,
          editPayment: editPayment,
          deletePayment: deletePayment
        };
        if (!Object.prototype.hasOwnProperty.call(handlers, action)) throw new Error('Action not allowed.');
        result = handlers[action].apply(null, args);
      }
    }
  } catch (err) { result = { __error: String(err && err.message ? err.message : err) }; }
  var json = JSON.stringify(result).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Paginated gallery: each request returns a small batch to avoid Apps Script timeouts.
function listDriveGallery(folderId, filePageToken, folderPageToken) {
  const rootId = '16jM9g9-DaIjlQM-g86G-dAPKGMiktpNN';
  const currentId = String(folderId || rootId);
  const folder = DriveApp.getFolderById(currentId);
  const PAGE_SIZE = 60;
  const FOLDER_PAGE_SIZE = 30;
  const MAX_SCAN = 300;

  const fileIt = filePageToken
    ? DriveApp.continueFileIterator(filePageToken)
    : folder.getFiles();
  const folderIt = folderPageToken
    ? DriveApp.continueFolderIterator(folderPageToken)
    : folder.getFolders();

  const files = [];
  const folders = [];
  let scanned = 0;

  while (fileIt.hasNext() && scanned < MAX_SCAN && files.length < PAGE_SIZE) {
    const f = fileIt.next();
    scanned++;
    const mime = f.getMimeType();
    if (mime.indexOf('image/') !== 0 && mime.indexOf('video/') !== 0) continue;
    const id = f.getId();
    files.push({
      id: id,
      name: f.getName(),
      mimeType: mime,
      kind: mime.indexOf('video/') === 0 ? 'video' : 'image',
      modified: f.getLastUpdated().toISOString(),
      folderPath: folder.getName(),
      thumbnail: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w600',
      preview: 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/preview',
      openUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id)
    });
  }

  let folderScanned = 0;
  while (folderIt.hasNext() && folderScanned < FOLDER_PAGE_SIZE) {
    const sub = folderIt.next();
    folders.push({
      id: sub.getId(),
      name: sub.getName(),
      kind: 'folder',
      modified: '',
      thumbnail: '',
      path: folder.getName()
    });
    folderScanned++;
  }

  return {
    files: files,
    folders: folders,
    currentFolder: { id: currentId, name: folder.getName() },
    rootId: rootId,
    count: files.length,
    nextFilePageToken: fileIt.hasNext() ? fileIt.getContinuationToken() : '',
    nextFolderPageToken: folderIt.hasNext() ? folderIt.getContinuationToken() : '',
    truncated: fileIt.hasNext(),
    foldersTruncated: folderIt.hasNext()
  };
}

const FUND_ID_FALLBACK_ = '1FYxlQy5TsMxerZrx62_xTrnJxhHjbccYH_aqvwmWhYk';
function getSS_() {
  const id = PropertiesService.getScriptProperties().getProperty('FUND_ID') || FUND_ID_FALLBACK_;
  return SpreadsheetApp.openById(id);
}

function ensureStudentCategoriesSheet_() {
  const ss=getSS_();
  let sh=ss.getSheetByName('STUDENT_CATEGORIES');
  if (!sh) {
    sh=ss.insertSheet('STUDENT_CATEGORIES');
    sh.appendRow(['Student ID','Student Name','Category','Target Amount','Created At']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Run ONCE after replacing Code.gs. This removes the old shared category list,
// creates the student-wise assignment sheet, and DOES NOT delete payment history.
function setupStudentCategorySystem() {
  const ss=getSS_();
  let cat=ss.getSheetByName('CATEGORIES');
  if (!cat) cat=ss.insertSheet('CATEGORIES');
  cat.clearContents();
  cat.getRange(1,1,1,2).setValues([['Category','Target Amount']]);
  cat.setFrozenRows(1);
  const sh=ensureStudentCategoriesSheet_();
  sh.clearContents();
  sh.getRange(1,1,1,5).setValues([['Student ID','Student Name','Category','Target Amount','Created At']]);
  sh.setFrozenRows(1);
  return 'Setup complete. Old shared categories cleared; payment and expense history preserved.';
}

function getStudentRows_() {
  const sh=getSS_().getSheetByName('STUDENTS');
  if (!sh || sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,4).getValues().map((r,i)=>({
    id:Number(r[0])||i+1, name:String(r[1]||''), paid:Number(r[2])||0, pending:Number(r[3])||0
  })).filter(s=>s.name);
}

function getAssignments_() {
  const sh=ensureStudentCategoriesSheet_();
  if (sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,5).getValues().filter(r=>r[0]!=='' && r[2]).map(r=>({
    id:Number(r[0]), student:String(r[1]), name:String(r[2]), target:Number(r[3])||0
  }));
}

function getCategories() {
  const seen={};
  getAssignments_().forEach(a=>{ if(!seen[a.name]) seen[a.name]=a.target; });
  return Object.keys(seen).map(name=>({name,target:seen[name]}));
}

// Cart items: [{studentId: 1 or 'ALL', category:'...', target:100}]
function saveCategoryAssignments(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Cart is empty.');
  const students=getStudentRows_();
  const sh=ensureStudentCategoriesSheet_();
  const existing=getAssignments_();
  const keys={};
  existing.forEach(a=>keys[a.id+'|'+a.name.toLowerCase()]=true);
  const rows=[];
  items.forEach(item=>{
    const category=String(item.category||'').trim();
    const target=Number(item.target);
    if(!category) throw new Error('Category name is required.');
    if(!isFinite(target)||target<0) throw new Error('Invalid target amount for '+category);
    let selected;
    if(String(item.studentId).toUpperCase()==='ALL') selected=students;
    else selected=students.filter(s=>s.id===Number(item.studentId));
    if(!selected.length) throw new Error('Select a valid student for '+category);
    selected.forEach(s=>{
      const key=s.id+'|'+category.toLowerCase();
      if(!keys[key]) { rows.push([s.id,s.name,category,target,new Date()]); keys[key]=true; }
    });
  });
  if(rows.length) sh.getRange(sh.getLastRow()+1,1,rows.length,5).setValues(rows);
  rows.forEach(function(r){ pushAppNotification_(String(r[0]),'student','New category assigned',r[2]+' category assigned. Target ₹'+r[3]+'.','category'); });
  updateAllStudentBalances_();
  return {success:true,added:rows.length,message:rows.length+' student-category assignment(s) saved.'};
}

// Remove only the selected student's category assignment. Payment history is never touched.
function removeStudentCategory(studentId, categoryName) {
  const id = Number(studentId);
  const category = String(categoryName || '').trim();
  if (!id || !category) throw new Error('Student and category are required.');
  const sh = ensureStudentCategoriesSheet_();
  if (sh.getLastRow() < 2) return {success:true, message:'No category assignment found.'};
  const values = sh.getRange(2,1,sh.getLastRow()-1,5).getValues();
  let removed = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if (Number(values[i][0]) === id && String(values[i][2] || '').trim().toLowerCase() === category.toLowerCase()) {
      sh.deleteRow(i + 2); removed++;
    }
  }
  updateAllStudentBalances_();
  return {success:true, removed:removed, message: removed ? 'Category removed. Payment history is unchanged.' : 'Assignment not found.'};
}

// Remove one category assignment from every student. Payment history is never deleted.
function removeCategoryFromAllStudents(categoryName) {
  const category = String(categoryName || '').trim();
  if (!category) throw new Error('Select a category to remove.');
  const sh = ensureStudentCategoriesSheet_();
  if (sh.getLastRow() < 2) return {success:true, removed:0, message:'No category assignments found.'};
  const values = sh.getRange(2,1,sh.getLastRow()-1,5).getValues();
  let removed = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][2] || '').trim().toLowerCase() === category.toLowerCase()) {
      sh.deleteRow(i + 2);
      removed++;
    }
  }
  updateAllStudentBalances_();
  return {success:true, removed:removed, message: removed + ' assignment(s) of "' + category + '" removed from all students. Payment history is unchanged.'};
}

function updateAllStudentBalances_() {
  const ss=getSS_();
  const studentSheet=ss.getSheetByName('STUDENTS');
  const paymentSheet=ss.getSheetByName('PAYMENTS');
  const students=studentSheet.getDataRange().getValues();
  const payments=paymentSheet.getDataRange().getValues();
  const assignments=getAssignments_();
  const paidByStudent={};
  const targetByStudent={};
  payments.slice(1).forEach(r=>{ const n=String(r[2]||''); paidByStudent[n]=(paidByStudent[n]||0)+(Number(r[4])||0); });
  assignments.forEach(a=>{targetByStudent[a.student]=(targetByStudent[a.student]||0)+a.target;});
  const updates=students.slice(1).map(r=>{
    const name=String(r[1]||''); const paid=paidByStudent[name]||0;
    return [paid,Math.max(0,(targetByStudent[name]||0)-paid)];
  });
  if(updates.length) studentSheet.getRange(2,3,updates.length,2).setValues(updates);
}

function getDashboard() {
  const ss=getSS_();
  const studentSheet=ss.getSheetByName('STUDENTS');
  const paymentSheet=ss.getSheetByName('PAYMENTS');
  const expenseSheet=ss.getSheetByName('EXPENSES');
  const settings=ss.getSheetByName('SETTINGS');
  updateAllStudentBalances_();
  const studentRows=studentSheet.getDataRange().getValues();
  const payments=paymentSheet.getDataRange().getValues();
  const expenses=expenseSheet.getDataRange().getValues();
  const opening=Number(settings.getRange('B2').getValue())||0;
  const paid=payments.slice(1).reduce((s,r)=>s+(Number(r[4])||0),0);
  const spent=expenses.slice(1).reduce((s,r)=>s+(Number(r[3])||0),0);
  const assignments=getAssignments_();
  const students=studentRows.slice(1).map((r,i)=>{
    const id=Number(r[0])||i+1, name=String(r[1]||'');
    const categories=assignments.filter(a=>a.id===id).map(a=>{
      const categoryPaid=payments.slice(1).filter(p=>String(p[2])===name && String(p[3])===a.name).reduce((s,p)=>s+(Number(p[4])||0),0);
      return {name:a.name,target:a.target,paid:categoryPaid,pending:Math.max(0,a.target-categoryPaid)};
    });
    return {id,name,paid:Number(r[2])||0,pending:Number(r[3])||0,categories};
  }).filter(s=>s.name);
  return {opening,collection:paid,expenses:spent,balance:opening+paid-spent,
    pending:students.reduce((s,x)=>s+x.pending,0),students,categories:getCategories(),
    payments:payments.slice(1).map((r,i)=>({rowIndex:i+2,date:r[1],student:r[2],category:r[3],amount:r[4],note:r[5],mode:r[6]||''})).reverse().slice(0,200),
    expenseList:expenses.slice(1).reverse().slice(0,200).map(r=>({date:r[1],description:r[2],amount:r[3],note:r[4]}))};
}

function addPayment(studentId,category,amount,note,mode,upiAmount,cashAmount) {
  amount=Number(amount); const id=Number(studentId);
  mode=String(mode||'UPI');
  upiAmount=Number(upiAmount)||0; cashAmount=Number(cashAmount)||0;
  if(!['UPI','Cash','Both'].includes(mode)) throw new Error('Select a valid payment mode.');
  if(mode==='UPI'){ upiAmount=amount; cashAmount=0; }
  if(mode==='Cash'){ cashAmount=amount; upiAmount=0; }
  if(mode==='Both' && Math.abs((upiAmount+cashAmount)-amount)>0.01) throw new Error('UPI + Cash amount does not match total amount.');
  if(!isFinite(amount)||amount<=0||upiAmount<0||cashAmount<0) throw new Error('Enter valid payment amount.');
  const lock=LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const ss=getSS_(); const students=getStudentRows_();
    const student=students.find(s=>s.id===id);
    if(!student) throw new Error('Student not found.');
    const assignment=getAssignments_().find(a=>a.id===id && a.name===String(category));
    if(!assignment) throw new Error('This category is not assigned to the selected student.');
    const already=ss.getSheetByName('PAYMENTS').getDataRange().getValues().slice(1)
      .filter(r=>String(r[2])===student.name && String(r[3])===String(category))
      .reduce((s,r)=>s+(Number(r[4])||0),0);
    if(already+amount>assignment.target) throw new Error('Payment exceeds this category pending amount.');
    const paymentSheet=ss.getSheetByName('PAYMENTS');
    if(paymentSheet.getLastColumn()<7) paymentSheet.getRange(1,7).setValue('Payment Mode');
    if(paymentSheet.getLastColumn()<8) paymentSheet.getRange(1,8).setValue('UPI Amount');
    if(paymentSheet.getLastColumn()<9) paymentSheet.getRange(1,9).setValue('Cash Amount');
    paymentSheet.appendRow([new Date(),new Date(),student.name,category,amount,note||'',mode,upiAmount,cashAmount]);
    pushAppNotification_('*','admin','Student payment recorded',student.name+' paid ₹'+amount+' for '+category+'.','payment');
    updateAllStudentBalances_(); SpreadsheetApp.flush(); return getDashboard();
  } finally {lock.releaseLock();}
}
// Admin-only correction of an existing payment amount and note. Keeps the original row/date/student/category/mode.
function editPayment(rowIndex, newAmount, newNote){
  const row=Number(rowIndex), amount=Number(newAmount);
  if(!Number.isInteger(row)||row<2) throw new Error('Invalid payment record.');
  if(!isFinite(amount)||amount<=0) throw new Error('Enter a valid payment amount.');
  const lock=LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const sh=getSS_().getSheetByName('PAYMENTS');
    if(!sh||row>sh.getLastRow()) throw new Error('Payment record not found.');
    const vals=sh.getRange(row,1,1,Math.max(9,sh.getLastColumn())).getValues()[0];
    const studentName=String(vals[2]||''), category=String(vals[3]||'');
    const student=getStudentRows_().find(s=>normalizeStudentName_(s.name)===normalizeStudentName_(studentName));
    if(!student) throw new Error('Student record not found.');
    const assignment=getAssignments_().find(a=>a.id===student.id&&a.name===category);
    if(!assignment) throw new Error('Assigned category not found.');
    const all=sh.getDataRange().getValues();
    const paidOther=all.slice(1).reduce((sum,r,i)=>sum+(i+2===row?0:(String(r[2])===studentName&&String(r[3])===category?(Number(r[4])||0):0)),0);
    if(paidOther+amount>assignment.target+0.001) throw new Error('Edited payment exceeds the category target.');
    sh.getRange(row,5).setValue(amount);
    sh.getRange(row,6).setValue(String(newNote||''));
    updateAllStudentBalances_(); SpreadsheetApp.flush();
    return {success:true,message:'Payment updated.',dashboard:getDashboard()};
  } finally { lock.releaseLock(); }
}

// Admin-only removal of an incorrect/duplicate payment record. Recalculates student balances.
function deletePayment(rowIndex){
  // Called only through handlePwaApi_ after its admin-session check.
  const row=Number(rowIndex);
  if(!Number.isInteger(row)||row<2) throw new Error('Invalid payment record. Refresh the dashboard and try again.');
  const lock=LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh=getSS_().getSheetByName('PAYMENTS');
    if(!sh) throw new Error('PAYMENTS sheet not found.');
    if(row>sh.getLastRow()) throw new Error('Payment record not found. Refresh the dashboard and try again.');
    const record=sh.getRange(row,1,1,Math.max(6,sh.getLastColumn())).getValues()[0];
    const studentName=String(record[2]||'');
    const category=String(record[3]||'');
    const amount=Number(record[4])||0;
    if(!studentName||!category||amount<=0) throw new Error('Payment record is empty or invalid.');
    sh.deleteRow(row);
    updateAllStudentBalances_();
    SpreadsheetApp.flush();
    return {success:true,message:'Payment removed successfully. Student paid and pending totals have been recalculated.',removed:{student:studentName,category:category,amount:amount}};
  } finally {
    lock.releaseLock();
  }
}

// Manual UPI proof workflow. Existing PAYMENT rows are written only after admin approval.
function ensureUpiSubmissionsSheet_(){
  const ss=getSS_(); let sh=ss.getSheetByName('UPI SUBMISSIONS');
  if(!sh){ sh=ss.insertSheet('UPI SUBMISSIONS'); sh.getRange(1,1,1,11).setValues([['Submission ID','Submitted At','Student Name','Student AR ID','Category','Amount','UTR / Transaction ID','Note','Status','Reviewed At','Admin Note']]); sh.setFrozenRows(1); }
  return sh;
}
function submitUpiPayment_(session, category, amount, utr, note){
  if(session.role!=='student') throw new Error('Only student accounts can submit UPI proof.');
  category=String(category||'').trim(); amount=Number(amount); utr=String(utr||'').trim(); note=String(note||'').trim();
  if(!category) throw new Error('Select a category.');
  if(!isFinite(amount)||amount<=0) throw new Error('Enter a valid amount.');
  if(utr.length<8 || utr.length>40 || !/^[A-Za-z0-9-]+$/.test(utr)) throw new Error('Enter a valid UTR / transaction ID (8–40 letters or numbers).');
  const dash=getDashboardForSession_(session); const student=dash.students[0];
  if(!student) throw new Error('Student record not found.');
  const assignment=(student.categories||[]).find(c=>c.name===category);
  if(!assignment) throw new Error('This category is not assigned to you.');
  if(amount>Number(assignment.pending||0)+0.001) throw new Error('Amount exceeds the current pending amount. Refresh and try again.');
  const sh=ensureUpiSubmissionsSheet_();
  const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
  if(rows.some(r=>String(r[6]).toLowerCase()===utr.toLowerCase() && String(r[8]).toUpperCase()!=='REJECTED')) throw new Error('This transaction ID has already been submitted.');
  const id=Utilities.getUuid();
  sh.appendRow([id,new Date(),student.name,session.username,category,amount,utr,note,'PENDING','','']);
  pushAppNotification_('*','admin','UPI payment proof submitted',student.name+' submitted ₹'+amount+' for '+category+'.','upi');
  return {ok:true,message:'Payment proof submitted. It will be marked Paid after admin verification.'};
}
function listPendingUpiPayments(){
  const sh=ensureUpiSubmissionsSheet_(); if(sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,11).getValues().filter(r=>String(r[8]).toUpperCase()==='PENDING').map(r=>({id:String(r[0]),submittedAt:r[1],student:r[2],arid:r[3],category:r[4],amount:Number(r[5]),utr:r[6],note:r[7]})).reverse();
}
function approveUpiPayment(id, adminNote){
  id=String(id||'');
  {
    const sh=ensureUpiSubmissionsSheet_(); const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
    const idx=rows.findIndex(r=>String(r[0])===id); if(idx<0)throw new Error('Submission not found.');
    const r=rows[idx]; if(String(r[8]).toUpperCase()!=='PENDING')throw new Error('This submission has already been reviewed.');
    // Claim the request before writing the payment, preventing double approval clicks.
    sh.getRange(idx+2,9).setValue('PROCESSING');
    try {
      const studentRows=getDashboard().students; const student=studentRows.find(x=>normalizeStudentName_(x.name)===normalizeStudentName_(r[2]));
      if(!student)throw new Error('Student record not found.');
      addPayment(student.id,String(r[4]),Number(r[5]),'UTR: '+String(r[6])+(r[7]?' | '+r[7]:''),'UPI',Number(r[5]),0);
      sh.getRange(idx+2,9,1,3).setValues([['APPROVED',new Date(),String(adminNote||'Approved by admin')]]);
      pushAppNotification_(String(r[3]),'student','Payment approved','Your ₹'+r[5]+' payment for '+r[4]+' has been approved.','approved');
      return {ok:true,message:'Approved and recorded as Paid.'};
    } catch(err) { sh.getRange(idx+2,9).setValue('PENDING'); throw err; }
  }
}
function rejectUpiPayment(id, adminNote){
  const sh=ensureUpiSubmissionsSheet_(); const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,11).getValues():[];
  const idx=rows.findIndex(r=>String(r[0])===String(id)); if(idx<0)throw new Error('Submission not found.');
  if(String(rows[idx][8]).toUpperCase()!=='PENDING')throw new Error('This submission has already been reviewed.');
  sh.getRange(idx+2,9,1,3).setValues([['REJECTED',new Date(),String(adminNote||'Rejected by admin')]]);
  pushAppNotification_(String(rows[idx][3]),'student','Payment rejected','Your payment proof for '+rows[idx][4]+' was rejected. '+String(adminNote||''),'rejected');
  return {ok:true,message:'Submission rejected.'};
}

function updateOpeningBalance(amount,note) {
  amount=Number(amount); if(!isFinite(amount)||amount<0) throw new Error('Enter valid opening balance.');
  const ss=getSS_(), sh=ss.getSheetByName('SETTINGS'), log=ss.getSheetByName('BALANCE HISTORY');
  const old=Number(sh.getRange('B2').getValue())||0; sh.getRange('B2').setValue(amount);
  if(log) log.appendRow([new Date(),old,amount,note||'Opening balance updated']);
  return getDashboard();
}

function addExpense(description,amount,note) {
  description=String(description||'').trim(); amount=Number(amount);
  if(!description||!isFinite(amount)||amount<=0) throw new Error('Enter valid expense details.');
  getSS_().getSheetByName('EXPENSES').appendRow([new Date(),new Date(),description,amount,note||'']);
  pushAppNotification_('*','admin','New expense added',description+' — ₹'+amount+'.','expense');
  return getDashboard();
}

function refreshDashboard() { return getDashboard(); }
function setupAppPassword(password) {
  password = String(password || '');
  if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,password)
    .map(b=>(b+256).toString(16).slice(-2)).join('');
  PropertiesService.getScriptProperties().setProperty('APP_PASSWORD_HASH',hash);
  return 'Password saved successfully';
}
function checkLogin(password) {
  const email=(Session.getActiveUser().getEmail()||'').toLowerCase().trim();
  if(email===AUTHORIZED_EMAIL.toLowerCase()) return true;
  const saved=PropertiesService.getScriptProperties().getProperty('APP_PASSWORD_HASH');
  if(!saved) throw new Error('Admin password not configured. Run setupAppPassword(password) once.');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(password||'')).map(b=>(b+256).toString(16).slice(-2)).join('');
  return hash===saved;
}

// AR IDs supplied for the 55 student accounts. Existing spreadsheet names are matched safely.
const STUDENT_LOGIN_MAP_ = [
 ['AR1679','ARUN A'],['AR1687','AYISHA NALAKATH'],['AR1658','AYISHA RIDHA E'],['AR1678','DIVANI PP'],['AR1685','FAHIM M FAISAL'],['AR1652','FARSEENA V'],['AR1681','FATHIMA BAYAN'],['AR1677','FATHIMA HAIZA CMK'],['AR1649','FATHIMA HAMDAH P'],['AR1668','FATHIMA HIBA PE'],['AR1643','FATHIMA NASRIN K'],['AR1665','FATHIMA NIDHA K P'],['AR1655','FATHIMA RASHFIN TA'],['AR1647','FATHIMA RENA KC'],['AR1691','FATHIMA RIZA TE'],['AR1669','FATHIMATHUL ASNA M'],['AR1660','HIBA SHARIN KT'],['AR1689','JAZL AHMAD PM'],['AR1663','KADEEJA JOUNA C'],['AR1661','LIYA EP'],['AR1688','LIYA MEHJABIN'],['AR1644','MEERA U'],['AR1653','MINHA K'],['AR1659','MUHAMMED ARSHAK K'],['AR1672','MOHAMMED BASITH'],['AR1662','MUHAMMED ADEEB VM'],['AR1650','MUHAMMED ASIF PARI'],['AR1673','MUHAMMED LIYAN P'],['AR1654','MUHAMMED NAVEDUL ANJOOM AT'],['AR1670','MUHAMMED RAYAN M'],['AR1680','MUHAMMED SHAN K'],['AR1657','NADHA MEHJABIN V'],['AR1676','NAFIDA VP'],['AR1675','NAJA FATHIMA'],['AR1640','NAJMA V'],['AR1674','NAMITHA M'],['AR1656','NASHVA PV'],['AR1683','RENA MEHRIN AM'],['AR1684','RIMA FATHIMA'],['AR1671','RINSHA SHANAVAS'],['AR1686','RIYA FIBIN P'],['AR1646','SANA N'],['AR1664','SHAFRIN RAHMAN ALYATHODI'],['AR1641','SHAHEEM NADUTHODI'],['AR1651','SHAIMA SHIREEN K'],['AR1642','SHEBA IQBAL'],['AR1682','SHEMIL MUHAMMED'],['AR1648','SHINA FATHIMA CK'],['AR1700','FATHIMA JUNNA K.K'],['AR1699','FATHIMA SHAHNA M'],['AR1704','JYOTSNA RAJ'],['AR1702','RAHMA K.'],['AR1701','SANA K.'],['AR1703','SHAHDHA A.K'],['AR1705','ZENHA FATHIMA']
];
function normalizeStudentName_(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
// Student passwords use HMAC-SHA256 with a random per-password salt and a
// server-side pepper stored only in Script Properties. Legacy hashes are
// verified on login and upgraded automatically.
function ensureStudentPasswordPepper_(){
  const props=PropertiesService.getScriptProperties();
  let pepper=props.getProperty('STUDENT_PASSWORD_PEPPER');
  if(!pepper){
    pepper=Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid();
    props.setProperty('STUDENT_PASSWORD_PEPPER',pepper);
  }
  return pepper;
}
function legacyPasswordHash_(username,password){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(username).toUpperCase()+'|'+String(password))
    .map(b=>(b+256).toString(16).slice(-2)).join('');
}
function passwordHash_(username,password){
  const salt=Utilities.getUuid().replace(/-/g,'');
  const message=String(username).trim().toUpperCase()+'|'+salt+'|'+String(password);
  const bytes=Utilities.computeHmacSha256Signature(message,ensureStudentPasswordPepper_());
  const hex=bytes.map(b=>(b+256).toString(16).slice(-2)).join('');
  return 'v2$'+salt+'$'+hex;
}
function secureHashCompare_(a,b){
  a=String(a);b=String(b);if(a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
function verifyPassword_(username,password,stored){
  stored=String(stored||'');
  if(stored.indexOf('v2$')===0){
    const parts=stored.split('$');if(parts.length!==3)return false;
    const message=String(username).trim().toUpperCase()+'|'+parts[1]+'|'+String(password);
    const bytes=Utilities.computeHmacSha256Signature(message,ensureStudentPasswordPepper_());
    const hex=bytes.map(b=>(b+256).toString(16).slice(-2)).join('');
    return secureHashCompare_(hex,parts[2]);
  }
  return secureHashCompare_(legacyPasswordHash_(username,password),stored);
}
function randomTempPassword_(){return Utilities.getUuid().replace(/-/g,'').slice(0,4)+'@'+Utilities.getUuid().replace(/-/g,'').slice(0,4)+'!';}
function ensureLoginSheet_(){
  const ss=getSS_(); let sh=ss.getSheetByName('LOGIN_ACCOUNTS');
  if(!sh){sh=ss.insertSheet('LOGIN_ACCOUNTS');sh.getRange(1,1,1,6).setValues([['AR ID','Student Name','Password Hash','Active','Created At','Updated At']]);sh.setFrozenRows(1);}
  return sh;
}
function loginAccount_(username,password){
  username=String(username||'').trim().toUpperCase();
  // Backward-compatible admin alias: the login screen previously displayed "admin",
  // while the server's primary admin account is ASIF.
  if(username==='ADMIN') username='ASIF';
  if(!username||!password)return null;
  if(username==='ASIF' && checkLogin(password)) return {role:'admin',username:'ASIF',name:'Administrator'};
  const sh=ensureLoginSheet_(); if(sh.getLastRow()<2)return null;
  const rows=sh.getRange(2,1,sh.getLastRow()-1,6).getValues();
  const row=rows.find(r=>String(r[0]).toUpperCase()===username);
  if(!row || String(row[3]).toUpperCase()!=='TRUE')return null;
  const storedHash=String(row[2]||'');
  if(!verifyPassword_(username,password,storedHash))return null;
  // Upgrade a valid legacy hash after successful authentication.
  if(storedHash.indexOf('v2$')!==0){
    const rowIndex=rows.findIndex(r=>String(r[0]).toUpperCase()===username)+2;
    sh.getRange(rowIndex,3).setValue(passwordHash_(username,password));
    sh.getRange(rowIndex,6).setValue(new Date());
  }
  return {role:isDelegatedAdmin_(username)?'admin':'student',username:username,name:String(row[1]),studentName:String(row[1]),mustChangePassword:studentMustChangePassword_(username)};
}
// Delegated administrator access is stored separately; existing account and payment data remain untouched.
function ensureAdminUsersSheet_(){
  const ss=getSS_(); let sh=ss.getSheetByName('ADMIN_USERS');
  if(!sh){ sh=ss.insertSheet('ADMIN_USERS'); sh.getRange(1,1,1,4).setValues([['AR ID','Student Name','Granted At','Granted By']]); sh.setFrozenRows(1); }
  return sh;
}
function isPrimaryAdmin_(username){ return String(username||'').toUpperCase()==='ASIF'; }
function isDelegatedAdmin_(username){
  const id=String(username||'').trim().toUpperCase(); if(!id || isPrimaryAdmin_(id)) return false;
  const sh=ensureAdminUsersSheet_(); if(sh.getLastRow()<2) return false;
  return sh.getRange(2,1,sh.getLastRow()-1,1).getValues().some(r=>String(r[0]||'').toUpperCase()===id);
}
function grantAdminAccess(arId){
  arId=String(arId||'').trim().toUpperCase();
  if(!STUDENT_LOGIN_MAP_.some(x=>x[0]===arId)) throw new Error('Unknown student AR ID.');
  const account=ensureLoginSheet_().getDataRange().getValues().find((r,i)=>i>0&&String(r[0]).toUpperCase()===arId);
  if(!account || String(account[3]).toUpperCase()!=='TRUE') throw new Error('Create and enable this student login first.');
  const sh=ensureAdminUsersSheet_();
  if(isDelegatedAdmin_(arId)) return {success:true,message:'This student already has Admin Access.'};
  sh.appendRow([arId,String(account[1]),new Date(),'ASIF']);
  return {success:true,message:arId+' — Admin Access granted.'};
}
function revokeAdminAccess(arId){
  arId=String(arId||'').trim().toUpperCase();
  if(!arId || isPrimaryAdmin_(arId)) throw new Error('Primary admin access cannot be revoked here.');
  const sh=ensureAdminUsersSheet_();
  if(sh.getLastRow()<2) return {success:true,message:'No delegated admins found.'};
  const vals=sh.getRange(2,1,sh.getLastRow()-1,4).getValues();
  for(let i=vals.length-1;i>=0;i--){ if(String(vals[i][0]).toUpperCase()===arId) sh.deleteRow(i+2); }
  return {success:true,message:arId+' — Admin Access revoked.'};
}
function listAdminUsers(){
  const sh=ensureAdminUsersSheet_(); if(sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,4).getValues().map(r=>({username:String(r[0]),name:String(r[1]),grantedAt:r[2]}));
}

function getDashboardForSession_(session){
  const d=getDashboard();
  if(session.role==='admin'){d.role='admin';d.currentUser=session.name;return d;}
  const name=String(session.studentName||session.name||'');
  const me=(d.students||[]).find(s=>normalizeStudentName_(s.name)===normalizeStudentName_(name));
  if(!me)throw new Error('Your student record was not found. Contact the admin.');
  return {
    role:'student',currentUser:me.name,opening:0,collection:me.paid,expenses:d.expenses,balance:0,pending:me.pending,
    students:[me],categories:me.categories||[],
    payments:(d.payments||[]).filter(p=>normalizeStudentName_(p.student)===normalizeStudentName_(me.name)),
    expenseList:d.expenseList||[]
  };
}
// Run once from Apps Script editor. Creates 55 accounts with unique temporary passwords.
// Copy the returned credentials and share each password privately with its student.
function initializeStudentAccounts(){
  const sh=ensureLoginSheet_();
  const existing={}; if(sh.getLastRow()>1)sh.getRange(2,1,sh.getLastRow()-1,6).getValues().forEach((r,i)=>existing[String(r[0]).toUpperCase()]={row:i+2,data:r});
  const students=getStudentRows_(); const byName={}; students.forEach(s=>byName[normalizeStudentName_(s.name)]=s);
  const created=[]; const missing=[];
  STUDENT_LOGIN_MAP_.forEach(pair=>{
    const arid=pair[0], expected=pair[1], student=byName[normalizeStudentName_(expected)];
    if(!student){missing.push({username:arid,expectedName:expected});return;}
    if(existing[arid])return;
    const temp=randomTempPassword_();
    sh.appendRow([arid,student.name,passwordHash_(arid,temp),true,new Date(),new Date()]);
    sh.getRange(sh.getLastRow(),7).setValue(true);
     created.push({username:arid,name:student.name,temporaryPassword:temp});
  });
  return {created:created,alreadyExisting:Object.keys(existing),missing:missing,note:'Save these temporary passwords now. They are not stored in readable form.'};
}
function createStudentAccount(arId){
  arId=String(arId||'').trim().toUpperCase();
  const pair=STUDENT_LOGIN_MAP_.find(x=>x[0]===arId); if(!pair)throw new Error('Unknown AR ID.');
  const student=getStudentRows_().find(s=>normalizeStudentName_(s.name)===normalizeStudentName_(pair[1]));
  if(!student)throw new Error('Student record not found in STUDENTS sheet.');
  const sh=ensureLoginSheet_(); const values=sh.getDataRange().getValues();
  const found=values.findIndex((r,i)=>i>0&&String(r[0]).toUpperCase()===arId);
  const temp=randomTempPassword_(), row=[arId,student.name,passwordHash_(arId,temp),true,new Date(),new Date()];
  if(found>0) { sh.getRange(found+1,1,1,6).setValues([row]); sh.getRange(found+1,7).setValue(true); }
   else { sh.appendRow(row); sh.getRange(sh.getLastRow(),7).setValue(true); }
  return {username:arId,name:student.name,temporaryPassword:temp};
}
function setStudentAccountActive(arId,active){
  const sh=ensureLoginSheet_(), rows=sh.getDataRange().getValues();
  const i=rows.findIndex((r,n)=>n>0&&String(r[0]).toUpperCase()===String(arId).toUpperCase());
  if(i<1)throw new Error('Account not found.');
  sh.getRange(i+1,4).setValue(!!active);sh.getRange(i+1,6).setValue(new Date());
  return {success:true,username:String(arId).toUpperCase(),active:!!active};
}
function listStudentAccounts(){
  const sh=ensureLoginSheet_(); if(sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,6).getValues().map(r=>({username:r[0],name:r[1],active:String(r[3]).toUpperCase()==='TRUE'}));
}

// Run this function ONCE to set the Admin password.
// After successful execution, remove this helper for security.
function setMyAdminPasswordOnce() {
  setupAppPassword('asif@123');
}

// TEMPORARY STUDENT PASSWORD RESET:
// Sets each student's initial password equal to their AR ID.
// Example: username AR1679, password AR1679.
// Run once, then remove this helper function and save.
function setAllStudentPasswordsToUsername() {
  const sh = ensureLoginSheet_();
  if (sh.getLastRow() < 2) {
    throw new Error('No student accounts found. Run initializeStudentAccounts() first.');
  }

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues();
  let updated = 0;

  rows.forEach((row, index) => {
    const arId = String(row[0] || '').trim().toUpperCase();
    if (!arId) return;

    sh.getRange(index + 2, 3).setValue(passwordHash_(arId, arId));
    sh.getRange(index + 2, 7).setValue(true);
    sh.getRange(index + 2, 6).setValue(new Date());
    updated++;
  });

  return updated + ' student account password(s) set to their AR ID.';
}

// Column G marks temporary passwords that must be changed.
function studentMustChangePassword_(arId) {
  const sh = ensureLoginSheet_();
  if (sh.getLastColumn() < 7 || sh.getLastRow() < 2) return false;
  const rows = sh.getRange(2, 1, sh.getLastRow()-1, 7).getValues();
  const row = rows.find(r => String(r[0]).toUpperCase() === String(arId).toUpperCase());
  if (!row) return false;
  // Also recognize initial AR-ID passwords set before this upgrade.
  return row[6] === true || String(row[6]).toUpperCase() === 'TRUE' ||
    verifyPassword_(arId, arId, String(row[2]||''));
}

function changeMyPassword_(session, oldPassword, newPassword) {
  if (session.role !== 'student') throw new Error('Student login required.');
  if (newPassword.length < 8) throw new Error('New password must contain at least 8 characters.');
  if (newPassword === oldPassword || newPassword.toUpperCase() === session.username.toUpperCase())
    throw new Error('Choose a new password different from your AR ID and temporary password.');
  const sh = ensureLoginSheet_();
  const rows = sh.getRange(2, 1, sh.getLastRow()-1, 6).getValues();
  const i = rows.findIndex(r => String(r[0]).toUpperCase() === session.username.toUpperCase());
  if (i < 0 || String(rows[i][3]).toUpperCase() !== 'TRUE') throw new Error('Account unavailable.');
  if (!verifyPassword_(session.username, oldPassword, String(rows[i][2]||'')))
    throw new Error('Current password is incorrect.');
  sh.getRange(i+2, 3).setValue(passwordHash_(session.username, newPassword));
  sh.getRange(i+2, 7).setValue(false);
  sh.getRange(i+2, 6).setValue(new Date());
  return {success:true, message:'Password updated. Please log in with your new password.'};
}