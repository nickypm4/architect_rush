/* ============================ CONFIG ============================ */
const STORAGE_KEY = 'saa-rush';
const MAX_EXTRA_LINES = 2;        // lines that match no expected link before a diagram fails
const MAX_HEARTS = 3;
const DIAGRAM_SECONDS = 100;
const CHOICE_SECONDS = 45;
const DECOY_COUNT = 6;            // number of non-duplicate decoy tiles drawn from T
const COMPUTE = ['ec2', 'asg'];   // EC2 and ASG are interchangeable
const LIGHT_TILES = ['#ED7100', '#7AA116'];

import { T, D, Q } from './problems.js';

// ============================================================================
// DEV-TIME VALIDATOR (Checks nodes and edges against T and d.n without patching)
// ============================================================================
D.forEach((d, idx) => {
  const nodeKeys = Object.keys(d.n || {});
  nodeKeys.forEach(k => {
    if (!T[k]) console.error(`Diagram ${idx}: node "${k}" missing in T`);
  });
  (d.e || []).forEach(([a, b]) => {
    if (!T[a]) console.error(`Diagram ${idx}: edge node "${a}" missing in T`);
    if (!T[b]) console.error(`Diagram ${idx}: edge node "${b}" missing in T`);
    const hasA = nodeKeys.includes(a) || (COMPUTE.includes(a) && nodeKeys.some(k => COMPUTE.includes(k)));
    const hasB = nodeKeys.includes(b) || (COMPUTE.includes(b) && nodeKeys.some(k => COMPUTE.includes(k)));
    if (!hasA) console.error(`Diagram ${idx}: edge references node "${a}" not declared in d.n`);
    if (!hasB) console.error(`Diagram ${idx}: edge references node "${b}" not declared in d.n`);
  });
});

/* ============================ HELPERS ============================ */
const $ = selector => document.querySelector(selector);
const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(p => p[1]);

// Whole days since epoch in user's local timezone (immune to DST drift)
const localDay = ms => {
  const d = new Date(ms);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
};

const tileText = key => (T[key] && LIGHT_TILES.includes(T[key][1])) ? '#111' : '#fff';
const tileHTML = key => T[key] ? `<i style="background:${T[key][1]};color:${tileText(key)}">${T[key][2]}</i>${T[key][0]}` : key;

/* ============================ STORAGE & PERSISTENCE ============================ */
const loadSave = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; } };
const writeSave = obj => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {} };

let state;
let timerRaf = null, timerTimeout = null;
let mode = loadSave().mode || 'all';
let nextNodeId = 0;

function getMaxQuestions() {
  if (mode === 'd') return D.length;
  if (mode === 'mc') return Q.length;
  return D.length + Q.length;
}

function updateSettingsUI() {
  const input = $('#roundLength');
  const unit = $('.unit');
  if (unit) unit.textContent = 'problems';

  if (input) {
    const max = getMaxQuestions();
    input.max = max;
    input.min = 1;
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val > max) input.value = max;
    else if (val < 1) input.value = 1;

    const s = loadSave();
    s.roundLength = parseInt(input.value, 10);
    writeSave(s);
  }
}

function initSettings() {
  const save = loadSave();
  const diff = save.difficulty || 'medium';
  const radio = $(`input[name="difficulty"][value="${diff}"]`);
  if (radio) radio.checked = true;

  const savedLen = save.roundLength;
  const input = $('#roundLength');
  if (input && savedLen) input.value = savedLen;

  updateSettingsUI();
}

function getTimerMultiplier() {
  const diff = document.querySelector('input[name="difficulty"]:checked')?.value || loadSave().difficulty || 'medium';
  if (diff === 'easy') return 1.4;
  if (diff === 'hard') return 0.7;
  return 1.0;
}

/* ============================ TIMER (RAF + TIMESTAMPS) ============================ */
function stopTimer() {
  if (timerRaf) {
    cancelAnimationFrame(timerRaf);
    timerRaf = null;
  }
  if (timerTimeout) {
    clearTimeout(timerTimeout);
    timerTimeout = null;
  }
}

