(function seedData(){
      if(localStorage.getItem('inventoryData')) return;
      const now = new Date();
      const addDays = d => { const x = new Date(now); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
      const data = [
        {branch:'TVM-Main', medicine:'Paracetamol 650mg', batch:'PCM-2407', qty:50, expiry:addDays(22)},
        {branch:'TVM-Main', medicine:'Paracetamol 650mg', batch:'PCM-2410', qty:40, expiry:addDays(80)},
        {branch:'TVM-Main', medicine:'Paracetamol 650mg', batch:'PCM-2411', qty:20, expiry:addDays(340)},
        {branch:'TVM-Main', medicine:'Amoxicillin 500mg',  batch:'AMX-2401', qty:120, expiry:addDays(420)},
        {branch:'TVM-Main', medicine:'Ibuprofen 200mg',    batch:'IBU-2411', qty:8,  expiry:addDays(35)},
        {branch:'TVM-East', medicine:'Cetirizine 10mg',    batch:'CET-2403', qty:65, expiry:addDays(150)}
      ];
      localStorage.setItem('inventoryData', JSON.stringify(data));
      localStorage.setItem('currentBranch', 'TVM-Main');
      localStorage.setItem('canOverrideFEFO', 'false'); // change to 'true' to allow override
    })();

    // ===== State & DOM refs =====
    const branch = localStorage.getItem('currentBranch') || 'TVM-Main';
    document.getElementById('branchName').textContent = branch;

    const canOverride = localStorage.getItem('canOverrideFEFO')==='true';
    document.getElementById('overrideInfo').style.display = canOverride ? 'inline-flex' : 'none';

    const medSearch = document.getElementById('medSearch');
    const batchList = document.getElementById('batchList');
    const errorBox = document.getElementById('errorBox');

    const qtyInput = document.getElementById('qtyInput');
    const addToCart = document.getElementById('addToCart');
    const clearCart = document.getElementById('clearCart');
    const cartBox = document.getElementById('cartBox');
    const confirmBill = document.getElementById('confirmBill');
    const msgBox = document.getElementById('msgBox');

    let selection = null; // {medicine, batch, expiry, qtyAvailable}
    let cart = []; // [{medicine,batch,expiry,qty}]

    // ===== Helpers =====
    function getBranchBatches(){
      return JSON.parse(localStorage.getItem('inventoryData')||'[]').filter(x=>x.branch===branch);
    }
    function listMedicines(){
      const set = new Set(getBranchBatches().map(x=>x.medicine));
      return Array.from(set).sort();
    }
    function findBatches(med){
      return getBranchBatches().filter(x=>x.medicine===med && x.qty>0)
                                .sort((a,b)=> new Date(a.expiry)-new Date(b.expiry)); // FEFO
    }

    // ===== Rendering: Medicines & Batches =====
    function renderMedicineResults(){
      const term = medSearch.value.trim().toLowerCase();
      const meds = listMedicines().filter(m => !term || m.toLowerCase().includes(term));

      batchList.innerHTML = '';
      if(!meds.length){
        errorBox.style.display='block';
        errorBox.textContent = 'No valid batch found for dispensing. Please check inventory.';
        return;
      }
      errorBox.style.display='none';

      meds.forEach(m=>{
        const batches = findBatches(m);
        const container = document.createElement('div');
        container.innerHTML = `<div style="padding:8px 0;font-weight:800">${m}</div>`;

        if(!batches.length){
          const empty = document.createElement('div');
          empty.className='error';
          empty.textContent='No stock available';
          container.appendChild(empty);
        }else{
          batches.forEach((b, idx)=>{
            const row = document.createElement('div');
            row.className = 'batch' + (idx===0 ? ' highlight' : '');
            row.innerHTML = `
              <div>Batch: <strong>${b.batch}</strong></div>
              <div>Expiry: <strong>${b.expiry}</strong></div>
              <div>Available: <strong>${b.qty}</strong></div>
              <div class="row">
                ${idx===0 ? '<span class="fefo">Earliest expiry (FEFO)</span>' : ''}
                <button class="btn secondary" type="button">Select</button>
              </div>
            `;
            const btn = row.querySelector('button');
            btn.addEventListener('click', ()=>{
              if(!canOverride && idx!==0){
                alert('Manual override is not allowed for your role. Earliest expiry must be selected.');
                return;
              }
              selection = { medicine:m, batch:b.batch, expiry:b.expiry, qtyAvailable:b.qty };
              renderSelection();
            });
            container.appendChild(row);
          });
          // Auto-pick FEFO earliest for this medicine
          if(!selection || selection.medicine!==m){
            const earliest = batches[0];
            if(earliest){
              selection = { medicine:m, batch:earliest.batch, expiry:earliest.expiry, qtyAvailable:earliest.qty };
              renderSelection();
            }
          }
        }
        batchList.appendChild(container);
      });
    }

    // ===== Selected batch info =====
    function renderSelection(){
      qtyInput.value = '';
      msgBox.innerHTML = '';
      if(!selection) return;

      const info = document.createElement('div');
      info.className='success';
      info.innerHTML = `Selected: <strong>${selection.medicine}</strong> • Batch <strong>${selection.batch}</strong> • Expiry <strong>${selection.expiry}</strong> • Available <strong>${selection.qtyAvailable}</strong>`;
      msgBox.appendChild(info);
    }

    // ===== Cart =====
    function renderCart(){
      cartBox.innerHTML = '';
      if(!cart.length){
        cartBox.innerHTML = '<div class="empty">No items yet.</div>';
        return;
      }
      cart.forEach(c=>{
        const row = document.createElement('div');
        row.className = 'batch';
        row.innerHTML = `
          <div><strong>${c.medicine}</strong></div>
          <div>Batch: <strong>${c.batch}</strong></div>
          <div>Expiry: <strong>${c.expiry}</strong></div>
          <div>Qty: <strong>${c.qty}</strong></div>
        `;
        // expiry indicator
        const daysLeft = Math.ceil((new Date(c.expiry)-new Date())/(24*3600*1000));
        const tag = document.createElement('span');
        tag.className = 'fefo';
        tag.textContent = daysLeft <= 14 ? 'Critical' : 'Earliest Expiry';
        row.appendChild(tag);

        cartBox.appendChild(row);
      });
    }

    // ===== Events =====
    addToCart.addEventListener('click', ()=>{
      if(!selection){ alert('Select a medicine batch first.'); return; }
      const qty = Number(qtyInput.value);
      if(!qty || qty<=0){ alert('Enter a valid quantity.'); return; }
      if(qty > selection.qtyAvailable){
        alert('Requested quantity exceeds available stock.');
        return;
      }
      cart.push({ ...selection, qty });
      renderCart();
    });

    clearCart.addEventListener('click', ()=>{
      cart = [];
      renderCart();
    });

    confirmBill.addEventListener('click', ()=>{
      if(!cart.length){ alert('Cart is empty.'); return; }
      const ok = confirm('Confirm billing and reduce inventory?');
      if(!ok) return;

      // Reduce inventory immediately
      const data = JSON.parse(localStorage.getItem('inventoryData')||'[]');
      cart.forEach(item=>{
        const idx = data.findIndex(x=>x.branch===branch && x.medicine===item.medicine && x.batch===item.batch);
        if(idx>-1){
          data[idx].qty = Math.max(0, data[idx].qty - item.qty);
        }
      });
      localStorage.setItem('inventoryData', JSON.stringify(data));

      // Reset
      cart = [];
      renderCart();
      msgBox.innerHTML = '<div class="success">Inventory updated successfully after dispensing.</div>';

      // Reflect reduced quantities in the left pane immediately
      renderMedicineResults();
    });

    // Search live
    medSearch.addEventListener('input', renderMedicineResults);

    // Optional: prevent form submit if a form exists
    document.getElementById('searchForm')?.addEventListener('submit', e=>e.preventDefault());

    // Close account menu when clicking outside
    document.addEventListener('click',(e)=>{
      const m=document.getElementById('accountMenu');
      if(m && !m.contains(e.target)) m.open=false;
    });

    // Sidebar toggle aria only (UI stays as-is per requirement)
    document.getElementById('sidebarToggle')?.addEventListener('click',(e)=>{
      const b=e.currentTarget;
      const ex=b.getAttribute('aria-expanded')==='true';
      b.setAttribute('aria-expanded', String(!ex));
    });

    // ===== Init =====
    renderMedicineResults();
    renderCart();

    // Logout confirm & redirect
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