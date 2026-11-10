import { T, D, Q, DOMAINS, RANKS } from './problems.js';

/* ============================ CONFIG ============================ */
const STORAGE_KEY = 'saa-rush';
const SCHEMA = 3;                 // schema bump for domain stats and daily tracking
const DEFAULT_ROUND = 8;
const DIAGRAM_SECONDS = 100;
const CHOICE_SECONDS = 45;
const COMPUTE = ['ec2', 'asg'];   // EC2 and ASG are interchangeable
const LIGHT_TILES = ['#ED7100', '#7AA116'];
const STAR_MULT = { 3: 1, 2: 0.6, 1: 0, 0: 0 };
const SPEED_SHARE = 0.5;
const REVIEW_XP = 60;
const REVIEW_GAP = 2;

// Difficulty profiles genuinely modify puzzle rules, tolerances, and pool filtering
const DIFF_CONFIG = {
  easy: {
    hearts: 4,
    extraLines: 3,
    decoys: 4,
    timerMult: 1.4,
    tiers: ['easy', 'medium']
  },
  medium: {
    hearts: 3,
    extraLines: 2,
    decoys: 6,
    timerMult: 1.0,
    tiers: ['easy', 'medium', 'hard']
  },
  hard: {
    hearts: 2,
    extraLines: 1,
    decoys: 9,
    timerMult: 0.7,
    tiers: ['medium', 'hard']
  }
};

/* ============================ HELPERS & PRNG ============================ */
const $ = selector => document.querySelector(selector);
const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const srcOf = item => item.d || item.m;
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

const localDay = ms => {
  const d = new Date(ms);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
};

// Seeded PRNG (Mulberry32) for deterministic Daily Challenges
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seededShuffle(list, rng) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const tileText = key => (T[key] && LIGHT_TILES.includes(T[key][1])) ? '#111' : '#fff';
const tileHTML = key => T[key] ? `<i style="background:${T[key][1]};color:${tileText(key)}">${T[key][2]}</i>${T[key][0]}` : key;

const starsHTML = (n, big) =>
  `<div class="stars${big ? ' big' : ''}" role="img" aria-label="${n} of 3 stars">${[0, 1, 2]
    .map(i => `<span class="st${i < n ? ' on' : ''}" style="--i:${i}" aria-hidden="true">${i < n ? '★' : '☆'}</span>`).join('')}</div>`;

/* ============================ SOUND & HAPTICS ============================ */
let audioCtx = null;
const soundOn = () => !!$('#sound')?.checked;

function getCtx() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (e) { return null; }
}

function tone(freq, start, dur, type = 'sine', vol = 0.06) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (e) {}
}

const SFX = {
  link: [[660, 0, 0.1], [880, 0.08, 0.14]],
  good: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.22]],
  miss: [[220, 0, 0.14, 'sawtooth'], [165, 0.12, 0.22, 'sawtooth']],
  heart: [[440, 0, 0.1], [554, 0.08, 0.12], [659, 0.16, 0.15], [880, 0.24, 0.25]],
  golden: [[587, 0, 0.12], [740, 0.1, 0.14], [880, 0.2, 0.25]]
};
const HAPTIC = { link: 12, good: [20, 40, 20], miss: [60, 40, 60], heart: [30, 30, 50], golden: [40, 40, 80] };

function feedback(kind) {
  if (!soundOn()) return;
  (SFX[kind] || []).forEach(([f, s, d, t]) => tone(f, s, d, t || 'sine'));
  try { if (navigator.vibrate) navigator.vibrate(HAPTIC[kind]); } catch (e) {}
}

/* ============================ STORAGE & PERSISTENCE ============================ */
const loadSave = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    s.domainStats = s.domainStats || { compute: { c: 0, t: 0 }, vpc: { c: 0, t: 0 }, hybrid: { c: 0, t: 0 }, storage: { c: 0, t: 0 }, edge: { c: 0, t: 0 } };
    s.totalXp = s.totalXp || 0;
    s.badges = s.badges || [];
    return s;
  } catch (e) {
    return { domainStats: { compute: { c: 0, t: 0 }, vpc: { c: 0, t: 0 }, hybrid: { c: 0, t: 0 }, storage: { c: 0, t: 0 }, edge: { c: 0, t: 0 } }, totalXp: 0, badges: [] };
  }
};

const writeSave = obj => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {} };

let state;
let timerRaf = null;
let mode = loadSave().mode || 'all';
let nextNodeId = 0;

function getDifficulty() {
  return document.querySelector('input[name="difficulty"]:checked')?.value || loadSave().difficulty || 'medium';
}

function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
}

function getNextRank(xp) {
  return RANKS.find(r => r.minXp > xp) || null;
}

// Build filtered pool based on difficulty preference
function buildPool(forceDifficulty = null) {
  const diff = forceDifficulty || getDifficulty();
  const tiers = DIFF_CONFIG[diff]?.tiers || ['easy', 'medium', 'hard'];

  const matchTier = item => tiers.includes((item.d || item.m).diff);
  let dPool = D.filter(matchTier);
  let qPool = Q.filter(matchTier);

  // Fallback if filter is too narrow
  if (!dPool.length) dPool = [...D];
  if (!qPool.length) qPool = [...Q];

  return [
    ...(mode !== 'mc' ? dPool.map(d => ({ d })) : []),
    ...(mode !== 'd' ? qPool.map(m => ({ m })) : [])
  ];
}

function getMaxQuestions() {
  const pool = buildPool();
  return Math.max(1, pool.length);
}