function startTimer(seconds) {
  stopTimer();
  const mult = getTimerMultiplier();
  const durationMs = seconds * 1000 * mult;
  const startTime = performance.now();
  const endTime = startTime + durationMs;

  const tb = $('#tb');
  const timerWrap = $('.t');
  let lastSecAnnounced = Math.ceil(seconds);

  function frame(now) {
    const remainingMs = Math.max(0, endTime - now);
    const pct = (remainingMs / durationMs) * 100;
    if (tb) tb.style.width = pct + '%';

    const remainingSec = Math.ceil(remainingMs / (1000 * mult));
    if (timerWrap && remainingSec !== lastSecAnnounced) {
      lastSecAnnounced = remainingSec;
      timerWrap.setAttribute('aria-valuenow', remainingSec);
      timerWrap.setAttribute('aria-label', `Time remaining: ${remainingSec} seconds`);
    }

    if (remainingMs <= 0) {
      stopTimer();
      grade(true);
      return;
    }
    timerRaf = requestAnimationFrame(frame);
  }

  timerRaf = requestAnimationFrame(frame);
  timerTimeout = setTimeout(() => {
    stopTimer();
    grade(true);
  }, durationMs);
}

/* ============================ HOME / ROUND SETUP ============================ */
function showHome() {
  stopTimer();
  const save = loadSave(), badges = save.badges || [];
  $('#hud').hidden = true;
  if ($('#settings')) $('#settings').hidden = false;

  updateSettingsUI();

  $('#app').innerHTML = `
  <div class="card">
      <div class="v">Build it. Grade it. Don’t lose your hearts.</div>
      <p>Drag services onto the canvas (or press Enter on one), select two to draw a line, then submit. Chain correct answers for a combo up to x5.</p>
      <p class="hint">Streak: ${save.streak || 0} day(s) · Best score: ${save.best || 0} · ${MAX_HEARTS} hearts, timed rounds</p>
      <div>${badges.map(b => `<span class="bd">${b}</span>`).join('') || '<span class="hint">No badges yet</span>'}</div>
      <div class="row" id="modes">${[['all','All'],['d','Diagrams'],['mc','Multiple choice']]
          .map(([k, label]) => `<button class="${mode == k ? '' : 'g'}" data-mode="${k}">${label}</button>`).join('')}</div>
      <div class="row"><button id="go">Start round</button></div>
  </div>`;

  document.querySelectorAll('#modes button').forEach(btn => btn.onclick = () => {
    mode = btn.dataset.mode;
    const s = loadSave(); s.mode = mode; writeSave(s);
    showHome();
  });

  $('#go').onclick = startRound;
}

function startRound() {
  const save = loadSave(), today = localDay(Date.now());
  save.streak = save.last === today ? save.streak || 1 : save.last === today - 1 ? (save.streak || 0) + 1 : 1;
  save.last = today;
  writeSave(save);

  let items = [
    ...(mode != 'mc' ? D.map(d => ({ d })) : []),
    ...(mode != 'd' ? Q.map(m => ({ m })) : [])
  ];
  items = shuffle(items);

  const inputVal = parseInt($('#roundLength')?.value, 10);
  const roundLen = (!isNaN(inputVal) && inputVal > 0) ? Math.min(inputVal, items.length) : items.length;
  items = items.slice(0, roundLen);

  state = { hearts: MAX_HEARTS, xp: 0, combo: 1, index: 0, items, builds: 0, retry: false };
  $('#hud').hidden = false;
  if ($('#settings')) $('#settings').hidden = true;
  showItem();
}

function renderHud() {
  $('#hud').innerHTML = `
    <span><span class="sr">Hearts: </span>${'❤️'.repeat(state.hearts) || '💔'}</span>
    <span>XP ${state.xp}</span>
    <span aria-label="Combo multiplier ${state.combo}x">Combo x${state.combo}</span>
    <span>🔥 ${loadSave().streak || 1}-day streak</span>`;
}

/* ============================ SHOW ONE ITEM ============================ */
function showItem() {
  stopTimer();
  if (!state.hearts || state.index >= state.items.length) return showEnd();
  renderHud();

  const item = state.items[state.index], d = item.d;
  Object.assign(state, { current: item, nodes: [], edges: [], selected: null, picks: [], retry: false });
  const seconds = d ? DIAGRAM_SECONDS : CHOICE_SECONDS;
  const label = d ? 'Build the architecture' : item.m.m ? 'Choose TWO' : 'Choose ONE';

  $('#app').innerHTML = `
  <div class="card">
      <div class="t" role="progressbar" aria-label="Time remaining: ${seconds} seconds" aria-valuemin="0" aria-valuemax="${seconds}" aria-valuenow="${seconds}"><i id="tb" style="width:100%"></i></div>
      <p><b>${label}</b> · ${state.index + 1}/${state.items.length}</p>
      <p>${d ? d.q : item.m.q}</p>
      <div id="body"></div>
      <div class="row">
          <button id="ck" disabled>${d ? 'Check architecture' : 'Submit'}</button>
          ${d ? '<button class="g" id="rm">Remove selected</button><button class="g" id="cl">Clear</button>' : ''}
      </div>
  </div>
  <div id="fb" aria-live="polite"></div>`;

  d ? buildDiagramUI(d) : buildChoiceUI(item.m);
  $('#ck').onclick = () => grade(false);

  startTimer(seconds);
}

