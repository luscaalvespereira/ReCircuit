/* ReCircuit — app logic (vanilla JS) */
(function () {
  const D = window.RC_DATA;
  const Sol = window.RCSol;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STORE = 'recircuit_state_v1';

  const defaults = { role: 'maker', idx: { maker: 0, collector: 0 }, matches: [], posts: [], receipts: [], proofs: [] };
  let S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE) || '{}'));
  S.idx = Object.assign({ maker: 0, collector: 0 }, S.idx);
  const save = () => localStorage.setItem(STORE, JSON.stringify(S));

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  async function sha(str) {
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
      return h.toString(16).padStart(16, '0').repeat(4);
    }
  }
  function toast(msg, err) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (err ? ' err' : ''); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3600);
  }
  function modal(html, onMount) {
    const m = $('#modal'); $('#modal-card').innerHTML = html; m.hidden = false;
    m.onclick = (e) => { if (e.target === m) closeModal(); };
    $$('[data-close]', m).forEach((b) => (b.onclick = closeModal));
    onMount && onMount($('#modal-card'));
  }
  function closeModal() { $('#modal').hidden = true; }
  function confetti() {
    const cols = ['#b6ff5c', '#2ee6c5', '#ffb84d', '#fff'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % 4];
      c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's'; c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c); setTimeout(() => c.remove(), 3800);
    }
  }

  /* ---------- icons & colours ---------- */
  const A = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    ram: `<svg viewBox="0 0 64 64" ${A}><rect x="5" y="20" width="54" height="22" rx="3"/><rect x="11" y="26" width="8" height="10"/><rect x="23" y="26" width="8" height="10"/><rect x="35" y="26" width="8" height="10"/><rect x="47" y="26" width="6" height="10"/><path d="M10 42v6M16 42v6M22 42v6M28 42v6M36 42v6M42 42v6M48 42v6M54 42v6"/></svg>`,
    psu: `<svg viewBox="0 0 64 64" ${A}><rect x="8" y="14" width="48" height="36" rx="4"/><circle cx="26" cy="32" r="11"/><path d="M26 21v22M15 32h22M18 24l16 16M34 24L18 40"/><path d="M45 22h6M45 28h6M45 34h6"/></svg>`,
    gpu: `<svg viewBox="0 0 64 64" ${A}><rect x="4" y="18" width="56" height="26" rx="4"/><circle cx="24" cy="31" r="8"/><circle cx="43" cy="31" r="8"/><path d="M24 26v10M19 31h10M43 26v10M38 31h10M10 44v5M16 44v5M22 44v5M28 44v5"/></svg>`,
    cpu: `<svg viewBox="0 0 64 64" ${A}><rect x="16" y="16" width="32" height="32" rx="4"/><rect x="25" y="25" width="14" height="14" rx="2"/><path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8"/></svg>`,
    storage: `<svg viewBox="0 0 64 64" ${A}><rect x="12" y="8" width="40" height="48" rx="5"/><circle cx="32" cy="28" r="12"/><circle cx="32" cy="28" r="3"/><path d="M32 28l8-6M20 49h24"/></svg>`,
    screen: `<svg viewBox="0 0 64 64" ${A}><rect x="6" y="12" width="52" height="34" rx="4"/><path d="M24 54h16M32 46v8"/><path d="M14 36l8-8 8 6 10-12 10 12"/></svg>`,
    battery: `<svg viewBox="0 0 64 64" ${A}><rect x="10" y="20" width="40" height="24" rx="4"/><path d="M50 28h5v8h-5"/><path d="M33 24l-8 10h7l-3 8 10-12h-7z"/></svg>`,
    board: `<svg viewBox="0 0 64 64" ${A}><rect x="8" y="8" width="48" height="48" rx="4"/><rect x="18" y="18" width="14" height="14" rx="2"/><path d="M38 16h10M38 22h10M16 40h18l6 6h8M42 30v8h8"/><circle cx="46" cy="46" r="3"/></svg>`,
    fan: `<svg viewBox="0 0 64 64" ${A}><rect x="8" y="8" width="48" height="48" rx="8"/><circle cx="32" cy="32" r="4"/><path d="M32 28c-2-8 2-13 8-13 2 6 0 11-8 13zM36 32c8-2 13 2 13 8-6 2-11 0-13-8zM32 36c2 8-2 13-8 13-2-6 0-11 8-13zM28 32c-8 2-13-2-13-8 6-2 11 0 13 8z"/></svg>`,
    cable: `<svg viewBox="0 0 64 64" ${A}><rect x="6" y="10" width="12" height="8" rx="2"/><rect x="46" y="46" width="12" height="8" rx="2"/><path d="M12 18v10c0 6 6 6 12 6h16c6 0 6 6 6 12v0"/><path d="M52 46V34"/></svg>`,
    network: `<svg viewBox="0 0 64 64" ${A}><rect x="6" y="16" width="52" height="28" rx="4"/><rect x="13" y="24" width="8" height="8"/><rect x="25" y="24" width="8" height="8"/><path d="M42 26h10M42 32h10M10 44v6M20 44v6M30 44v6"/></svg>`
  };
  const COLORS = {
    ram: ['rgba(182,255,92,.30)', '#b6ff5c'], psu: ['rgba(255,184,77,.28)', '#ffb84d'], gpu: ['rgba(46,230,197,.30)', '#2ee6c5'],
    cpu: ['rgba(110,200,255,.28)', '#7cc8ff'], storage: ['rgba(190,160,255,.26)', '#c3a6ff'], screen: ['rgba(46,230,197,.26)', '#2ee6c5'],
    battery: ['rgba(255,93,108,.28)', '#ff7a88'], board: ['rgba(182,255,92,.28)', '#b6ff5c'], fan: ['rgba(110,200,255,.26)', '#7cc8ff'],
    cable: ['rgba(255,184,77,.26)', '#ffb84d'], network: ['rgba(46,230,197,.28)', '#2ee6c5']
  };
  const icon = (c) => ICONS[c] || ICONS.board;

  /* ---------- navigation & role ---------- */
  function setView(v) {
    $$('.view').forEach((x) => x.classList.toggle('active', x.id === 'view-' + v));
    $$('.tab').forEach((x) => x.classList.toggle('active', x.dataset.view === v));
    if (v === 'matches') renderMatches();
    if (v === 'impact') renderImpact();
    if (v === 'post') renderPost();
    if (v === 'safety') renderSafety();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $$('.tab').forEach((t) => (t.onclick = () => setView(t.dataset.view)));

  function setRole(r) {
    S.role = r; save();
    $$('.role-btn').forEach((b) => b.classList.toggle('active', b.dataset.role === r));
    renderDeck(); renderPost();
  }
  $$('.role-btn').forEach((b) => (b.onclick = () => setRole(b.dataset.role)));

  /* ---------- deck ---------- */
  function items() {
    const mine = S.posts.filter((p) => p.kind === (S.role === 'maker' ? 'find' : 'want'));
    return (S.role === 'maker' ? D.parts : D.wants).concat(mine);
  }
  function cardHTML(it) {
    const [c1, c2] = COLORS[it.cat] || COLORS.board;
    const isPart = S.role === 'maker';
    const chips = isPart
      ? `<span class="chip ${it.cond === 'tested' ? 'ok' : 'warn'}">${esc(it.condLabel || 'Listed')}</span>${it.hazard ? '<span class="chip haz">⚠ Hazard</span>' : ''}`
      : `<span class="chip ok">Looking for</span><span class="chip">${esc(it.budget)}</span>`;
    const body = isPart
      ? `<ul class="specs">${(it.specs || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
      : `<p class="story">${esc(it.story || '')}</p>`;
    const who = isPart ? `<b>${esc(it.collector)}</b><span>Collector · ${esc(it.area)} · ${it.km} km</span>` : `<b>${esc(it.maker)}</b><span>${esc(it.role)} · ${esc(it.area)} · ${it.km} km</span>`;
    return `<article class="card" data-id="${it.id}" style="--c1:${c1};--c2:${c2}">
      <div class="stamp yes">MATCH</div><div class="stamp no">PASS</div>
      <div class="card-art"><div class="chips">${chips}</div>${icon(it.cat)}</div>
      <div class="card-body"><h3>${esc(it.title)}</h3>${body}
        <div class="card-foot"><div class="who">${who}</div><div class="price">${isPart ? esc(it.price) : '♻ Reuse'}</div></div>
      </div></article>`;
  }
  function renderDeck() {
    const all = items(); const left = all.slice(S.idx[S.role]);
    $('#discover-sub').textContent = S.role === 'maker'
      ? 'Swipe right on salvaged parts you can use. Collectors near you are matched instantly.'
      : 'Swipe right on makers whose requests you can fulfil with what you collected.';
    const deck = $('#deck');
    if (!left.length) {
      deck.innerHTML = `<div class="empty"><div style="font-size:2.6rem">🌱</div><h3>You've seen everything nearby</h3><p>New finds appear daily.</p><button class="btn btn-primary" id="btn-reset">Reload deck</button></div>`;
      $('#btn-reset').onclick = () => { S.idx[S.role] = 0; save(); renderDeck(); };
    } else {
      deck.innerHTML = left.slice(0, 3).reverse().map(cardHTML).join('');
      bindTop();
    }
    $('.deck-actions').style.visibility = left.length ? 'visible' : 'hidden';
  }
  let busy = false;
  function bindTop() {
    const card = $('.card:last-child', $('#deck')); if (!card || card.classList.contains('empty')) return;
    card.classList.add('top');
    let sx = 0, dx = 0, drag = false;
    const yes = $('.stamp.yes', card), no = $('.stamp.no', card);
    card.onpointerdown = (e) => { if (busy) return; drag = true; sx = e.clientX; card.classList.add('dragging'); card.setPointerCapture(e.pointerId); };
    card.onpointermove = (e) => {
      if (!drag) return; dx = e.clientX - sx;
      card.style.transform = `translate(${dx}px,${Math.abs(dx) * 0.08}px) rotate(${dx / 18}deg)`;
      yes.style.opacity = Math.min(Math.max(dx / 100, 0), 1); no.style.opacity = Math.min(Math.max(-dx / 100, 0), 1);
    };
    const end = () => {
      if (!drag) return; drag = false; card.classList.remove('dragging');
      if (Math.abs(dx) > 110) decide(dx > 0); else { card.style.transform = ''; yes.style.opacity = no.style.opacity = 0; }
      dx = 0;
    };
    card.onpointerup = end; card.onpointercancel = end;
  }
  function decide(like) {
    if (busy) return; const card = $('.card.top', $('#deck')); if (!card) return;
    busy = true;
    const it = items()[S.idx[S.role]];
    card.classList.remove('dragging');
    const yes = $('.stamp.yes', card), no = $('.stamp.no', card);
    (like ? yes : no).style.opacity = 1;
    card.style.transform = `translate(${like ? 700 : -700}px,60px) rotate(${like ? 30 : -30}deg)`; card.style.opacity = 0;
    setTimeout(() => {
      S.idx[S.role]++; if (like) addMatch(it); save(); busy = false; renderDeck();
    }, 330);
  }
  $('#btn-like').onclick = () => decide(true);
  $('#btn-nope').onclick = () => decide(false);
  $('#btn-info').onclick = () => {
    const it = items()[S.idx[S.role]]; if (!it) return;
    if (S.role === 'maker' && it.hazard) return showHazard('liion', true);
    modal(`<h3>${esc(it.title)}</h3><p>${S.role === 'maker' ? 'No hazardous components flagged by the collector.' : esc(it.story || '')}</p><p>Always meet in a public place, wear gloves when handling boards, and test parts before powering a full system.</p><div class="acts"><button class="btn btn-primary" data-close>Got it</button></div>`);
  };
  document.addEventListener('keydown', (e) => {
    if (!$('#modal').hidden || !$('#view-discover').classList.contains('active')) return;
    if (e.key === 'ArrowRight') decide(true); if (e.key === 'ArrowLeft') decide(false);
  });

  /* ---------- matches ---------- */
  function addMatch(it) {
    const isPart = S.role === 'maker';
    const m = { id: 'M-' + uid(), itemId: it.id, cat: it.cat, title: it.title, other: isPart ? it.collector : it.maker, area: it.area,
      weight: it.weight || 0.3, hazard: !!it.hazard, as: S.role, status: 'new', ts: Date.now() };
    S.matches.unshift(m); updateBadge(); confetti();
    modal(`<h3 class="match-title">It's a match!</h3>
      <p style="text-align:center"><b>${esc(m.other)}</b> ${isPart ? 'has' : 'needs'} <b>${esc(it.title)}</b>.<br>${esc(m.area)} · ${it.km} km away</p>
      ${m.hazard ? `<p style="color:var(--amber)">⚠ This lot contains lithium cells. Transport them taped, in a non-flammable box, and never charge without a protection circuit.</p>` : ''}
      <div class="acts"><button class="btn" data-close>Keep swiping</button><button class="btn btn-primary" id="go-matches">View match</button></div>`,
      (c) => ($('#go-matches', c).onclick = () => { closeModal(); setView('matches'); }));
  }
  function updateBadge() {
    const n = S.matches.filter((m) => m.status === 'new').length; const b = $('#badge-matches');
    b.textContent = n; b.hidden = !n;
  }
  function renderMatches() {
    const el = $('#matches-list');
    if (!S.matches.length) { el.innerHTML = `<div class="panel">No matches yet. Swipe right on something you like. 💚</div>`; return; }
    el.innerHTML = S.matches.map((m) => `<div class="item" data-id="${m.id}">
      <div class="ico">${icon(m.cat)}</div>
      <div class="meta"><b>${esc(m.title)}</b><span>${esc(m.other)} · ${esc(m.area)}</span><br>
        <span class="tag ${m.status === 'sealed' ? 'done' : ''}">${m.status === 'new' ? 'NEW MATCH' : m.status === 'scheduled' ? 'PICKUP PROPOSED' : 'SEALED ON-CHAIN'}</span>
        ${m.hazard ? '<span class="tag" style="color:var(--amber)">⚠ HAZARD LOT</span>' : ''}</div>
      <div class="acts">
        ${m.status === 'new' ? `<button class="btn" data-act="pickup">Propose pickup</button>` : ''}
        ${m.status !== 'sealed' ? `<button class="btn btn-primary" data-act="seal">Seal exchange ⛓</button>` : `<a class="btn" target="_blank" rel="noopener" href="${Sol.explorer(m.sig)}">View proof ↗</a>`}
      </div></div>`).join('');
    $$('[data-act]', el).forEach((b) => (b.onclick = () => {
      const m = S.matches.find((x) => x.id === b.closest('.item').dataset.id);
      if (b.dataset.act === 'pickup') {
        m.status = 'scheduled'; save(); updateBadge(); renderMatches();
        toast('Pickup proposed at a public spot — stay safe! ✅');
      } else sealExchange(m);
    }));
  }
  async function sealExchange(m) {
    const h = (await sha(JSON.stringify({ id: m.id, item: m.itemId, cat: m.cat, kg: m.weight, ts: m.ts }))).slice(0, 16);
    const memo = `ReCircuit v1|EXCHANGE|${m.id}|cat:${m.cat}|kg:${m.weight}|h:${h}`;
    const sig = await anchorFlow(memo, 'Exchange sealed · ' + m.title, 'EXCHANGE');
    if (sig) { m.status = 'sealed'; m.sig = sig; save(); updateBadge(); renderMatches(); }
  }

  /* ---------- post ---------- */
  function renderPost() {
    const maker = S.role === 'maker';
    $('#post-title').textContent = maker ? 'Post a request' : 'Post a find';
    $('#post-sub').textContent = maker ? 'Tell collectors what you are building and what parts you need.' : 'List a part you recovered. Flag hazards so makers can prepare.';
    $('#post-cond-wrap').style.display = maker ? 'none' : '';
    $('#post-submit').textContent = maker ? 'Publish request' : 'Publish find';
    const mine = S.posts;
    $('#my-posts').innerHTML = mine.length ? mine.map((p) => `<div class="item"><div class="ico">${icon(p.cat)}</div><div class="meta"><b>${esc(p.title)}</b><span>${p.kind === 'find' ? 'Find' : 'Request'} · ${esc(p.price || p.budget || '')}</span></div><span class="tag">LIVE</span></div>`).join('') : `<div class="panel">Nothing posted yet.</div>`;
  }
  $('#post-form').onsubmit = (e) => {
    e.preventDefault(); const maker = S.role === 'maker';
    const base = { id: 'u' + uid(), title: $('#post-title-input').value.trim(), cat: $('#post-cat').value, area: 'Near you', km: 0.5 };
    const post = maker
      ? Object.assign(base, { kind: 'want', maker: 'You', role: 'Maker', budget: 'Budget: ' + ($('#post-price').value || 'R$ 0'), story: 'Posted from ReCircuit.' })
      : Object.assign(base, { kind: 'find', collector: 'You', cond: $('#post-cond').value, condLabel: $('#post-cond').selectedOptions[0].text, weight: parseFloat($('#post-weight').value) || 0.2, hazard: $('#post-hazard').checked, price: $('#post-price').value || 'Free', specs: ['Posted by you'] });
    S.posts.unshift(post); save(); e.target.reset(); renderPost();
    toast(maker ? 'Request published — collectors will see it.' : 'Find published — makers can now swipe on it.');
  };

  /* ---------- safe disposal ---------- */
  function renderSafety() {
    $('#hazard-list').innerHTML = D.hazards.map((h) => `<details class="hz" id="hz-${h.id}"><summary><span style="font-size:1.4rem">${h.icon}</span>${esc(h.name)}<span class="lvl ${h.level}">${h.level.toUpperCase()} · ${esc(h.risk)}</span></summary>
      <div class="body"><p>${esc(h.why)}</p><div><h4>Do</h4><ul class="do">${h.do.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Don't</h4><ul class="dont">${h.dont.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></details>`).join('');
    const ts = $('#disp-type'); if (!ts.options.length) { ts.innerHTML = D.hazards.map((h) => `<option value="${h.id}">${h.icon} ${esc(h.name)}</option>`).join(''); ts.onchange = syncDisp; $('#disp-form').addEventListener('change', syncChecks); }
    syncDisp(); renderReceipts();
  }
  function syncDisp() {
    const id = $('#disp-type').value; const h = D.hazards.find((x) => x.id === id);
    $('#disp-point').innerHTML = D.dropoffs.filter((d) => d.accepts.includes(id)).map((d) => `<option value="${d.id}">${esc(d.name)} · ${d.km} km</option>`).join('') || '<option value="">No point found nearby</option>';
    $('#disp-checks').innerHTML = `<legend>Confirm safe handling</legend>` + h.do.slice(0, 3).map((x, i) => `<label><input type="checkbox" data-chk /> ${esc(x)}</label>`).join('');
    syncChecks();
  }
  function syncChecks() { const c = $$('[data-chk]'); $('#disp-submit').disabled = !(c.length && c.every((x) => x.checked) && $('#disp-point').value); }
  $('#disp-form').onsubmit = async (e) => {
    e.preventDefault();
    const h = D.hazards.find((x) => x.id === $('#disp-type').value); const point = D.dropoffs.find((d) => d.id === $('#disp-point').value);
    const qty = +$('#disp-qty').value, kg = +$('#disp-kg').value;
    const r = { id: 'RC-' + uid(), type: h.id, name: h.name, qty, kg, point: point.id, pointName: point.name, pts: Math.max(1, Math.round(kg * h.pointsPerKg)), ts: Date.now() };
    r.hash = await sha(JSON.stringify({ id: r.id, type: r.type, qty, kg, point: r.point, ts: r.ts }));
    S.receipts.unshift(r); save(); renderReceipts(); updateImpactBits();
    toast(`Receipt ${r.id} created · +${r.pts} pts`); confetti();
    $$('[data-chk]').forEach((c) => (c.checked = false)); syncChecks();
  };
  function renderReceipts() {
    $('#receipts').innerHTML = S.receipts.map((r) => `<div class="item receipt"><div class="meta"><b>${esc(r.id)} · ${esc(r.name)}</b><span>${r.qty} items · ${r.kg} kg · ${esc(r.pointName)}</span><br><span class="mono">sha256:${r.hash.slice(0, 24)}…</span></div>
      <div class="acts"><span class="tag">+${r.pts} PTS</span>${r.sig ? `<a class="btn" target="_blank" rel="noopener" href="${Sol.explorer(r.sig)}">Proof ↗</a>` : `<button class="btn btn-primary" data-anchor="${r.id}">Anchor on Solana ⛓</button>`}</div></div>`).join('');
    $$('[data-anchor]').forEach((b) => (b.onclick = async () => {
      const r = S.receipts.find((x) => x.id === b.dataset.anchor);
      const memo = `ReCircuit v1|DISPOSAL|${r.id}|${r.type}|n:${r.qty}|kg:${r.kg}|dp:${r.point}|h:${r.hash.slice(0, 16)}`;
      const sig = await anchorFlow(memo, 'Safe disposal · ' + r.name, 'DISPOSAL');
      if (sig) { r.sig = sig; save(); renderReceipts(); }
    }));
  }

  /* ---------- impact ---------- */
  function updateImpactBits() { /* hook for future live updates */ }
  function renderImpact() {
    const sealed = S.matches.filter((m) => m.status === 'sealed').length;
    const kgParts = S.matches.reduce((a, m) => a + (m.weight || 0), 0);
    const kgHaz = S.receipts.reduce((a, r) => a + r.kg, 0);
    const pts = S.receipts.reduce((a, r) => a + r.pts, 0) + sealed * 10;
    const stat = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
    $('#stats').innerHTML = stat(S.matches.length, 'Parts matched') + stat(kgParts.toFixed(1), 'kg of e-waste kept in use') + stat(kgHaz.toFixed(1), 'kg hazardous waste safely routed') + stat(pts, 'Reputation points') + stat(S.proofs.length, 'Solana proofs');
    $('#proofs').innerHTML = S.proofs.length ? S.proofs.map((p) => `<div class="item"><div class="meta"><b>${esc(p.label)}</b><span class="mono">${esc(p.sig.slice(0, 44))}…</span></div><a class="btn" target="_blank" rel="noopener" href="${Sol.explorer(p.sig)}">Explorer ↗</a></div>`).join('') : `<div class="panel">No proofs yet. Seal an exchange or anchor a disposal receipt.</div>`;
  }

  /* ---------- wallet ---------- */
  function paintWallet() {
    const b = $('#btn-wallet');
    if (Sol.publicKey) { b.textContent = (Sol.mode === 'demo' ? '🧪 ' : '👻 ') + Sol.short(); b.classList.add('on'); } else { b.textContent = 'Connect wallet'; b.classList.remove('on'); }
  }
  async function walletModal() {
    if (Sol.publicKey) {
      let bal = '…'; modal(walletConnected(bal), bindWallet);
      try { bal = (await Sol.balance()).toFixed(4); } catch (e) { bal = 'n/a'; }
      modal(walletConnected(bal), bindWallet); return;
    }
    modal(`<h3>Connect a wallet</h3><p>ReCircuit writes tiny proofs to <b>Solana Devnet</b> (no real money). Use Phantom, or a throw-away in-browser demo wallet so you can test in one click.</p>
      <div class="acts" style="flex-direction:column"><button class="btn btn-primary" id="w-phantom">👻 Phantom</button><button class="btn" id="w-demo">🧪 Demo wallet (Devnet)</button></div>`, bindWallet);
  }
  const walletConnected = (bal) => `<h3>Wallet connected</h3><p class="mono">${Sol.publicKey.toString()}</p><p>${Sol.mode === 'demo' ? 'Demo wallet (Devnet only)' : 'Phantom'} · Balance: <b>${bal} SOL</b></p>
    <div class="acts"><button class="btn" id="w-air">Airdrop 1 SOL</button><a class="btn" target="_blank" rel="noopener" href="https://faucet.solana.com">Faucet ↗</a></div>
    <div class="acts"><button class="btn" id="w-out">Disconnect</button><button class="btn btn-primary" data-close>Close</button></div>`;
  function bindWallet(c) {
    const on = (id, fn) => { const x = $(id, c); if (x) x.onclick = fn; };
    on('#w-phantom', async () => { try { await Sol.connectPhantom(); paintWallet(); closeModal(); toast('Phantom connected'); } catch (e) { toast(e.message, true); } });
    on('#w-demo', () => { try { Sol.connectDemo(); paintWallet(); closeModal(); toast('Demo wallet ready'); } catch (e) { toast(e.message, true); } });
    on('#w-out', async () => { await Sol.disconnect(); paintWallet(); closeModal(); });
    on('#w-air', async () => { toast('Requesting airdrop…'); try { await Sol.airdrop(1); toast('Airdrop received ✔'); walletModal(); } catch (e) { toast('Airdrop rate-limited — use faucet.solana.com', true); } });
  }
  $('#btn-wallet').onclick = walletModal;

  /** returns signature or null */
  async function anchorFlow(memo, label, kind) {
    if (!Sol.available()) { toast('Solana library failed to load (offline?).', true); return null; }
    if (!Sol.publicKey) { walletModal(); toast('Connect a wallet first', true); return null; }
    modal(`<h3>Anchoring on Solana…</h3><p>Writing proof to Devnet. Memo:</p><p class="mono">${esc(memo)}</p><p>Waiting for confirmation ⛓</p>`);
    try {
      const sig = await Sol.anchor(memo);
      S.proofs.unshift({ sig, label, kind, memo, ts: Date.now() }); save(); confetti();
      modal(`<h3>Proof confirmed ✔</h3><p>${esc(label)}</p><p class="mono">${sig}</p><div class="acts"><a class="btn btn-primary" target="_blank" rel="noopener" href="${Sol.explorer(sig)}">Open in Explorer ↗</a><button class="btn" data-close>Close</button></div>`);
      return sig;
    } catch (e) {
      const needs = e.message === 'NEEDS_FUNDS';
      modal(`<h3>${needs ? 'Wallet needs Devnet SOL' : 'Transaction failed'}</h3><p>${needs ? 'The public faucet is rate-limited. Grab free Devnet SOL, then retry.' : esc(e.message || String(e))}</p><div class="acts"><a class="btn btn-primary" target="_blank" rel="noopener" href="https://faucet.solana.com">Open faucet ↗</a><button class="btn" data-close>Close</button></div>${Sol.publicKey ? `<p class="mono">${Sol.publicKey.toString()}</p>` : ''}`);
      return null;
    }
  }
  function showHazard(id) {
    const h = D.hazards.find((x) => x.id === id);
    modal(`<h3>${h.icon} ${esc(h.name)}</h3><p>${esc(h.why)}</p><h4>Do</h4><ul>${h.do.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h4>Don't</h4><ul>${h.dont.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="acts"><button class="btn" id="to-safety">Safe disposal guide</button><button class="btn btn-primary" data-close>Understood</button></div>`,
      (c) => ($('#to-safety', c).onclick = () => { closeModal(); setView('safety'); }));
  }

  /* ---------- boot ---------- */
  setRole(S.role); updateBadge(); paintWallet();
})();
