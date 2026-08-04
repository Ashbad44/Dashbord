// ============================================================
// APP — fetches live JSON from the Apps Script backend and
// fills in both pages. Falls back to sample numbers if no
// backend is configured yet, so you can preview the design
// before connecting it.
// ============================================================

const BRANCHES = ["بدر 1", "بدر 2", "بدر 3", "بدر 4", "بدر 7"];

// ---- Sample data shown until CONFIG.APPS_SCRIPT_URL is set ----
const DEMO_REVENUE = {
  monthLabel: "بيان تفصيل حسابات الفروع لشهر ( 12 ) 2025",
  receipts: [0, 0, 0, 0, 0],
  expenses: [0, 0, 0, 0, 0],
  net: [0, 0, 0, 0, 0],
  totalReceipts: 0,
  totalExpenses: 0,
  totalNet: 0,
  grandTotal: 0,
  discount: 0,
  netAfterDiscount: 0,
  timestamp: new Date().toLocaleString("ar-SA")
};

const DEMO_CLOSING = {
  monthLabel: "تقفيل حساب و إيرادات شهر ( 12 ) لعام 2025",
  netIncome: 0,
  expenseItems: [
    { label: "فواتير الكهرباء والماء", value: 0 },
    { label: "رواتب", value: 0 },
    { label: "مدفوعات أخرى", value: 0 },
    { label: "مدفوعات أخرى", value: 0 },
    { label: "مدفوعات أخرى", value: 0 }
  ],
  netAfterExpenses: 0,
  transferItems: [
    { label: "تحويلات إلى الراجحي", value: 14300 },
    { label: "تحويلات إلى الرياض", value: 89700 },
    { label: "تحويلات إلى الاهلي", value: 25600 },
    { label: "تحويلات إلى الانماء", value: 106948 },
    { label: "تحويلات إلى البلاد", value: 39100 }
  ],
  transfersTotal: 275648,
  cashDeposit: 0,
  cashReceived: 0,
  remaining: 0,
  timestamp: new Date().toLocaleString("ar-SA")
};

// ---------------- Helpers ----------------
function fmt(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("en-US");
}

function setStatus(kind, text) {
  const el = document.getElementById("status");
  el.className = "status-banner " + kind;
  el.textContent = text;
}