function updateSettingsUI() {
  const input = $('#roundLength');
  const unit = $('.unit');
  if (unit) unit.textContent = 'problems';

  if (input) {
    const max = Math.max(1, getMaxQuestions());
    input.max = max;
    input.min = 1;
    const val = parseInt(input.value, 10);
    if (isNaN(val)) input.value = Math.min(DEFAULT_ROUND, max);
    else if (val > max) input.value = max;
    else if (val < 1) input.value = 1;

    const s = loadSave();
    s.roundLength = parseInt(input.value, 10);
    writeSave(s);
  }
}

function initSettings() {
  const save = loadSave();
  if ((save.schema || 1) < SCHEMA) {
    save.schema = SCHEMA;
    writeSave(save);
  }

  const radio = $(`input[name="difficulty"][value="${save.difficulty || 'medium'}"]`);
  if (radio) radio.checked = true;

  const input = $('#roundLength');
  if (input) input.value = save.roundLength || DEFAULT_ROUND;

  if ($('#zen')) $('#zen').checked = !!save.zen;
  if ($('#sound')) $('#sound').checked = !!save.sound;

  updateSettingsUI();
}

/* ============================ TIMER (speed bonus only) ============================ */
function stopTimer() {
  if (timerRaf) {
    cancelAnimationFrame(timerRaf);
    timerRaf = null;
  }
}

function startTimer(seconds) {
  stopTimer();
  const diff = state.difficulty || getDifficulty();
  const mult = DIFF_CONFIG[diff]?.timerMult || 1.0;
  const durationMs = seconds * 1000 * mult;
  const end = performance.now() + durationMs;
  state.timer = { end, dur: durationMs };

  const tb = $('#tb'), wrap = $('.t'), tl = $('#tl');
  let lastSec = -1;

  function frame(now) {
    const remaining = Math.max(0, end - now);
    if (tb) tb.style.width = (remaining / durationMs * 100) + '%';

    const sec = Math.ceil(remaining / 1000);
    if (wrap && sec !== lastSec) {
      lastSec = sec;
      wrap.setAttribute('aria-valuenow', sec);
    }

    if (remaining <= 0) {
      timerRaf = null;
      if (tl) tl.textContent = '· bonus expired, take your time';
      return;
    }
    timerRaf = requestAnimationFrame(frame);
  }
  timerRaf = requestAnimationFrame(frame);
}

const speedFrac = () => (!state.timer || state.zen)
  ? 0
  : Math.max(0, Math.min(1, (state.timer.end - performance.now()) / state.timer.dur));

/* ============================ HOME & MASTERY UI ============================ */
function renderMasteryCard(save) {
  const rank = getRank(save.totalXp || 0);
  const next = getNextRank(save.totalXp || 0);
  const xpIntoLevel = save.totalXp - rank.minXp;
  const levelSpan = next ? next.minXp - rank.minXp : 1;
  const levelPct = next ? Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100)) : 100;

  const rows = Object.entries(DOMAINS).map(([catKey, dom]) => {
    const st = save.domainStats?.[catKey] || { c: 0, t: 0 };
    const pct = st.t > 0 ? Math.round((st.c / st.t) * 100) : 0;
    return `
      <div class="m-row">
        <span class="m-lbl">${dom.icon} ${dom.title}</span>
        <div class="m-bar"><i style="width:${pct}%"></i></div>
        <span class="m-val">${st.c}/${st.t} (${pct}%)</span>
      </div>`;
  }).join('');

  return `
    <div class="card mastery-box">
      <div class="m-head">
        <div>
          <span class="rank-badge">${rank.badge} ${rank.title}</span>
          <div class="hint">Lifetime: <b>${save.totalXp || 0} XP</b> ${next ? `· ${next.minXp - (save.totalXp || 0)} XP to ${next.title}` : '· Max Rank!'}</div>
        </div>
        <div class="xp-pill">${levelPct}%</div>
      </div>
      <div class="t xp-prog"><i style="width:${levelPct}%"></i></div>
      <div class="m-grid">${rows}</div>
    </div>`;
}

function showHome() {
  stopTimer();
  const save = loadSave(), badges = save.badges || [];
  $('#hud').hidden = true;
  if ($('#settings')) $('#settings').hidden = false;
  updateSettingsUI();

  const today = localDay(Date.now());
  const dailyDone = save.lastDaily === today;

  $('#app').innerHTML = `
  <div class="card">
      <div class="v">Build it. Light it up. Earn your stars.</div>
      <p>Drag services onto the canvas, link them together, and submit. Distractors and problem sets adapt to chosen difficulty, multiple-choice options are fully shuffled, and missed topics return for redemption.</p>
      <div class="row">
        <button id="daily-btn" class="${dailyDone ? 'g' : 'big'}">📅 Daily Challenge #Day-${today % 1000} ${dailyDone ? '✔ (Completed)' : ''}</button>
      </div>
      <p class="hint">Daily Challenge is seeded identically worldwide · Streak: ${save.streak || 0} day(s) · Best score: ${save.best || 0}</p>
      <div>${badges.map(b => `<span class="bd">${b}</span>`).join('') || '<span class="hint">No badges yet</span>'}</div>
      <div class="row" id="modes">${[['all', 'All'], ['d', 'Diagrams'], ['mc', 'Multiple choice']]
          .map(([k, label]) => `<button class="${mode == k ? '' : 'g'}" data-mode="${k}">${label}</button>`).join('')}</div>
      <div class="row"><button id="go" class="big">Start custom round</button></div>
  </div>
  ${renderMasteryCard(save)}`;

  document.querySelectorAll('#modes button').forEach(btn => btn.onclick = () => {
    mode = btn.dataset.mode;
    const s = loadSave(); s.mode = mode; writeSave(s);
    showHome();
  });

  $('#go').onclick = () => startRound(false);
  $('#daily-btn').onclick = () => startDailyChallenge();
}

