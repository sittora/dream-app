(() => {
  if (window.NuminosWidget) return;

  const css = `
    .numinos-btn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#6d28d9;color:white;border:none;box-shadow:0 6px 18px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:2147483647}
    .numinos-modal{position:fixed;right:20px;bottom:90px;width:360px;max-height:70vh;background:white;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);overflow:auto;padding:12px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111}
    .numinos-entry{padding:8px;border-bottom:1px solid #eee}
    .numinos-entry:last-child{border-bottom:none}
    .numinos-title{font-weight:600;margin-bottom:8px}
    .numinos-empty{padding:16px;color:#666}
  `;

  function createShadowRoot() {
    const host = document.createElement('div');
    host.id = 'numinos-host';
    host.style.all = 'initial';
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    root.appendChild(style);
    return root;
  }

  let authToken = null;

  async function fetchToken(hostOrigin) {
    const endpoints = [];
    if (hostOrigin) endpoints.push(`${hostOrigin.replace(/\/$/, '')}/token`);
    endpoints.push('/token');
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        if (!res.ok) continue;
        const j = await res.json();
        if (j && j.token) return j.token;
      } catch (e) {}
    }
    return null;
  }

  function withAuthFetch(url, opts = {}){
    opts.headers = opts.headers || {};
    if (authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
    return fetch(url, opts).then(async res => {
      if (res.status === 401) {
        authToken = await fetchToken(window?.NuminosWidget?.config?.hostOrigin || window.location.origin);
        if (authToken) {
          opts.headers['Authorization'] = 'Bearer ' + authToken;
          return fetch(url, opts);
        }
      }
      return res;
    });
  }

  function mount() {
    const root = createShadowRoot();
    const btn = document.createElement('button');
    btn.className = 'numinos-btn';
    btn.textContent = '✦';

    const modal = document.createElement('div');
    modal.className = 'numinos-modal';
    modal.style.display = 'none';
    modal.innerHTML = '<div class="numinos-title">Journal export</div>' +
      '<div style="font-size:12px;color:#666;margin-bottom:8px">By using this widget you consent to sending redacted journal entries to the analysis service. No raw text is logged.</div>' +
      '<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><input type="checkbox" id="numinos-consent"> I consent</label>' +
      '<div id="numinos-list">Please consent to load entries</div>';

    const consentCheckbox = modal.querySelector('#numinos-consent');

    btn.addEventListener('click', async () => {
      if (modal.style.display === 'none') {
        modal.style.display = 'block';
        const listEl = modal.querySelector('#numinos-list');
        if (!consentCheckbox || !consentCheckbox.checked) {
          if (listEl) listEl.innerHTML = '<div class="numinos-empty">Consent required to load entries</div>';
          return;
        }
        if (!authToken) {
          authToken = await fetchToken(window?.NuminosWidget?.config?.hostOrigin || window.location.origin);
        }
        if (!authToken) {
          if (listEl) listEl.innerHTML = '<div class="numinos-empty">Unable to obtain token from host</div>';
          return;
        }
        if (listEl) {
          try {
            const res = await withAuthFetch('/journal-export');
            if (!res.ok) throw new Error('Failed to fetch');
            const entries = await res.json();
            if (!Array.isArray(entries) || entries.length === 0) {
              listEl.innerHTML = '<div class="numinos-empty">No entries found</div>';
            } else {
              listEl.innerHTML = '';
              entries.slice(0,50).forEach(e => {
                const div = document.createElement('div');
                div.className = 'numinos-entry';
                div.innerHTML = `<div style="font-size:13px;color:#444">${escapeHtml(e.text)}</div><div style="font-size:11px;color:#888;margin-top:6px">${escapeHtml(e.ts || '')}</div>`;
                listEl.appendChild(div);
              });
            }
          } catch (err) {
            listEl.innerHTML = '<div class="numinos-empty">Failed to load entries</div>';
          }
        }
      } else {
        modal.style.display = 'none';
      }
    });

    root.appendChild(btn);
    root.appendChild(modal);
  }

  function escapeHtml(text){
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
  }

  window.NuminosWidget = {
    init: function(opts) {
      try { window.NuminosWidget.config = opts || {}; mount(); } catch (e) { console.error('NuminosWidget failed to init', e); }
    }
  };

  // Auto-init after load
  setTimeout(() => { try{ window.NuminosWidget.init({}); } catch(e){} }, 1000);
})();
