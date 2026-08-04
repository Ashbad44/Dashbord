/**
 * ============================================================
 *  Apps Script backend for "حسابات شقق أبو بدر" website
 * ============================================================
 *  1. Fill in the 3 values below.
 *  2. Deploy > New deployment > type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  3. Copy the "Web app URL" it gives you into config.js
 *     (APPS_SCRIPT_URL) on the website, along with the same
 *     SHEET_KEY you set below (ACCESS_KEY).
 * ============================================================
 */

const SHEET_KEY = "CHANGE-THIS-TO-YOUR-OWN-SECRET";           // pick any password-like string
const REVENUE_SPREADSHEET_ID = "PUT_ايرادات_SHEET_ID_HERE";    // from its URL: /d/<this part>/edit
const CLOSING_SPREADSHEET_ID = "PUT_التقفيل_الشهري_SHEET_ID_HERE";

// Tab (sheet) names inside each spreadsheet — change if yours differ
const REVENUE_TAB_NAME = "Sheet1";
const CLOSING_TAB_NAME = "Sheet1";

function doGet(e) {
  const key = e.parameter.key;
  if (key !== SHEET_KEY) {
    return jsonOutput({ error: "Unauthorized" });
  }

  const type = e.parameter.type;
  try {
    if (type === "revenue") return jsonOutput(getRevenueData());
    if (type === "closing") return jsonOutput(getClosingData());
    return jsonOutput({ error: "Unknown type: " + type });
  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------- إيرادات (Revenue) ----------------
function getRevenueData() {
  const ss = SpreadsheetApp.openById(REVENUE_SPREADSHEET_ID);
  const sh = ss.getSheetByName(REVENUE_TAB_NAME);

  // Column order in the sheet is: C=بدر7 D=بدر4 E=بدر3 F=بدر2 G=بدر1
  // We re-order them to match the website's بدر1..بدر7 display order.
  const receiptsRaw = sh.getRange("C6:G6").getValues()[0]; // [بدر7, بدر4, بدر3, بدر2, بدر1]
  const expensesRaw = sh.getRange("C7:G7").getValues()[0];
  const netRaw = sh.getRange("C8:G8").getValues()[0];

  const reorder = (arr) => [arr[4], arr[3], arr[2], arr[1], arr[0]]; // -> بدر1,2,3,4,7

  return {
    monthLabel: String(sh.getRange("B4").getValue() || ""),
    receipts: reorder(receiptsRaw),
    expenses: reorder(expensesRaw),
    net: reorder(netRaw),
    totalReceipts: sh.getRange("B6").getValue() || 0,
    totalExpenses: sh.getRange("B7").getValue() || 0,
    totalNet: sh.getRange("B8").getValue() || 0,
    grandTotal: sh.getRange("B11").getValue() || 0,
    discount: sh.getRange("B12").getValue() || 0,
    netAfterDiscount: sh.getRange("D14").getValue() || 0,
    timestamp: new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })
  };
}

// ---------------- التقفيل الشهري (Closing) ----------------
function getClosingData() {
  const ss = SpreadsheetApp.openById(CLOSING_SPREADSHEET_ID);
  const sh = ss.getSheetByName(CLOSING_TAB_NAME);

  const expenseLabels = sh.getRange("D5:D9").getValues().map(r => String(r[0] || "").trim());
  const expenseValues = sh.getRange("C5:C9").getValues().map(r => r[0] || 0);

  const transferLabels = sh.getRange("D14:D18").getValues().map(r => String(r[0] || "").trim());
  const transferValues = sh.getRange("C14:C18").getValues().map(r => r[0] || 0);

  return {
    monthLabel: String(sh.getRange("B2").getValue() || ""),
    netIncome: sh.getRange("C4").getValue() || 0,
    expenseItems: expenseLabels.map((label, i) => ({ label, value: expenseValues[i] })),
    netAfterExpenses: sh.getRange("C10").getValue() || 0,
    transferItems: transferLabels.map((label, i) => ({ label, value: transferValues[i] })),
    transfersTotal: sh.getRange("C19").getValue() || 0,
    cashDeposit: sh.getRange("C20").getValue() || 0,
    cashReceived: sh.getRange("C21").getValue() || 0,
    remaining: sh.getRange("C22").getValue() || 0,
    timestamp: new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })
  };
}
