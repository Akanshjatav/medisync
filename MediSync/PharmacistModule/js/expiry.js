
/*****************************************************
 * Inventory UI — Cleaner Names, Clear Units, Expiry & Days Left
 * Drop-in JS (no external dependencies)
 * - Simplifies medicine names (removes bracketed codes, formats dosages)
 * - Normalizes units (e.g., "Blister of 28 Tabs" → "Pack of 28 tablets")
 * - Adds Expiry Date and Days Left columns
 * - Search, sort (by expiry, stock, name), and near-expiry highlighting
 * - Works with your existing element IDs:
 *   #branchName, #tableWrap, #statusText, #searchInput, #sortSelect
 *****************************************************/

/* =========================
   Seed demo data (optional)
   ========================= */
(function seedStocks() {
  if (localStorage.getItem('drugStocks')) return;

  const now = new Date();
  const addDays = d => {
    const x = new Date(now);
    x.setDate(x.getDate() + d);
    return x.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const demo = [
    { itemName: '2 FDC (P) (H50 & 8.75) [DSTB-CP(P)]', currentStock: 239748, unit: 'Blister of 28 Tabs', expiryDate: addDays(75) },
    { itemName: '3 FDC CP (A) (H75,R150 & E275) [DSTB-CP(A)]', currentStock: 5513, unit: 'Blister of 28 Tabs', expiryDate: addDays(66) },
    { itemName: '3 FDC(P) (H50, R75, Z150) [DSTB-PP]', currentStock: 11962, unit: 'Blister of 28 Tabs', expiryDate: addDays(52) },
    { itemName: '4 FDC(A) (H75, R150, Z450 & E275) [DSTB-IPA-L]', currentStock: 21182, unit: 'Blister of 28 Tabs', expiryDate: addDays(43) },
    { itemName: '4 FDC(Z) (H75, R150, Z400 & E275) [DSTB-IPA-L]', currentStock: 4, unit: 'Tab', expiryDate: addDays(32) },
    { itemName: 'Clofazimine 100mg [PC40]', currentStock: 1260, unit: 'Cap', expiryDate: addDays(84) },
    { itemName: 'Cycloserine 125mg (Dispersible) [PC-63 (DT)]', currentStock: 25760, unit: 'No', expiryDate: addDays(28) },
    { itemName: 'Cycloserine 250mg [PC24]', currentStock: 100418, unit: 'Cap', expiryDate: addDays(41) },
    { itemName: 'Ethambutol 100 MG (Dispersible) [PC-48 (DT)]', currentStock: 1900, unit: 'No', expiryDate: addDays(17) },
    { itemName: 'Ethambutol 100mg [PC48]', currentStock: 12277, unit: 'Tab', expiryDate: addDays(77) },
    { itemName: 'Ethambutol 400mg [PC45]', currentStock: 170, unit: 'Tab', expiryDate: addDays(54) },
    { itemName: 'Ethambutol 800mg [PC10]', currentStock: 171949, unit: 'Tab', expiryDate: addDays(25) }
  ];

  localStorage.setItem('drugStocks', JSON.stringify(demo));
  localStorage.setItem('currentBranch', 'TVM-Main');
})();

/* ==============
   Basic helpers
   ============== */
function daysBetween(a, b) {
  // Returns integer days from 'a' (today) to 'b' (expiry). Negative = already expired.
  return Math.ceil((b - a) / (24 * 3600 * 1000));
}

function toDate(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  return isNaN(d) ? new Date() : d;
}

function fmtISO(isoOrDate) {
  // Normalize to YYYY-MM-DD (for display)
  const d = toDate(isoOrDate);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : (plural || singular + 's')}`;
}

/* =========================================
   Name & Unit normalization (user-friendly)
   ========================================= */
function simplifyItemName(raw) {
  if (!raw || typeof raw !== 'string') return '';

  // 1) Remove any bracketed codes e.g., [DSTB-CP(P)] / [PC-48 (DT)]
  let name = raw.replace(/\[[^\]]*\]/g, '').trim();

  // 2) Make "FDC" clearer: convert leading "2 FDC" / "3 FDC" / "4 FDC" to "2-Drug Combo"
  //    Preserve if not at start, just leave intact.
  name = name.replace(/^(\d+)\s*FDC\b/i, (_, n) => `${n}-Drug Combo`);

  // 3) Insert spaces and "mg" into dosage tokens like H50, R150, Z450, E275
  //    Also handle standalone numbers like 8.75 → "8.75 mg"
  name = name.replace(/\b([HRZE])\s*([0-9]+(?:\.[0-9]+)?)\b/gi, (_, drug, dose) => `${drug.toUpperCase()} ${dose} mg`);
  name = name.replace(/\b([0-9]+(?:\.[0-9]+)?)\b/g, (m) => `${m} mg`);

  // 4) Clean up extra spaces and punctuation spacing
  name = name.replace(/\s*,\s*/g, ', ').replace(/\s*&\s*/g, ' & ').replace(/\s+/g, ' ').trim();

  // 5) Remove leftover parentheticals that are only single letters (like "(P)", "(A)") for readability
  name = name.replace(/\(\s*[A-Za-z]\s*\)/g, '').replace(/\s+/g, ' ').trim();

  // 6) Capitalize common drug names if present (best-effort, non-exhaustive)
  name = name
    .replace(/\bclofazimine\b/i, 'Clofazimine')
    .replace(/\bcycloserine\b/i, 'Cycloserine')
    .replace(/\bethambutol\b/i, 'Ethambutol');

  // Final tidy
  return name.replace(/\s{2,}/g, ' ').trim();
}

function normalizeUnit(unitRaw, nameRaw) {
  const base = String(unitRaw || '').toLowerCase().trim();
  const isDispersible = /\bdispersible\b/i.test(nameRaw);

  // Common mappings
  if (/^blister/.test(base)) {
    // Try to extract count (e.g., "Blister of 28 Tabs")
    const countMatch = base.match(/of\s+(\d+)\s+(tabs?|tablets?)/i);
    if (countMatch) {
      const count = parseInt(countMatch[1], 10);
      return `Pack of ${pluralize(count, 'tablet')}`;
    }
    return 'Pack';
  }

  if (base === 'tab' || base === 'tabs' || base === 'tablet' || base === 'tablets') {
    return isDispersible ? 'Dispersible tablet' : 'Tablet';
  }

  if (base === 'cap' || base === 'caps' || base === 'capsule' || base === 'capsules') {
    return 'Capsule';
  }

  // Some sources store "No" meaning "number of units" or "pieces"
  if (base === 'no') {
    // If name suggests tablet, default to Tablet; else generic Unit
    return /\btablet\b/i.test(nameRaw) || /\btab\b/i.test(nameRaw) || isDispersible ? 'Tablet' : 'Unit';
  }

  // Fallback
  return unitRaw || 'Unit';
}

/* ================================
   Days-left & Row highlighting UX
   ================================ */
function formatDaysLeft(daysLeft) {
  if (daysLeft < 0) {
    return `Expired ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago`;
  }
  if (daysLeft === 0) return 'Expires today';
  return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
}

function getSeverity(daysLeft) {
  // Return 'expired' | 'urgent' | 'soon' | 'ok'
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 15) return 'urgent';
  if (daysLeft <= 30) return 'soon';
  return 'ok';
}

function applyRowHighlight(tr, severity) {
  // Add a data attribute for CSS hooks, and inline background color as a sensible default
  tr.setAttribute('data-severity', severity);
  let bg = '';
  switch (severity) {
    case 'expired':
      bg = '#ffe5e5'; // light red
      break;
    case 'urgent':
      bg = '#fff0d6'; // light orange
      break;
    case 'soon':
      bg = '#fff7db'; // pale yellow
      break;
    case 'ok':
    default:
      bg = ''; // no highlight
  }
  if (bg) tr.style.backgroundColor = bg;
}

/* ===================
   Branch Name render
   =================== */
(function renderBranchName() {
  const branch = localStorage.getItem('currentBranch') || 'TVM-Main';
  const branchEl = document.getElementById('branchName');
  if (branchEl) branchEl.textContent = branch;
})();

/* ==========================
   Main: Render stocks table
   ========================== */
function renderStocksTable() {
  const wrap = document.getElementById('tableWrap');
  const status = document.getElementById('statusText');
  if (!wrap) return;

  const all = JSON.parse(localStorage.getItem('drugStocks') || '[]');
  const today = new Date();

  const searchTerm = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const sortVal = document.getElementById('sortSelect')?.value || 'expiryAsc';

  const cutoffDays = 90; // ≤ 3 months

  // Filter: within 90 days (includes already-expired within this window)
  let filtered = all.filter(x => {
    const exp = toDate(x.expiryDate);
    const dLeft = daysBetween(today, exp);
    return dLeft <= cutoffDays;
  });

  // Search by simplified item name
  if (searchTerm) {
    filtered = filtered.filter(x =>
      simplifyItemName(x.itemName).toLowerCase().includes(searchTerm)
    );
  }

  // Sort mapping
  const byExpiryAsc = (a, b) => toDate(a.expiryDate) - toDate(b.expiryDate);
  const byStockAsc = (a, b) => (a.currentStock || 0) - (b.currentStock || 0);
  const byNameAsc = (a, b) => {
    const na = simplifyItemName(a.itemName);
    const nb = simplifyItemName(b.itemName);
    return na.localeCompare(nb, undefined, { sensitivity: 'base' });
  };

  switch (sortVal) {
    case 'expiryAsc':
      filtered.sort(byExpiryAsc);
      break;
    case 'expiryDesc':
      filtered.sort((a, b) => byExpiryAsc(b, a));
      break;
    case 'qtyAsc':
      filtered.sort(byStockAsc);
      break;
    case 'qtyDesc':
      filtered.sort((a, b) => byStockAsc(b, a));
      break;
    case 'nameAsc':
      filtered.sort(byNameAsc);
      break;
    case 'nameDesc':
      filtered.sort((a, b) => byNameAsc(b, a));
      filtered.reverse();
      break;
    default:
      // Fallback to expiryAsc if unknown
      filtered.sort(byExpiryAsc);
      break;
  }

  // Status text
  if (status) {
    status.textContent = filtered.length
      ? `Showing ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'} (≤ 3 months)`
      : 'No drugs expiring within 3 months.';
    status.classList.remove('loading');
  }

  // Build table
  if (!filtered.length) {
    wrap.innerHTML = `<div class="empty">No drugs expiring within 3 months for the current filters.</div>`;
    return;
  }

  const table = document.createElement('table');
  table.className = 'inventory-table'; // Will use your existing CSS if present
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:72px;">S. No</th>
        <th>Medicine</th>
        <th style="width:160px; text-align:right;">Stock</th>
        <th style="width:140px;">Unit</th>
        <th style="width:140px;">Expiry Date</th>
        <th style="width:140px;">Days Left</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  filtered.forEach((x, i) => {
    const exp = toDate(x.expiryDate);
    const daysLeft = daysBetween(today, exp);
    const severity = getSeverity(daysLeft);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${simplifyItemName(x.itemName)}</td>
      <td style="text-align:right; font-weight:700;">${(x.currentStock ?? 0).toLocaleString()}</td>
      <td>${normalizeUnit(x.unit, x.itemName)}</td>
      <td>${fmtISO(x.expiryDate)}</td>
      <td>${formatDaysLeft(daysLeft)}</td>
    `;

    applyRowHighlight(tr, severity);
    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}

/* =================
   Input interactions
   ================= */
document.getElementById('searchInput')?.addEventListener('input', renderStocksTable);
document.getElementById('sortSelect')?.addEventListener('change', renderStocksTable);

/* ==========
   Navbar UX
   ========== */
document.addEventListener('click', (e) => {
  const m = document.getElementById('accountMenu');
  if (m && !m.contains(e.target)) m.open = false;
});

document.getElementById('sidebarToggle')?.addEventListener('click', (e) => {
  const b = e.currentTarget;
  const ex = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!ex));
});

/* ===========
   Logout link
   =========== */
(function () {
  const logoutLink = document.getElementById('logoutLink');  // ...
  const accountMenu = document.getElementById('accountMenu'); // <details> (optional)

  if (!logoutLink) return;

  logoutLink.addEventListener('click', (e) => {
    e.preventDefault(); // stop instant navigation
    const ok = confirm('Are you sure you want to logout?');
    if (ok) {
      if (accountMenu) accountMenu.removeAttribute('open'); // nice UX
      window.location.href = logoutLink.getAttribute('href') || '../Common Features/login.html';
    }
  });
})();

/* ===============
   Initial render
   =============== */
renderStocksTable();

/* ============================================
   OPTIONAL: If you add more sort select values
   ============================================
   <select id="sortSelect">
     <option value="expiryAsc">Expiry (Soonest first)</option>
     <option value="expiryDesc">Expiry (Latest first)</option>
     <option value="qtyAsc">Stock (Low → High)</option>
     <option value="qtyDesc">Stock (High → Low)</option>
     <option value="nameAsc">Name (A → Z)</option>
     <option value="nameDesc">Name (Z → A)</option>
   </select>
*/
