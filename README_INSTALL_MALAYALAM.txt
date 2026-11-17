ARMAADHA – ജന്മദിനം & ഇവന്റ് പോസ്റ്റർ അപ്ഡേറ്റ്

മാറ്റങ്ങൾ:
1. ഡാഷ്ബോർഡിൽ ഇന്ന് ജന്മദിനമുള്ള വിദ്യാർത്ഥികളുടെ പേര്, പ്രൊഫൈൽ ഫോട്ടോ മാത്രം കാണിക്കും.
2. അടുത്ത ദിവസങ്ങളിലെ ജന്മദിനങ്ങൾ ഇനി കാണിക്കില്ല.
3. Events ഭാഗത്ത് Admin-ന് ഇവന്റ് പോസ്റ്റർ അപ്‌ലോഡ് ചെയ്യാം.
4. പോസ്റ്റർ Google Drive-ൽ സൂക്ഷിക്കും; വിദ്യാർത്ഥികൾക്കും ഇവന്റ് പോസ്റ്റർ കാണാം.
5. ഇവന്റിന്റെ തീയതി കഴിഞ്ഞാൽ ഇവന്റും അതിന്റെ പോസ്റ്ററും സ്വയം നീക്കം ചെയ്യും. ദിവസേന പുലർച്ചെ 2 മണിക്ക് cleanup trigger പ്രവർത്തിക്കും; Events തുറക്കുമ്പോഴും കാലാവധി കഴിഞ്ഞവ നീക്കം ചെയ്യും.
6. നിലവിലുള്ള EVENTS sheet ഉണ്ടെങ്കിൽ പുതിയ Poster File ID കോളം മാത്രം ചേർക്കും. പഴയ event വിവരങ്ങൾ നിലനിർത്തും.

ഇൻസ്റ്റാൾ ചെയ്യുന്നത്:
1. ZIP Extract ചെയ്യുക.
2. GitHub repository-യിലെ index.html replace ചെയ്ത് Commit ചെയ്യുക.
3. Apps Script project-ലെ Code.gs replace ചെയ്യുക.
4. Deploy > Manage deployments > Edit > New version > Deploy.
5. config.js URL മാറ്റേണ്ടതില്ല.

ശ്രദ്ധിക്കുക:
- ആദ്യമായി Events ഭാഗം ഉപയോഗിക്കുമ്പോൾ Drive poster folder-ും daily cleanup trigger-ും സൃഷ്ടിക്കപ്പെടും. ആവശ്യമായ Google authorization ചോദിച്ചാൽ അനുവദിക്കുക.
- പോസ്റ്ററുകൾ Anyone with the link – Viewer ആയി share ചെയ്യപ്പെടും, കാരണം വിദ്യാർത്ഥികൾക്ക് കാണേണ്ടതാണ്. സ്വകാര്യ ചിത്രങ്ങൾ പോസ്റ്ററായി അപ്‌ലോഡ് ചെയ്യരുത്.
- നിലവിലുള്ള PAYMENTS, EXPENSES, STUDENT_CATEGORIES, login data എന്നിവ reset ചെയ്യില്ല.
- setupStudentCategorySystem() പ്രവർത്തിപ്പിക്കരുത്.
- JavaScript syntax, Apps Script syntax എന്നിവ പരിശോധിച്ചിട്ടുണ്ട്; live deployment പരീക്ഷിച്ചിട്ടില്ല.