/* ============================ ROUND SETUP ============================ */
function startRound(isDaily = false, dailyItems = []) {
  const save = loadSave(), today = localDay(Date.now());
  save.streak = save.last === today ? save.streak || 1 : save.last === today - 1 ? (save.streak || 0) + 1 : 1;
  save.last = today;
  writeSave(save);

  const diff = isDaily ? 'medium' : getDifficulty();
  const cfg = DIFF_CONFIG[diff];

  let items;
  if (isDaily) {
    items = dailyItems;
  } else {
    items = shuffle(buildPool(diff));
    const inputVal = parseInt($('#roundLength')?.value, 10);
    const wanted = (!isNaN(inputVal) && inputVal > 0) ? inputVal : DEFAULT_ROUND;
    items = items.slice(0, Math.min(wanted, items.length));
  }

  // Inject a 🌟 Golden Question for variable surprise rewards (~1 in each round)
  if (items.length > 2) {
    const goldenIdx = Math.floor(Math.random() * items.length);
    items[goldenIdx].golden = true;
  }

  state = {
    difficulty: diff,
    maxHearts: cfg.hearts,
    hearts: cfg.hearts,
    extraTolerance: cfg.extraLines,
    xp: 0, combo: 1, index: 0, items, builds: 0,
    consecutiveCorrect: 0,
    zen: isDaily ? false : !!$('#zen')?.checked,
    isDaily,
    seen: new Set(items.map(srcOf)),
    log: [], recovered: 0
  };

  $('#hud').hidden = false;
  if ($('#settings')) $('#settings').hidden = true;
  showItem();
}

function startDailyChallenge() {
  const today = localDay(Date.now());
  const rng = mulberry32(today);

  // Pick 2 diagrams and 3 multiple choice questions deterministically
  const dShuffled = seededShuffle(D, rng);
  const qShuffled = seededShuffle(Q, rng);

  const dailyItems = [
    { d: dShuffled[0] },
    { m: qShuffled[0] },
    { d: dShuffled[1] },
    { m: qShuffled[1] },
    { m: qShuffled[2] }
  ];

  startRound(true, dailyItems);
}

function renderHud() {
  const lives = state.zen
    ? '🧘 Zen'
    : `<span class="sr">Hearts: </span>${'❤️'.repeat(state.hearts) || '💔'}`;
  const diffBadge = `<span class="diff-chip ${state.difficulty}">${state.difficulty.toUpperCase()}</span>`;
  $('#hud').innerHTML = `
    <span>${lives}</span>
    <span>XP ${state.xp}</span>
    <span aria-label="Combo multiplier ${state.combo}x">${state.combo >= 3 ? '🔥 ' : ''}Combo x${state.combo}</span>
    ${diffBadge}
    <span>📅 ${loadSave().streak || 1}d</span>`;
}

/* ============================ SHOW ONE ITEM ============================ */
function showItem() {
  stopTimer();
  if (!state.hearts || state.index >= state.items.length) return showEnd();
  renderHud();

  const item = state.items[state.index], d = item.d;
  Object.assign(state, {
    current: item, nodes: [], edges: [], selected: null, picks: [],
    misses: 0, hintUsed: false, finished: false, timer: null,
    liveOn: false, liveEls: [], liveHave: [], choiceMap: []
  });

  const seconds = d ? DIAGRAM_SECONDS : CHOICE_SECONDS;
  const diff = state.difficulty || 'medium';
  const mult = DIFF_CONFIG[diff]?.timerMult || 1.0;
  const shown = Math.round(seconds * mult);

  const label = d ? 'Build the architecture' : item.m.m ? 'Choose TWO' : 'Choose ONE';
  const tag = item.review ? '🔁 Review' : item.bonus ? '✨ One more' : '';
  const goldenBadge = item.golden ? '<span class="bd gold-bd">🌟 Golden Question (2x XP)</span>' : '';
  const domInfo = DOMAINS[(d || item.m).cat];

  $('#app').innerHTML = `
  <div class="card ${item.golden ? 'golden-card' : ''}">
      ${state.zen ? '' : `<div class="t" role="progressbar" aria-label="Speed bonus time remaining" aria-valuemin="0" aria-valuemax="${shown}" aria-valuenow="${shown}"><i id="tb" style="width:100%"></i></div>`}
      <div class="q-meta">
        <span><b>${label}</b> · ${state.index + 1}/${state.items.length}${tag ? ` <span class="bd">${tag}</span>` : ''}${goldenBadge}</span>
        ${domInfo ? `<span class="dom-tag">${domInfo.icon} ${domInfo.title}</span>` : ''}
      </div>
      <p class="q-txt">${d ? d.q : item.m.q}</p>
      <div id="body"></div>
      <div class="row">
          <button id="ck" disabled>${d ? 'Check architecture' : 'Submit'}</button>
          ${d ? '<button class="g" id="rm">Remove selected</button><button class="g" id="cl">Clear</button><button class="g" id="sk">Skip &amp; reveal</button>' : ''}
      </div>
  </div>
  <div id="fb" aria-live="polite"></div>`;

  d ? buildDiagramUI(d) : buildChoiceUI(item.m);
  $('#ck').onclick = submit;
  if (d) $('#sk').onclick = giveUp;

  if (!state.zen) startTimer(seconds);
}