async function fetchJSON(type) {
  const url = `${CONFIG.APPS_SCRIPT_URL}?key=${encodeURIComponent(CONFIG.ACCESS_KEY)}&type=${type}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ---------------- Render: Revenue page ----------------
function renderRevenue(data) {
  document.getElementById("rev-month-label").textContent = data.monthLabel || "";
  document.getElementById("rev-timestamp").textContent = data.timestamp || "";

  const rows = [
    { label: "المقبوضات", values: data.receipts, total: data.totalReceipts, cls: "row-peach" },
    { label: "المصروفات", values: data.expenses, total: data.totalExpenses, cls: "row-green" },
    { label: "صافي الدخل العام", values: data.net, total: data.totalNet, cls: "row-blue" }
  ];

  const tbody = document.getElementById("rev-table-body");
  tbody.innerHTML = rows.map(r => `
    <tr class="${r.cls}">
      <td class="label-cell">${r.label}</td>
      ${r.values.map(v => `<td>${fmt(v)}</td>`).join("")}
      <td>${fmt(r.total)}</td>
    </tr>
  `).join("");

  document.getElementById("rev-grand-total").textContent = fmt(data.grandTotal);
  document.getElementById("rev-discount").textContent = fmt(data.discount);
  document.getElementById("rev-net-after").textContent = fmt(data.netAfterDiscount);

  document.getElementById("rev-detail-net").textContent = fmt(data.totalNet);
  document.getElementById("rev-detail-discount").textContent = fmt(data.discount);
  document.getElementById("rev-detail-netafter").textContent = fmt(data.netAfterDiscount);
}

// ---------------- Render: Closing page ----------------
function renderClosing(data) {
  document.getElementById("clo-month-label").textContent = data.monthLabel || "";
  document.getElementById("clo-timestamp").textContent = data.timestamp || "";

  const rowClasses = ["row-peach", "row-green", "row-blue"];

  const expBody = document.getElementById("clo-expenses-body");
  const netRow = `
    <tr class="row-blue">
      <td class="label-cell">صافي الدخل العام</td>
      <td>${fmt(data.netIncome)}</td>
    </tr>`;
  const expRows = data.expenseItems.map((item, i) => `
    <tr class="${rowClasses[i % rowClasses.length]}">
      <td class="label-cell">${item.label}</td>
      <td>${fmt(item.value)}</td>
    </tr>`).join("");
  expBody.innerHTML = netRow + expRows;

  document.getElementById("clo-net-total").textContent = fmt(data.netAfterExpenses);

  const trBody = document.getElementById("clo-transfers-body");
  trBody.innerHTML = data.transferItems.map((item, i) => `
    <tr class="${rowClasses[i % rowClasses.length]}">
      <td class="label-cell">${item.label}</td>
      <td>${fmt(item.value)}</td>
    </tr>`).join("");

  document.getElementById("clo-transfers-total").textContent = fmt(data.transfersTotal);
  document.getElementById("clo-cash-deposit").textContent = fmt(data.cashDeposit);
  document.getElementById("clo-cash-received").textContent = fmt(data.cashReceived);

  document.getElementById("clo-detail-net").textContent = fmt(data.netIncome);
  document.getElementById("clo-detail-transfers").textContent = fmt(data.transfersTotal);
  document.getElementById("clo-detail-remaining").textContent = fmt(data.remaining);
}

// ---------------- Load ----------------
async function loadAll() {
  const configured = CONFIG.APPS_SCRIPT_URL && CONFIG.ACCESS_KEY;

  if (!configured) {
    renderRevenue(DEMO_REVENUE);
    renderClosing(DEMO_CLOSING);
    setStatus("demo", "وضع المعاينة — لم يتم الربط بجوجل شيت بعد (راجع README.md)");
    return;
  }

  try {
    setStatus("", "جاري تحميل البيانات…");
    const [revenue, closing] = await Promise.all([
      fetchJSON("revenue"),
      fetchJSON("closing")
    ]);
    renderRevenue(revenue);
    renderClosing(closing);
    setStatus("live", "متصل مباشرة بجوجل شيت • آخر تحديث: " + new Date().toLocaleTimeString("ar-SA"));
  } catch (err) {
    console.error(err);
    renderRevenue(DEMO_REVENUE);
    renderClosing(DEMO_CLOSING);
    setStatus("error", "تعذّر تحميل البيانات المباشرة (" + err.message + ") — عرض بيانات تجريبية");
  }
}

// ---------------- Tabs ----------------
document.querySelectorAll(".tabbtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabbtn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  });
});

// ---------------- Print ----------------
document.getElementById("btn-print").addEventListener("click", () => {
  window.print();
});

// ---------------- Export a saved HTML snapshot ----------------
function buildSnapshotHTML() {
  const styleTag = document.querySelector("style").outerHTML;
  const revSection = document.getElementById("page-revenue").cloneNode(true);
  const cloSection = document.getElementById("page-closing").cloneNode(true);
  revSection.classList.add("active");
  cloSection.classList.add("active");
  cloSection.style.marginTop = "34px";

  const monthLabel = document.getElementById("rev-month-label")?.textContent.trim() || "";
  const exportedAt = new Date().toLocaleString("ar-SA");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير محفوظ — ${monthLabel}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
${styleTag}
<style>
  body{background:#f4f6f6;}
  .wrap{display:block !important; max-width:760px; margin:0 auto; padding:28px 18px 60px;}
  .page{display:block !important; margin-bottom:10px;}
  .saved-note{text-align:center;color:#6b7a7d;font-size:12.5px;margin-top:26px;}
</style>
</head>
<body class="unlocked">
<div class="wrap">
  <div class="bismillah">بسم الله الرحمن الرحيم</div>
  ${revSection.outerHTML}
  ${cloSection.outerHTML}
  <p class="saved-note">نسخة محفوظة بتاريخ ${exportedAt} — هذا ملف ثابت لا يتحدث تلقائياً</p>
</div>
</body>
</html>`;
}

document.getElementById("btn-export-snapshot").addEventListener("click", () => {
  const html = buildSnapshotHTML();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `تقرير-شقق-ابو-بدر-${stamp}.html`;
  a.click();
  URL.revokeObjectURL(url);
});

// ---------------- Init ----------------
loadAll();
if (CONFIG.REFRESH_INTERVAL_MS > 0) {
  setInterval(loadAll, CONFIG.REFRESH_INTERVAL_MS);
}