/* ---------------- multiple choice ---------------- */
function buildChoiceUI(m) {
  $('#body').innerHTML = m.o.map((text, k) => `<button class="o" data-k="${k}">${text}</button>`).join('');
  document.querySelectorAll('.o').forEach(btn => btn.onclick = () => {
    const k = +btn.dataset.k;
    if (m.m) state.picks = state.picks.includes(k) ? state.picks.filter(p => p != k) : [...state.picks, k];
    else state.picks = [k];
    document.querySelectorAll('.o').forEach((el, j) => el.classList.toggle('s', state.picks.includes(j)));
    const ck = $('#ck');
    if (ck) ck.disabled = state.picks.length === 0;
  });
}

/* ---------------- diagram builder ---------------- */
function buildDiagramUI(d) {
  const requiredKeys = Object.keys(d.n || {});
  const availableDecoys = Object.keys(T).filter(k => !requiredKeys.includes(k));
  const chosenDecoys = shuffle(availableDecoys).slice(0, DECOY_COUNT);
  const keys = shuffle([...requiredKeys, ...chosenDecoys]);

  $('#body').innerHTML = `
  <div id="cv"><svg id="sv"></svg></div>
  <div id="pal">${keys.map(k => `<div class="p" data-k="${k}" tabindex="0" role="button" aria-label="Add ${T[k]?.[0] || k}">${tileHTML(k)}</div>`).join('')}</div>
  <p class="hint">Drag or tap to add. Select two nodes to draw or erase a line. Keyboard: Tab to a node, Enter selects it, Delete removes it.</p>
  <details class="hint"><summary>Connection rules</summary>
      1. Traffic: link each hop in order (users → DNS → CDN → LB → compute → data).<br>
      2. Placement: link a resource to its subnet. EC2 and ASG count the same.<br>
      3. Attachments (SG, NACL, route table, endpoint, KMS, health check, Elastic IP) link to what they protect or serve.<br>
      4. IGW links to the first public-facing resource behind it, not the subnet.<br>
      5. Hybrid: on-premises → VPN/DX → gateway → VPC.<br>
      6. Lines have no direction. Up to ${MAX_EXTRA_LINES} extra lines are tolerated; more fails the check.
  </details>`;

  document.querySelectorAll('.p').forEach(el => {
    el.onpointerdown = e => dragFromPalette(el, e);
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addNodeAuto(el.dataset.k); } };
  });
  $('#rm').onclick = removeSelected;
  $('#cl').onclick = () => {
    state.nodes.forEach(n => n.el.remove());
    state.nodes = [];
    state.edges = [];
    state.selected = null;
    paint();
    const ck = $('#ck');
    if (ck) ck.disabled = true;
  };
}

function dragFromPalette(tile, startEvent) {
  const key = tile.dataset.k, ghost = tile.cloneNode(true);
  ghost.className = 'p gh';
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
}

function clampTo(node, x, y) {
  const cv = $('#cv');
  node.x = Math.min(cv.clientWidth - 76, Math.max(0, x));
  node.y = Math.min(cv.clientHeight - 70, Math.max(0, y));
}

function toggleSelect(node) {
  if (state.selected == null || state.selected == node.id) {
    state.selected = state.selected == node.id ? null : node.id;
  } else {
    const a = state.selected;
    const existing = state.edges.findIndex(e => e.includes(a) && e.includes(node.id));
    existing >= 0 ? state.edges.splice(existing, 1) : state.edges.push([a, node.id]);
    state.selected = null;
  }
  paint();
}

function removeSelected() {
  const id = state.selected;
  if (id == null) return;
  state.nodes = state.nodes.filter(n => { if (n.id == id) n.el.remove(); return n.id != id; });
  state.edges = state.edges.filter(e => !e.includes(id));
  state.selected = null;
  const ck = $('#ck');
  if (ck) ck.disabled = state.nodes.length < 2;
  paint();
}