/* ---------------- multiple choice (Dynamic Shuffle Fixes Bias) ---------------- */
function buildChoiceUI(m) {
  // Create shuffled mapping [origIdx] -> displayPos to eliminate position bias entirely
  const origIndices = m.o.map((_, i) => i);
  const shuffledOrig = shuffle(origIndices);
  state.choiceMap = shuffledOrig;

  $('#body').innerHTML = shuffledOrig.map((origIdx, pos) =>
    `<button class="o" data-orig="${origIdx}" data-pos="${pos}">${m.o[origIdx]}</button>`
  ).join('');

  document.querySelectorAll('.o').forEach(btn => btn.onclick = () => {
    if (state.finished) return;
    const origIdx = +btn.dataset.orig;
    if (m.m) {
      state.picks = state.picks.includes(origIdx)
        ? state.picks.filter(p => p !== origIdx)
        : [...state.picks, origIdx];
    } else {
      state.picks = [origIdx];
    }
    document.querySelectorAll('.o').forEach(el => {
      const idx = +el.dataset.orig;
      el.classList.toggle('s', state.picks.includes(idx));
    });
    const ck = $('#ck');
    if (ck) ck.disabled = state.picks.length === 0;
  });
}

/* ---------------- diagram builder ---------------- */
function buildDiagramUI(d) {
  const diff = state.difficulty || 'medium';
  state.liveOn = diff !== 'hard';   // Hard difficulty hides real-time hints

  const requiredKeys = Object.keys(d.n || {});
  const availableDecoys = Object.keys(T).filter(k => !requiredKeys.includes(k));
  const decoyCount = DIFF_CONFIG[diff]?.decoys ?? 6;
  const chosenDecoys = shuffle(availableDecoys).slice(0, decoyCount);
  const keys = shuffle([...requiredKeys, ...chosenDecoys]);

  const links = d.e || [];
  const liveHTML = !state.liveOn
    ? '<p class="hint">Hard mode: live link assist disabled. Rely on your architecture blueprint.</p>'
    : links.length
      ? `<div class="live"><span class="hint" id="lkc" aria-live="polite">0/${links.length} links</span>
          <div class="lkbar" id="lk" role="list" aria-label="Required links">${links
            .map((_, i) => `<span class="lk" role="listitem" data-i="${i}" aria-label="Link ${i + 1}: not connected yet">?</span>`).join('')}</div></div>`
      : '';

  $('#body').innerHTML = `
  ${liveHTML}
  <div id="cv"><svg id="sv"></svg></div>
  <div id="pal">${keys.map(k => `<div class="p" data-k="${k}" tabindex="0" role="button" aria-label="Add ${T[k]?.[0] || k}">${tileHTML(k)}</div>`).join('')}</div>
  <p class="hint">Drag or tap service to place. Select two nodes to link them. Delete key removes selected.</p>
  <details class="hint"><summary>Connection guidelines</summary>
      1. Flow: link components in traffic order (users → DNS → CDN → LB → compute → database).<br>
      2. Placement: link compute to its subnet. EC2 and ASG count identically.<br>
      3. Security &amp; Endpoints link to the resource they protect or provide access to.<br>
      4. IGW connects to the first public load balancer or public-facing node.<br>
      5. Hybrid: onprem → VPN/DX → gateway → VPC.<br>
      6. Extra lines tolerance: up to ${state.extraTolerance} extra line(s) tolerated in ${diff} mode.
  </details>`;

  state.liveEls = [...document.querySelectorAll('#lk .lk')];
  state.liveHave = links.map(() => false);

  document.querySelectorAll('.p').forEach(el => {
    el.onpointerdown = e => dragFromPalette(el, e);
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addNodeAuto(el.dataset.k); } };
  });
  $('#rm').onclick = removeSelected;
  $('#cl').onclick = () => {
    if (state.finished) return;
    state.nodes.forEach(n => n.el.remove());
    state.nodes = [];
    state.edges = [];
    state.selected = null;
    paint();
    updateLive();
    const ck = $('#ck');
    if (ck) ck.disabled = true;
  };
}

function dragFromPalette(tile, startEvent) {
  if (state.finished) return;
  const key = tile.dataset.k, ghost = tile.cloneNode(true);
  ghost.className = 'p gh';
  ghost.removeAttribute('tabindex');
  ghost.removeAttribute('role');
  ghost.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ghost);
  const place = ev => { ghost.style.left = (ev.clientX - 41) + 'px'; ghost.style.top = (ev.clientY - 30) + 'px'; };
  place(startEvent);
  let moved = false;

  const onMove = ev => {
    if (Math.hypot(ev.clientX - startEvent.clientX, ev.clientY - startEvent.clientY) > 6) moved = true;
    place(ev);
  };
  const finish = (ev, cancelled) => {
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onCancel);
    ghost.remove();
    if (cancelled) return;
    const r = $('#cv').getBoundingClientRect();
    const inside = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
    if (!moved) addNodeAuto(key);
    else if (inside) addNode(key, ev.clientX - r.left - 38, ev.clientY - r.top - 30);
  };
  const onUp = ev => finish(ev, false), onCancel = ev => finish(ev, true);
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp);
  addEventListener('pointercancel', onCancel);
}

function addNodeAuto(key) {
  if (state.finished) return;
  const cvWidth = $('#cv')?.clientWidth || 300;
  const perRow = Math.max(1, Math.floor((cvWidth - 20) / 90));
  let slot = 0;
  while (true) {
    const sx = 10 + (slot % perRow) * 90;
    const sy = 10 + Math.floor(slot / perRow) * 90;
    const occupied = state.nodes.some(n => Math.hypot(n.x - sx, n.y - sy) < 40);
    if (!occupied) {
      addNode(key, sx, sy);
      break;
    }
    slot++;
  }
}

