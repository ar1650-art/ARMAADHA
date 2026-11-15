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
    .setTitle('B ARCH Class Fund')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function handlePwaApi_(e) {
  var callback = String((e.parameter && e.parameter.callback) || '');
  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput('/* invalid callback */')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  var result;
  try {
    var action = String(e.parameter.action || '');
    var payloadText = Utilities.newBlob(Utilities.base64DecodeWebSafe(String(e.parameter.payload || ''))).getDataAsString();
    var args = payloadText ? JSON.parse(payloadText) : [];
    if (!Array.isArray(args)) throw new Error('Invalid request payload.');
    if (action === 'login') {
      var ok = checkLogin(String(args[0] || ''));
      if (!ok) result = false;
      else {
        var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
        CacheService.getScriptCache().put('PWA_SESSION_' + token, '1', 21600);
        result = { ok: true, token: token };
      }
    } else {
      var token = String(e.parameter.token || '');
      if (!token || CacheService.getScriptCache().get('PWA_SESSION_' + token) !== '1') {
        throw new Error('Session expired. Please log in again.');
      }
      var handlers = {
        getDashboard: getDashboard,
        refreshDashboard: refreshDashboard,
        updateOpeningBalance: updateOpeningBalance,
        addPayment: addPayment,
        addExpense: addExpense,
        saveCategoryAssignments: saveCategoryAssignments
      };
      if (!Object.prototype.hasOwnProperty.call(handlers, action)) throw new Error('Action not allowed.');
      result = handlers[action].apply(null, args);
    }
  } catch (err) {
    result = { __error: String(err && err.message ? err.message : err) };
  }
  var json = JSON.stringify(result).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return ContentService.createTextOutput(callback + '(' + json + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getSS_() {
  const id = PropertiesService.getScriptProperties().getProperty('FUND_ID');
  if (!id) throw new Error('FUND_ID not found. Use your existing class fund spreadsheet.');
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
  updateAllStudentBalances_();
  return {success:true,added:rows.length,message:rows.length+' student-category assignment(s) saved.'};
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
    payments:payments.slice(1).reverse().slice(0,200).map(r=>({date:r[1],student:r[2],category:r[3],amount:r[4],note:r[5],mode:r[6]||''})),
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
    updateAllStudentBalances_(); SpreadsheetApp.flush(); return getDashboard();
  } finally {lock.releaseLock();}
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
  return getDashboard();
}

function refreshDashboard() { return getDashboard(); }
function setupAppPassword(password) {
  password = String(password || '');
  if (password.length < 10) throw new Error('Use a password with at least 10 characters.');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,password)
    .map(b=>(b+256).toString(16).slice(-2)).join('');
  PropertiesService.getScriptProperties().setProperty('APP_PASSWORD_HASH',hash);
  return 'Password saved successfully';
}
function checkLogin(password) {
  const email=(Session.getActiveUser().getEmail()||'').toLowerCase().trim();
  if(email===AUTHORIZED_EMAIL.toLowerCase()) return true;
  const saved=PropertiesService.getScriptProperties().getProperty('APP_PASSWORD_HASH');
  if(!saved) throw new Error('Password not configured. Run setupAppPassword().');
  const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(password||'')).map(b=>(b+256).toString(16).slice(-2)).join('');
  return hash===saved;
}