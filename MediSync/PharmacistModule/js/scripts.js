
/**
 * Expiry Alerts Dashboard Enhancements
 * - Safe text updates
 * - Render inventory/expiry monitor table in #tableWrap
 * - Search & sort using existing #searchInput and #sortSelect
 * - Keep layout, navbar, sidebar untouched
 */
(function(){
  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init(){
    // ---------- Helpers ----------
    function qs(sel, root){ return (root || document).querySelector(sel); }
    function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
    function setTextSafe(sel, newText){
      var el = qs(sel);
      if(el && typeof newText === 'string'){ el.textContent = newText; }
    }

    // ---------- Text content updates (safe) ----------
    // Title
    document.title = 'Stock Inventory';

    // Breadcrumbs: if present, set to dashboard path; if not present, skip
    setTextSafe('.breadcrumbs', 'Dashboard ▸ Stock Inventory');

    // Card header: first <span> inside .card-header
    var ch = qs('.card .card-header');
    if (ch){
      var leftSpan = ch.querySelector('span');
      if (leftSpan){ leftSpan.textContent = 'Inventory Monitor'; }
    }

    // Optional elements (defensive: only if present)
    var alertsEmpty = qs('#alertsList .empty, .empty[role="alert"]');
    if (alertsEmpty) { alertsEmpty.textContent = 'No medicines nearing expiry.'; }

    var monitorWrap = qs('#monitorWrap');
    if (monitorWrap){
      var mwEmpty = qs('.empty', monitorWrap);
      if (mwEmpty){ mwEmpty.textContent = 'No batches found within the selected range.'; }
    }

    var alertsList = qs('#alertsList');
    if (alertsList){
      qsa('button', alertsList).forEach(function(btn){
        var txt = (btn.textContent || '').trim().toLowerCase();
        if (txt === 'view details'){ btn.textContent = 'View in Monitor'; }
        if (txt === 'mark handled'){ btn.textContent = 'Mark as Resolved'; }
      });
    }

    var alertCountEl = qs('#alertCount');
    if (alertCountEl){
      var txt = (alertCountEl.textContent || '').trim();
      if (/^\d+\s+active$/i.test(txt)) {
        alertCountEl.textContent = txt + ' alerts';
      }
    }

    // ---------- Inventory / Expiry monitor ----------
    var tableWrap = qs('#tableWrap');
    var statusText = qs('#statusText');
    var card = qs('#inventoryCard');

    // Graceful exit if container missing
    if (!tableWrap){ return; }

    // Demo data (expandable)
    // status: 'ok' | 'near' | 'expired'
    var data = [
      { medicine: 'Paracetamol 500mg', batch: 'PA-2025-031', expiry: '2026-02-15', qty: 120, status: 'ok' },
      { medicine: 'Amoxicillin 250mg', batch: 'AMX-2024-119', expiry: '2025-01-20', qty: 45, status: 'near' },
      { medicine: 'Ibuprofen 200mg', batch: 'IBU-2024-007', expiry: '2024-12-31', qty: 10, status: 'expired' },
      { medicine: 'Omeprazole 20mg', batch: 'OME-2025-078', expiry: '2025-06-30', qty: 60, status: 'ok' },
      { medicine: 'Cetirizine 10mg', batch: 'CET-2025-044', expiry: '2025-03-15', qty: 30, status: 'near' },
      { medicine: 'Metformin 500mg', batch: 'MET-2026-012', expiry: '2026-11-05', qty: 210, status: 'ok' },
      { medicine: 'Atorvastatin 10mg', batch: 'ATO-2025-095', expiry: '2025-04-10', qty: 75, status: 'near' },
      { medicine: 'Insulin (Regular)', batch: 'INS-2024-990', expiry: '2024-11-30', qty: 22, status: 'expired' }
    ];

    // State
    var state = {
      filtered: data.slice(),
      sort: (qs('#sortSelect') && qs('#sortSelect').value) || 'expiryAsc',
      search: (qs('#searchInput') && qs('#searchInput').value) || ''
    };

    function parseDate(s){
      // Expect YYYY-MM-DD
      var d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    function render(){
      // Build table HTML
      var html = [
        '<table class="inventory-table">',
          '<thead>',
            '<tr>',
              '<th>Medicine</th>',
              '<th>Batch</th>',
              '<th>Expiry Date</th>',
              '<th>Quantity</th>',
              '<th>Status</th>',
            '</tr>',
          '</thead>',
          '<tbody>'
      ];

      if (!state.filtered.length){
        html.push(
          '<tr>',
            '<td colspan="5" class="empty">No items match your filter.</td>',
          '</tr>'
        );
      } else {
        state.filtered.forEach(function(item){
          var statusLabel = (item.status === 'near') ? 'Near Expiry'
                          : (item.status === 'expired') ? 'Expired'
                          : 'OK';
          html.push(
            '<tr>',
              '<td>' + escapeHTML(item.medicine) + '</td>',
              '<td>' + escapeHTML(item.batch) + '</td>',
              '<td>' + escapeHTML(item.expiry) + '</td>',
              '<td class="qty">' + String(item.qty) + '</td>',
              '<td><span class="status-chip ' + escapeHTML(item.status) + '">' + statusLabel + '</span></td>',
            '</tr>'
          );
        });
      }

      html.push('</tbody></table>');
      tableWrap.innerHTML = html.join('');

      // Update status text & aria
      if (statusText){ statusText.textContent = 'Showing latest stock'; }
      if (card){ card.setAttribute('aria-busy', 'false'); }
    }

    function escapeHTML(str){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function applySearchAndSort(){
      // Search
      var q = (state.search || '').trim().toLowerCase();
      var filtered = data.filter(function(item){
        var hay = (item.medicine + ' ' + item.batch).toLowerCase();
        return q === '' || hay.indexOf(q) !== -1;
      });

      // Sort
      switch (state.sort){
        case 'expiryAsc':
          filtered.sort(function(a,b){
            var da = parseDate(a.expiry) || new Date(8640000000000000); // far future if bad date
            var db = parseDate(b.expiry) || new Date(8640000000000000);
            return da - db;
          });
          break;
        case 'expiryDesc':
          filtered.sort(function(a,b){
            var da = parseDate(a.expiry) || new Date(-8640000000000000); // far past if bad date
            var db = parseDate(b.expiry) || new Date(-8640000000000000);
            return db - da;
          });
          break;
        case 'qtyAsc':
          filtered.sort(function(a,b){ return a.qty - b.qty; });
          break;
        case 'qtyDesc':
          filtered.sort(function(a,b){ return b.qty - a.qty; });
          break;
      }

      state.filtered = filtered;
      render();
    }

    // Wire controls if present
    var searchInput = qs('#searchInput');
    var sortSelect = qs('#sortSelect');

    if (searchInput){
      searchInput.addEventListener('input', function(e){
        state.search = e.target.value || '';
        applySearchAndSort();
      });
    }

    if (sortSelect){
      sortSelect.addEventListener('change', function(e){
        state.sort = e.target.value || 'expiryAsc';
        applySearchAndSort();
      });
    }

    // Initial render
    applySearchAndSort();
  }
})();
(function(){
      const logoutLink = document.getElementById('logoutLink');  // the <a id="logoutLink">
      const accountMenu = document.getElementById('accountMenu'); // <details> (optional)

      if(!logoutLink) return;

      logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); // stop instant navigation

        const ok = confirm('Are you sure you want to logout?');
        if(ok){
          // close the dropdown (nice UX)
          if(accountMenu) accountMenu.removeAttribute('open');

          // redirect to login page (from href)
          window.location.href = logoutLink.getAttribute('href') || '../Common Features/login.html';
        }
      });
    })();