function addNode(key, x, y) {
  if (state.finished) return;
  const el = document.createElement('div');
  const node = { id: ++nextNodeId, k: key, x: 0, y: 0, el };
  el.className = 'n';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', T[key]?.[0] || key);
  el.innerHTML = tileHTML(key);
  $('#cv').appendChild(el);
  state.nodes.push(node);
  clampTo(node, x, y);

  el.onpointerdown = e => {
    if (state.finished) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const offX = e.clientX - node.x, offY = e.clientY - node.y;
    let dragged = false;
    el.onpointermove = ev => {
      if (Math.abs(ev.clientX - offX - node.x) + Math.abs(ev.clientY - offY - node.y) > 6) dragged = true;
      if (dragged) { clampTo(node, ev.clientX - offX, ev.clientY - offY); paint(); }
    };
    el.onpointerup = () => { el.onpointermove = null; if (!dragged) toggleSelect(node); };
    el.onpointercancel = () => { el.onpointermove = null; };
  };
  el.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(node); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { state.selected = node.id; removeSelected(); }
  };

  const ck = $('#ck');
  if (ck) ck.disabled = state.nodes.length < 2;
  paint();
  updateLive();
}

function clampTo(node, x, y) {
  const cv = $('#cv');
  node.x = Math.min(cv.clientWidth - 76, Math.max(0, x));
  node.y = Math.min(cv.clientHeight - 70, Math.max(0, y));
}

function toggleSelect(node) {
  if (state.finished) return;
  if (state.selected == null || state.selected == node.id) {
    state.selected = state.selected == node.id ? null : node.id;
  } else {
    const a = state.selected;
    const existing = state.edges.findIndex(e => e.includes(a) && e.includes(node.id));
    existing >= 0 ? state.edges.splice(existing, 1) : state.edges.push([a, node.id]);
    state.selected = null;
    paint();
    updateLive();
    return;
  }
  paint();
}

function removeSelected() {
  if (state.finished) return;
  const id = state.selected;
  if (id == null) return;
  state.nodes = state.nodes.filter(n => { if (n.id == id) n.el.remove(); return n.id != id; });
  state.edges = state.edges.filter(e => !e.includes(id));
  state.selected = null;
  const ck = $('#ck');
  if (ck) ck.disabled = state.nodes.length < 2;
  paint();
  updateLive();
}