function paint() {
  state.nodes.forEach(n => {
    n.el.style.left = n.x + 'px';
    n.el.style.top = n.y + 'px';
    n.el.classList.toggle('s', n.id == state.selected);
  });
  const find = id => state.nodes.find(n => n.id == id);
  $('#sv').innerHTML = state.edges.map(([ia, ib]) => {
    const a = find(ia), b = find(ib);
    if (!a || !b) return '';
    return `<line x1="${a.x + 38}" y1="${a.y + 26}" x2="${b.x + 38}" y2="${b.y + 26}" stroke="#ED7100" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join('');
}

/* ============================ BIPARTITE MATCHING & GRADING ============================ */
const kindsFor = (a, b) => COMPUTE.includes(a) && !COMPUTE.includes(b) ? COMPUTE : [a];

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

  // 1. Required nodes
  let computeEvaluated = false;
  for (const k in (d.n || {})) {
    if (isCompute(k)) {
      if (!computeEvaluated) {
        const have = totalPlacedCompute >= totalReqCompute;
        ok = ok && have;
        if (!have) items.push([false, `Missing compute instances (need ${totalReqCompute} EC2 or ASG)`]);
        computeEvaluated = true;
      }
    } else {
      const have = (counts[k] || 0) >= d.n[k];
      ok = ok && have;
      if (!have) items.push([false, `Missing ${T[k]?.[0] || k}${d.n[k] > 1 ? ' (need ' + d.n[k] + ')' : ''}`]);
    }
  }

  // 2. Extra/Decoy or over-placed nodes
  let computeOverEvaluated = false;
  for (const k in counts) {
    if (isCompute(k)) {
      if (!computeOverEvaluated) {
        if (totalReqCompute === 0) {
          ok = false;
          items.push([false, `Compute nodes do not belong in this design`]);
        } else if (totalPlacedCompute > totalReqCompute) {
          ok = false;
          items.push([false, `Too many compute nodes (placed ${totalPlacedCompute}, need ${totalReqCompute})`]);
        }
        computeOverEvaluated = true;
      }
    } else if (!d.n?.[k]) {
      ok = false;
      items.push([false, `${T[k]?.[0] || k} does not belong in this design`]);
    } else if (counts[k] > d.n[k]) {
      ok = false;
      items.push([false, `Too many ${T[k]?.[0] || k} (placed ${counts[k]}, need ${d.n[k]})`]);
    }
  }

  // 3. Required links evaluated with Bipartite Matching to enforce distinct node instances
  (d.e || []).forEach(([a, b, need = 1]) => {
    let matchedCount = 0;
    if (a === b) {
      const nodes = state.nodes.filter(n => kindsFor(a, b).includes(n.k));
      const used = new Set();
      state.edges.forEach(([ia, ib]) => {
        const na = nodes.find(n => n.id === ia);
        const nb = nodes.find(n => n.id === ib);
        if (na && nb && !used.has(ia) && !used.has(ib)) {
          used.add(ia);
          used.add(ib);
          matchedCount++;
        }
      });
    } else {
      const nodesA = state.nodes.filter(n => kindsFor(a, b).includes(n.k));
      const nodesB = state.nodes.filter(n => kindsFor(b, a).includes(n.k));
      const capA = Math.max(1, Math.ceil(need / Math.max(1, nodesA.length)));
      const capB = Math.max(1, Math.ceil(need / Math.max(1, nodesB.length)));
      matchedCount = countBipartiteMatches(nodesA, nodesB, capA, capB, state.edges);
    }
    const have = matchedCount >= need;
    ok = ok && have;
    const nameA = T[a]?.[0] || a, nameB = T[b]?.[0] || b;
    items.push([have, `${nameA} ↔ ${nameB}${need > 1 ? ' x' + need : ''}`]);
  });

  // 4. Anti-spam: lines that satisfy no expected link kind
  const drawnKinds = state.edges.map(([ia, ib]) => {
    const na = state.nodes.find(n => n.id == ia);
    const nb = state.nodes.find(n => n.id == ib);
    return na && nb ? [na.k, nb.k] : null;
  }).filter(Boolean);

  const extras = drawnKinds.filter(([kx, ky]) => !(d.e || []).some(exp => lineMatches(kx, ky, exp))).length;
  if (extras > MAX_EXTRA_LINES) {
    ok = false;
    items.push([false, `Too many unnecessary lines (${extras}). Remove lines that do not match a real route or attachment`]);
  }
  return { ok, items };
}

function gradeChoice(m) {
  const ok = m.a.length == state.picks.length && m.a.every(k => state.picks.includes(k));
  document.querySelectorAll('.o').forEach((el, j) => {
    el.disabled = true;
    el.classList.toggle('ok', m.a.includes(j));
    el.classList.toggle('no', state.picks.includes(j) && !m.a.includes(j));
  });
  return { ok, items: [] };
}

function grade(timedOut) {
  if (!timedOut && $('#ck')?.disabled) return;
  stopTimer();
  if ($('#ck')) $('#ck').disabled = true;

  const item = state.current, d = item.d;
  const result = d ? gradeDiagram(d) : gradeChoice(item.m);
  const ok = result.ok && !timedOut;
  const wasRetry = state.retry;
  let message;

  if (wasRetry) {
    if (timedOut) {
      state.retry = false;
      message = 'Time’s up on retry.';
    } else if (ok) {
      state.retry = false;
      message = 'Correct on the retry. No XP or combo';
    } else {
      message = 'Not yet. Adjust and recheck, no further penalty';
    }
  } else if (ok) {
    const gain = (d ? 150 : 100) * state.combo;
    state.xp += gain;
    state.combo = Math.min(5, state.combo + 1);
    if (d) state.builds++;
    message = `Correct! +${gain} XP`;
  } else {
    state.hearts--;
    state.combo = 1;
    state.retry = !!d && state.hearts > 0 && !timedOut;
    message = timedOut ? 'Time’s up. −1 heart' : 'Not quite. −1 heart';
  }

  const newBadges = awardBadges();
  renderHud();
  if (!state.retry) state.index++;

  const buttonLabel = state.retry ? 'Skip this one' : state.hearts && state.index < state.items.length ? 'Next challenge' : 'See results';
  $('#fb').innerHTML = `
  <div class="card">
      <div class="v ${ok ? 'ok' : 'no'}">${message}</div>
      <ul class="res">${result.items.map(([hit, text]) => `<li class="${hit ? 'ok' : 'no'}">${hit ? '✔' : '✘'} ${text}</li>`).join('')}</ul>
      <div class="tip"><b>Exam tip:</b> ${(d || item.m).tip}</div>
      ${newBadges.map(b => `<span class="bd">New badge: ${b}</span>`).join('')}
      <div class="row"><button id="nx" class="${state.retry ? 'g' : ''}">${buttonLabel}</button></div>
  </div>`;

  if (!state.retry) {
    $('#nx').onclick = showItem;
    $('#nx').focus();
  } else {
    $('#nx').onclick = () => { state.retry = false; state.index++; showItem(); };
    if ($('#ck')) $('#ck').disabled = state.nodes.length < 2;
    startTimer(DIAGRAM_SECONDS);
  }

  $('#fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function awardBadges() {
  const save = loadSave(), fresh = [];
  save.badges = save.badges || [];
  const award = (condition, name) => { if (condition && !save.badges.includes(name)) { save.badges.push(name); fresh.push(name); } };
  award(state.combo >= 5, '🔥 On Fire (x5 combo)');
  award(state.builds >= 3, '🏗️ Architect (3 builds)');
  award((save.streak || 0) >= 3, '📅 Regular (3-day streak)');
  save.best = Math.max(save.best || 0, state.xp);
  writeSave(save);
  return fresh;
}

/* ============================ END SCREEN ============================ */
function showEnd() {
  stopTimer();
  const save = loadSave();
  if ($('#settings')) $('#settings').hidden = false;
  updateSettingsUI();

  $('#app').innerHTML = `
  <div class="card">
      <div class="v">${state.hearts ? 'Round complete' : 'Out of hearts'}</div>
      <p>Score: <b>${state.xp} XP</b> · Best: ${save.best || 0}</p>
      <p class="hint">${state.hearts ? 'Run it again for a fresh set of questions and push for x5.' : 'Review the tips above, then try again.'}</p>
      <div class="row"><button id="go">Play again</button><button class="g" id="hm">Home</button></div>
  </div>`;
  $('#go').onclick = startRound;
  $('#hm').onclick = showHome;
}

/* ============================ SETTINGS LISTENERS ============================ */
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const s = loadSave();
    s.difficulty = e.target.value;
    writeSave(s);
  });
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