function paint() {
  const d = state.current?.d;
  const expected = d?.e || [];
  const showGood = state.liveOn || state.finished;

  state.nodes.forEach(n => {
    n.el.style.left = n.x + 'px';
    n.el.style.top = n.y + 'px';
    n.el.classList.toggle('s', n.id == state.selected);
  });
  const find = id => state.nodes.find(n => n.id == id);
  $('#sv').innerHTML = state.edges.map(([ia, ib]) => {
    const a = find(ia), b = find(ib);
    if (!a || !b) return '';
    const good = showGood && expected.some(exp => lineMatches(a.k, b.k, exp));
    return `<line class="ln${good ? ' good' : ''}" x1="${a.x + 38}" y1="${a.y + 26}" x2="${b.x + 38}" y2="${b.y + 26}" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join('');
}

/* ============================ LIVE LINK FEEDBACK ============================ */
function updateLive() {
  const d = state.current?.d;
  if (!d || !state.liveOn || !state.liveEls.length) return;

  const res = evalLinks(d);
  let hits = 0, newly = false;
  res.forEach((r, i) => {
    const el = state.liveEls[i];
    if (!el) return;
    if (r.have) hits++;
    if (r.have !== state.liveHave[i]) {
      el.classList.toggle('on', r.have);
      if (r.have) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        newly = true;
      }
      state.liveHave[i] = r.have;
    }
    const text = r.have ? r.name : (r.need > 1 && r.matched ? `? ${Math.min(r.matched, r.need)}/${r.need}` : '?');
    if (el.textContent !== text) el.textContent = text;
    el.setAttribute('aria-label', `Link ${i + 1}: ${r.have ? r.name : 'not connected yet'}`);
  });
  const counter = $('#lkc');
  if (counter) counter.textContent = `${hits}/${res.length} links`;
  if (newly) feedback('link');
}

/* ============================ BIPARTITE MATCHING & GRADING ============================ */
const kindsFor = (a, b) => COMPUTE.includes(a) && (a === b || !COMPUTE.includes(b)) ? COMPUTE : [a];

function lineMatches(kx, ky, [a, b]) {
  const A = kindsFor(a, b), B = kindsFor(b, a);
  return (A.includes(kx) && B.includes(ky)) || (A.includes(ky) && B.includes(kx));
}

function countBipartiteMatches(nodesA, nodesB, capA, capB, drawnEdges) {
  if (!nodesA.length || !nodesB.length) return 0;

  const slotsA = [];
  nodesA.forEach(na => {
    for (let s = 0; s < capA; s++) slotsA.push({ slotId: `${na.id}_${s}`, nodeId: na.id });
  });

  const slotsB = [];
  nodesB.forEach(nb => {
    for (let s = 0; s < capB; s++) slotsB.push({ slotId: `${nb.id}_${s}`, nodeId: nb.id });
  });

  const adj = new Map();
  slotsA.forEach(sa => {
    adj.set(sa.slotId, []);
    slotsB.forEach(sb => {
      const hasEdge = drawnEdges.some(([ia, ib]) =>
        (ia === sa.nodeId && ib === sb.nodeId) || (ia === sb.nodeId && ib === sa.nodeId)
      );
      if (hasEdge) adj.get(sa.slotId).push(sb.slotId);
    });
  });

  const matchB = new Map();
  function dfs(slotAId, visited) {
    for (const slotBId of (adj.get(slotAId) || [])) {
      if (visited.has(slotBId)) continue;
      visited.add(slotBId);
      if (!matchB.has(slotBId) || dfs(matchB.get(slotBId), visited)) {
        matchB.set(slotBId, slotAId);
        return true;
      }
    }
    return false;
  }

  let count = 0;
  for (const sa of slotsA) {
    if (dfs(sa.slotId, new Set())) count++;
  }
  return count;
}

function evalLinks(d) {
  return (d.e || []).map(([a, b, need = 1]) => {
    let matched = 0;
    if (a === b) {
      const nodes = state.nodes.filter(n => kindsFor(a, b).includes(n.k));
      const used = new Set();
      state.edges.forEach(([ia, ib]) => {
        const na = nodes.find(n => n.id === ia);
        const nb = nodes.find(n => n.id === ib);
        if (na && nb && !used.has(ia) && !used.has(ib)) {
          used.add(ia);
          used.add(ib);
          matched++;
        }
      });
    } else {
      const nodesA = state.nodes.filter(n => kindsFor(a, b).includes(n.k));
      const nodesB = state.nodes.filter(n => kindsFor(b, a).includes(n.k));
      const capA = Math.max(1, Math.ceil(need / Math.max(1, nodesA.length)));
      const capB = Math.max(1, Math.ceil(need / Math.max(1, nodesB.length)));
      matched = countBipartiteMatches(nodesA, nodesB, capA, capB, state.edges);
    }
    const nameA = T[a]?.[0] || a, nameB = T[b]?.[0] || b;
    return { a, b, need, matched, have: matched >= need, name: `${nameA} ↔ ${nameB}` };
  });
}

function gradeDiagram(d) {
  const items = [];
  let ok = true;
  const counts = {};
  state.nodes.forEach(n => counts[n.k] = (counts[n.k] || 0) + 1);

  const isCompute = k => COMPUTE.includes(k);
  let totalReqCompute = 0;
  for (const k in (d.n || {})) if (isCompute(k)) totalReqCompute += d.n[k];
  let totalPlacedCompute = 0;
  COMPUTE.forEach(k => totalPlacedCompute += (counts[k] || 0));

  let computeEvaluated = false;
  for (const k in (d.n || {})) {
    if (isCompute(k)) {
      if (!computeEvaluated) {
        const have = totalPlacedCompute >= totalReqCompute;
        ok = ok && have;
        if (!have) items.push([false, `Missing compute nodes (need ${totalReqCompute} EC2 or ASG)`, 'node']);
        computeEvaluated = true;
      }
    } else {
      const have = (counts[k] || 0) >= d.n[k];
      ok = ok && have;
      if (!have) items.push([false, `Missing ${T[k]?.[0] || k}${d.n[k] > 1 ? ' (need ' + d.n[k] + ')' : ''}`, 'node']);
    }
  }

  let computeOverEvaluated = false;
  for (const k in counts) {
    if (isCompute(k)) {
      if (!computeOverEvaluated) {
        if (totalReqCompute === 0) {
          ok = false;
          items.push([false, `Compute nodes do not belong in this design`, 'node']);
        } else if (totalPlacedCompute > totalReqCompute) {
          ok = false;
          items.push([false, `Too many compute nodes (placed ${totalPlacedCompute}, need ${totalReqCompute})`, 'node']);
        }
        computeOverEvaluated = true;
      }
    } else if (!d.n?.[k]) {
      ok = false;
      items.push([false, `${T[k]?.[0] || k} does not belong in this design`, 'node']);
    } else if (counts[k] > d.n[k]) {
      ok = false;
      items.push([false, `Too many ${T[k]?.[0] || k} (placed ${counts[k]}, need ${d.n[k]})`, 'node']);
    }
  }

  const linkRes = evalLinks(d);
  linkRes.forEach(r => {
    ok = ok && r.have;
    items.push([r.have, `${r.name}${r.need > 1 ? ' x' + r.need : ''}`, 'link']);
  });

  const drawnKinds = state.edges.map(([ia, ib]) => {
    const na = state.nodes.find(n => n.id == ia);
    const nb = state.nodes.find(n => n.id == ib);
    return na && nb ? [na.k, nb.k] : null;
  }).filter(Boolean);

  const extras = drawnKinds.filter(([kx, ky]) => !(d.e || []).some(exp => lineMatches(kx, ky, exp))).length;
  const allowedExtra = state.extraTolerance ?? 2;
  if (extras > allowedExtra) {
    ok = false;
    items.push([false, `Too many unnecessary lines (${extras} drawn, max ${allowedExtra} allowed). Remove non-matching links.`, 'line']);
  }

  return {
    ok, items,
    linkHits: linkRes.filter(r => r.have).length,
    linkTotal: linkRes.length,
    off: items.filter(i => !i[0]).length
  };
}

function gradeChoice(m) {
  const ok = m.a.length === state.picks.length && m.a.every(k => state.picks.includes(k));
  document.querySelectorAll('.o').forEach(el => {
    el.disabled = true;
    const origIdx = +el.dataset.orig;
    el.classList.toggle('ok', m.a.includes(origIdx));
    el.classList.toggle('no', state.picks.includes(origIdx) && !m.a.includes(origIdx));
  });
  return { ok, items: [] };
}

function partialStars(res) {
  const frac = res.linkTotal ? res.linkHits / res.linkTotal : (res.off <= 1 ? 1 : 0);
  return frac >= 0.5 ? 2 : 1;
}

/* ============================ SUBMIT / MISS / SKIP ============================ */
function submit() {
  if (state.finished) return;
  const item = state.current;
  if (item.d) return submitDiagram(item.d);
  const res = gradeChoice(item.m);
  finishItem({ solved: res.ok, stars: res.ok ? 3 : 0, items: [] });
}

function submitDiagram(d) {
  const res = gradeDiagram(d);
  if (res.ok) {
    const flawless = state.misses === 0 && !state.hintUsed;
    return finishItem({ solved: true, stars: flawless ? 3 : 2, items: res.items });
  }
  state.misses++;
  feedback('miss');
  const cv = $('#cv');
  if (cv && !reduceMotion()) {
    cv.classList.remove('shake');
    void cv.offsetWidth;
    cv.classList.add('shake');
  }
  renderMiss(res);
}

const listHTML = items =>
  `<ul class="res">${items.map(([hit, text]) => `<li class="${hit ? 'ok' : 'no'}">${hit ? '✔' : '✘'} ${text}</li>`).join('')}</ul>`;

function renderMiss(res) {
  const linksOff = res.items.filter(i => !i[0] && i[2] === 'link').length;
  const otherOff = res.items.filter(i => !i[0] && i[2] !== 'link').length;
  const parts = [];
  if (linksOff) parts.push(`${linksOff} link${linksOff === 1 ? '' : 's'} off`);
  if (otherOff) parts.push(`${otherOff} other issue${otherOff === 1 ? '' : 's'}`);

  $('#fb').innerHTML = `
  <div class="card">
      <div class="v no">${parts.join(' · ') || 'Not quite'}</div>
      <p class="hint">Worth ${partialStars(res)} star${partialStars(res) === 1 ? '' : 's'} right now. Adjust your design and re-check, no heart lost yet.</p>
      ${state.hintUsed ? listHTML(res.items) : '<div class="row"><button class="g" id="hn">💡 Show what’s off (caps this at 2 stars)</button></div>'}
  </div>`;

  const hn = $('#hn');
  if (hn) hn.onclick = () => {
    if (state.finished) return;
    state.hintUsed = true;
    renderMiss(gradeDiagram(state.current.d));
  };
  $('#fb').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
}

function giveUp() {
  if (state.finished) return;
  const d = state.current.d;
  const res = gradeDiagram(d);
  if (res.ok) return submitDiagram(d);
  finishItem({ solved: false, stars: partialStars(res), items: res.items });
}

/* ============================ FINISH ONE ITEM & REWARDS ============================ */
function finishItem({ solved, stars, items }) {
  if (state.finished) return;
  state.finished = true;
  const frac = speedFrac();
  stopTimer();

  const item = state.current, d = item.d, review = !!item.review;
  const catKey = (d || item.m).cat || 'vpc';
  const base = d ? 150 : 100;
  let gain = 0, speed = 0, loseHeart = false, message = '', restoredHeart = false;

  // Domain tracking in persistent storage
  const save = loadSave();
  save.domainStats = save.domainStats || {};
  save.domainStats[catKey] = save.domainStats[catKey] || { c: 0, t: 0 };
  save.domainStats[catKey].t++;
  if (solved) save.domainStats[catKey].c++;

  if (review) {
    if (solved) {
      gain = REVIEW_XP;
      state.recovered++;
      message = `🔁 Review Solved! Concept mastered. +${gain} XP`;
    } else {
      message = 'Still needs study. Check the exam tip below.';
    }
  } else if (solved) {
    speed = Math.round(base * SPEED_SHARE * frac);
    gain = Math.round((base * STAR_MULT[stars] + speed) * state.combo);
    if (item.golden) gain *= 2;

    state.combo = Math.min(5, state.combo + 1);
    state.consecutiveCorrect = (state.consecutiveCorrect || 0) + 1;
    if (d) state.builds++;

    // Variable reward: Heart regenerates after 3 consecutive correct answers
    if (state.consecutiveCorrect >= 3 && state.hearts < state.maxHearts && !state.zen) {
      state.hearts++;
      state.consecutiveCorrect = 0;
      restoredHeart = true;
      feedback('heart');
    }

    const goldTag = item.golden ? '🌟 GOLDEN 2X BONUS! ' : '';
    message = `${goldTag}${stars === 3 ? (d ? 'Flawless build!' : 'Correct!') : 'Solved with retry/hint.'} +${gain} XP`;
  } else if (stars >= 2) {
    gain = Math.round(base * STAR_MULT[stars] * state.combo);
    if (item.golden) gain *= 2;
    state.consecutiveCorrect = 0;
    message = `Close! Partial credit, +${gain} XP and no heart lost.`;
  } else {
    loseHeart = true;
    state.combo = 1;
    state.consecutiveCorrect = 0;
    message = state.zen ? 'Not quite.' : 'Not quite. −1 heart';
  }

  state.xp += gain;
  save.totalXp = (save.totalXp || 0) + gain;
  writeSave(save);

  if (loseHeart && !state.zen) state.hearts--;
  if (!review) state.log.push({ stars, solved, golden: !!item.golden });

  // Re-queue misses into a learning loop 2 items later in the round
  const requeue = !review && !solved && state.hearts > 0;
  state.index++;
  if (requeue) {
    state.items.splice(Math.min(state.index + REVIEW_GAP, state.items.length), 0, { ...item, review: true });
  }

  if (item.golden && solved) feedback('golden');
  else if (!restoredHeart) feedback(solved ? 'good' : loseHeart ? 'miss' : 'link');

  const newBadges = awardBadges(frac);
  renderHud();

  $('#body')?.classList.add('locked');
  ['ck', 'rm', 'cl', 'sk'].forEach(id => { const b = $('#' + id); if (b) b.disabled = true; });
  if (d) paint();

  const buttonLabel = state.hearts && state.index < state.items.length ? 'Next challenge' : 'See results';
  $('#fb').innerHTML = `
  <div class="card">
      <div class="v ${solved ? 'ok' : 'no'}">${message}</div>
      ${restoredHeart ? '<div class="heart-alert pop">💖 3 in a row! Restored +1 Heart!</div>' : ''}
      ${review ? '' : starsHTML(stars)}
      ${speed ? `<p class="hint">⚡ Includes a speed bonus of ${speed} before combo.</p>` : ''}
      ${requeue ? '<p class="hint">🔁 Missed concepts return later this round. Nail it then for redemption XP.</p>' : ''}
      ${d && items.length ? listHTML(items) : ''}
      <div class="tip"><b>Exam tip:</b> ${(d || item.m).tip}</div>
      ${newBadges.map(b => `<span class="bd gold-bd">New badge: ${b}</span>`).join('')}
      <div class="row"><button id="nx">${buttonLabel}</button></div>
  </div>`;

  $('#nx').onclick = showItem;
  $('#nx').focus();
  $('#fb').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
}

function awardBadges(frac = 0) {
  const save = loadSave(), fresh = [];
  save.badges = save.badges || [];
  const award = (condition, name) => {
    if (condition && !save.badges.includes(name)) {
      save.badges.push(name);
      fresh.push(name);
    }
  };

  award(state.combo >= 5, '🔥 On Fire (x5 combo)');
  award(state.builds >= 3, '🏗️ Master Architect (3 builds)');
  award((save.streak || 0) >= 3, '📅 Dedicated Architect (3-day streak)');
  award(state.current?.golden && state.log[state.log.length - 1]?.solved, '🌟 Golden Touch (Golden Solved)');
  award(frac > 0.7 && state.log[state.log.length - 1]?.solved, '⚡ Speed Demon (>70% time bonus)');
  award(state.recovered >= 1, '🛡️ Quick Learner (Recovered on review)');
  award((save.domainStats?.vpc?.c || 0) >= 10, '🌐 VPC Wizard (10 VPC solved)');

  save.best = Math.max(save.best || 0, state.xp);
  writeSave(save);
  return fresh;
}

/* ============================ END SCREEN & DAILY SHARE ============================ */
function showEnd() {
  stopTimer();
  const save = loadSave();
  if ($('#settings')) $('#settings').hidden = false;
  updateSettingsUI();

  const alive = state.hearts > 0;
  const got = state.log.reduce((n, l) => n + l.stars, 0);
  const max = state.log.length * 3;
  const ratio = max ? got / max : 0;
  const overall = ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
  const missed = state.log.filter(l => !l.solved).length;
  const flawless = alive && state.log.length > 0 && state.log.every(l => l.stars === 3);
  const head = !alive ? 'Out of hearts' : flawless ? 'Flawless round!' : 'Round complete';

  if (flawless) awardBadges(0);

  // Daily Challenge tracking
  let dailyShareHTML = '';
  if (state.isDaily) {
    save.lastDaily = localDay(Date.now());
    writeSave(save);

    const emojiGrid = state.log.map(l => l.stars === 3 ? '🟩' : l.stars === 2 ? '🟨' : '🟥').join('');
    const shareText = `Architect Rush Daily #Day-${save.lastDaily % 1000} 🏗️\nScore: ${state.xp} XP | Stars: ${got}/${max}\n${emojiGrid}\n#AWSCertified #SAAC03`;

    dailyShareHTML = `
      <div class="share-box">
        <div class="emoji-preview">${emojiGrid}</div>
        <button id="copy-btn" class="big">📋 Copy Share Grid</button>
        <span id="copy-toast" class="hint" hidden>✔ Copied to clipboard!</span>
      </div>`;
  }

  $('#app').innerHTML = `
  <div class="card">
      <div class="v">${head}</div>
      ${max ? starsHTML(overall, true) : ''}
      <p>Round Score: <b>${state.xp} XP</b> · All-time Best: ${save.best || 0}${max ? ` · Stars: ${got}/${max}` : ''}</p>
      ${missed || state.recovered ? `<p class="hint">Missed: ${missed} · Recovered on review: ${state.recovered}</p>` : ''}
      ${dailyShareHTML}
      <div class="row">
        ${alive && !state.isDaily ? '<button id="more" class="big">One more challenge ▶</button>' : ''}
        <button id="go" class="${alive && !state.isDaily ? 'g' : 'big'}">New round</button>
        <button class="g" id="hm">Home</button>
      </div>
  </div>
  ${renderMasteryCard(save)}`;

  if ($('#copy-btn')) {
    $('#copy-btn').onclick = async () => {
      const emojiGrid = state.log.map(l => l.stars === 3 ? '🟩' : l.stars === 2 ? '🟨' : '🟥').join('');
      const shareText = `Architect Rush Daily #Day-${save.lastDaily % 1000} 🏗️\nScore: ${state.xp} XP | Stars: ${got}/${max}\n${emojiGrid}\n#AWSCertified #SAAC03`;
      try {
        await navigator.clipboard.writeText(shareText);
        const t = $('#copy-toast');
        if (t) { t.hidden = false; setTimeout(() => t.hidden = true, 2500); }
      } catch (err) {
        alert(shareText);
      }
    };
  }

  if ($('#more')) $('#more').onclick = oneMore;
  $('#go').onclick = () => startRound(false);
  $('#hm').onclick = showHome;
}

function oneMore() {
  const pool = buildPool(state.difficulty);
  if (!pool.length || !state.hearts) return;
  const fresh = pool.filter(p => !state.seen.has(srcOf(p)));
  const pick = shuffle(fresh.length ? fresh : pool)[0];
  state.seen.add(srcOf(pick));
  state.index = state.items.length;
  state.items.push({ ...pick, bonus: true });
  if ($('#settings')) $('#settings').hidden = true;
  showItem();
}

/* ============================ EVENT LISTENERS ============================ */
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const s = loadSave();
    s.difficulty = e.target.value;
    writeSave(s);
    updateSettingsUI();
  });
});

$('#zen')?.addEventListener('change', e => {
  const s = loadSave();
  s.zen = e.target.checked;
  writeSave(s);
});

$('#sound')?.addEventListener('change', e => {
  const s = loadSave();
  s.sound = e.target.checked;
  writeSave(s);
  feedback('link');
});

$('#roundLength')?.addEventListener('input', e => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val) && val >= 1) {
    const s = loadSave();
    s.roundLength = val;
    writeSave(s);
  }
});

$('#roundLength')?.addEventListener('change', updateSettingsUI);

initSettings();
showHome();