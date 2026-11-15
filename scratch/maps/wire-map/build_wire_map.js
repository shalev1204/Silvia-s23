
// a ceremony line can be a function (seal1() ? with : without): show both variants
function cerLine(l) {
  if (typeof l !== 'function') return `<p>${esc(l)}</p>`;
  const q = [...String(l).matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
  return `<p><span class="tag">con el Sello de Cairn I</span> ${esc(q[0] || '')}</p><p><span class="tag">sin él</span> ${esc(q[1] || '')}</p>`;
}
// Builds the "Mapa del Field Wire" page from the real wire scripts. node build_wire_map.js <repo> <out.html>
const fs = require('fs'), path = require('path');
const repo = process.argv[2], out = process.argv[3];
global.window = {}; global.localStorage = { getItem: (k) => ({ order_monolith_gate_seal1: 'true', order_seal_cairn_1: 'true', order_cairn5_seals_at_altar: '5', order_stele_seals_at_well: '5' })[k] || null };
['marches', 'monolith', 'bridge', 'tower', 'stage'].forEach((f) => eval(fs.readFileSync(path.join(repo, 'web/hub/js/wire-script-' + f + '.js'), 'utf8')));
const cer = fs.readFileSync(path.join(repo, 'web/hub/js/wire-ceremony.js'), 'utf8');
const SCENES = eval('(' + cer.slice(cer.indexOf('const SCENES = ') + 15, cer.indexOf('\n  };', cer.indexOf('const SCENES = ')) + 4) + ')');
const W = { choice: () => null, chose: () => false, seals: () => 5, road: () => 'humble', flag: () => false, hours: () => 'Ten', dream: () => null, bridge: () => null, event: () => null, hint: () => {}, ask: () => null };
const MAX = 150;
function beats(text) {
  if (Array.isArray(text)) return text.reduce((a, t) => a.concat(beats(t)), []);
  if (text && typeof text === 'object') return [];
  const o = [];
  String(text == null ? '' : text).split(/\n\s*\n/).forEach((p) => { p = p.trim(); if (!p) return;
    const ss = p.replace(/([.!?…]["”’']?)\s+(?=["“‘'(]?[A-Z0-9])/g, '$1\u0001').split('\u0001'); let c = '';
    ss.forEach((s) => { if (c && (c + ' ' + s).length > MAX) { o.push(c); c = s; } else c = c ? c + ' ' + s : s; }); if (c) o.push(c); });
  return o;
}
const seq = (t) => Array.isArray(t) ? t.reduce((a, x) => a.concat(seq(x)), []) : (t && typeof t === 'object' && Array.isArray(t.ask)) ? [t] : beats(t);
const val = (v) => (typeof v === 'function' ? v(W) : v);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const S = window.WIRE_SCRIPT;

const DIV = { 11: 'The Ridge of the Sun · Cairn II', 13: 'First Light · The Arches of the West Wind', 15: 'The Sandstone Labyrinth · Cairn III', 17: 'The Next Evening · The Edge of the Hardpan', 19: 'The Southern Mouth of the Gorge · Cairn IV', 21: 'That Evening · Leaving the Singing Pillars', 23: 'The Arch of the Solstice · Cairn V', 25: 'Under the Arch · Smoke over Tower II', 27: 'Tower II · The Well of the Atrium', 29: 'Tower II · The Inner Stair', 31: 'Tower II · The Inner Chamber', 33: 'Tower II · The Morning of Departure', 35: 'Tower III · The Gate of a Thousand Masks', 37: 'Tower III · The Dark Room', 39: 'Tower III · The Narrow House', 41: 'Tower III · The Whispering Gallery', 43: 'Tower III · The Little Door of the Gallery' };
// what stands between a step and the next one (hub-core renderWireChoices)
const GATE = {
  10: [['march', 'Marcha nocturna por el Great Erg: 9–14 h según el camino elegido en las puertas', 10], ['station', 'Estación 14 · The Sun Monolith (Cairn II)']],
  12: [['rest', 'Descanso: «Night under the Sun Monolith» · botón «☾ Wait for first light»']],
  14: [['march', 'Marcha de 6 h a la Southern Mouth, rumbo 168°', 14], ['station', 'Estación 15 · The Sandstone Labyrinth (Cairn III)']],
  16: [['scene', 'Escena: «The Memory of the Stones», el sueño de 1998 (página «The Five Geodetic Cairns»). El paso 17 espera a que lo viva.']],
  18: [['march', 'Marcha de 18 h: el hardpan de noche y el Natural Bridge al alba', 18], ['scene', 'Escena: «The Spyglass on the Natural Bridge», al abrir la estación 16. Su elección (cruzar / esconderse / seguir el rastro) vuelve en los pasos 19 y 21.'], ['station', 'Estación 16 · Cairn IV, the Sentry of the Canyon']],
  20: [['rest', 'Descanso: «Between the Singing Pillars» · botón «☀ Wait for dusk»']],
  22: [['march', 'Marcha de 18 h sin dormir hacia el Arch of the Solstice', 22], ['station', 'Estación 17 · The Arch of the Solstice (Cairn V)']],
  24: [['ceremony', 'Ceremonia: cierre del capítulo II y apertura del III', 25]],
  26: [['march', 'Marcha de 6 h hacia el humo de la Torre II', 26], ['station', 'Estación 18 · The Polybius Stele']],
  28: [['gate', 'Si faltan sellos (Cairn I), el chat espera: la estación 19 enseña el camino de vuelta a Cairn I']],
  30: [['march', 'La escalera interior (breve)'], ['station', 'Estación 19 · The Oracle’s Horizon']],
  32: [['ceremony', 'Ceremonia: cierre del capítulo III (fin del Desert Path) y apertura del IV', 33]],
  34: [['march', 'Marcha de 18 h por la meseta, con Aurelia', 34], ['station', 'Estación 20 · The Gate of a Thousand Masks']],
  36: [['door', 'Puerta de la Torre III: abre 3 h después de la estación 20 y con el sello impreso de su página']],
  38: [['station', 'Estación 21 · The Camera Obscura']],
  40: [['door', 'Puerta: abre 6 h después de la estación 21 y con su sello'], ['ceremony', 'Ceremonia: cierre del capítulo IV y apertura del V', 41]],
  42: [['station', 'Estación 22 · The Whispering Gallery']],
  44: [['end', 'Fin del guion actual: espera a la estación 23 (The Automaton Orchestra)']]
};
const CHAPTERS = [
  { n: 'I', t: 'The Red Storm · The Salt Road and the Four Wells', from: 0, to: 8 },
  { n: 'II', t: 'The Five Cairns · Seals of the Sun', from: 9, to: 24 },
  { n: 'III', t: 'Tower II in Flames · The Oracle', from: 25, to: 32 },
  { n: 'IV', t: 'The Mirror Sanctuary · Tower III', from: 33, to: 40 },
  { n: 'V', t: 'The Whispering Gallery', from: 41, to: 44 }
];

let totH = 0, totAsks = 0, totChoices = 0, maxRun = 0;
function renderSeq(items, part) {
  let h = '';
  items.forEach((it) => {
    if (typeof it === 'string') { h += `<p class="m h"><span class="who">H</span>${esc(it)}</p>`; return; }
    h += '<div class="ask"><div class="ask-k">Silvia interviene (un toque)</div>';
    it.ask.forEach((a, j) => {
      h += `<div class="opt"><div class="pill">${esc(a.text)}</div><p class="m s"><span class="who">S</span>${esc(a.silviaMsg)}</p>`;
      beats(val(a.reply)).forEach((b) => { h += `<p class="m h sub"><span class="who">H</span>${esc(b)}</p>`; });
      h += '</div>';
    });
    h += '</div>';
  });
  return h;
}
// rhythm of one conversation: opening (ask option 0) → main choice 0 → reply 0 → next final
function rhythm(k) {
  const s = S[k], r = [];
  const push = (items) => items.forEach((it) => { if (typeof it === 'string') r.push('h'); else { r.push('a'); beats(val(it.ask[0].reply)).forEach(() => r.push('h')); } });
  if (s.hermesInitial) push(seq(val(s.hermesInitial)));
  if (s.choices) { r.push('c'); push(seq(val(s.choices[0].hermesReply))); }
  const f = S[k + 1] && S[k + 1].hermesFinal; if (f) { push(seq(val(f))); r.push('t'); }
  let run = 0, mx = 0; r.forEach((x) => { if (x === 'h') { run++; mx = Math.max(mx, run); } else if (x !== 't') run = 0; });
  return { r, mx };
}
let body = '';
const gateHtml = (step) => (GATE[step] || []).map(([k, t, leg]) => {
  let extra = '';
  if (k === 'march' && leg && window.WIRE_MARCH_EVENTS[leg]) {
    const slots = window.WIRE_MARCH_EVENTS[leg];
    extra = `<details class="ev"><summary>${slots.length} momentos del camino (al ${slots.map((x) => Math.round(x.at * 100) + ' %').join(', ')}), 3 variantes cada uno · ver textos</summary>` +
      slots.map((sl) => `<div class="slot"><div class="slot-k">Al ${Math.round(sl.at * 100)} % de la marcha</div>` + sl.pool.map((p) => `<div class="var"><div class="var-id">${esc(p.id)}${p.choices ? ' · con pregunta' : ''}</div>` + beats(val(p.beats)).map((b) => `<p class="m h"><span class="who">H</span>${esc(b)}</p>`).join('') + (p.choices || []).map((c) => `<div class="opt"><div class="pill">${esc(c.text)}</div><p class="m s"><span class="who">S</span>${esc(c.silviaMsg)}</p>` + beats(val(c.reply)).map((b) => `<p class="m h sub"><span class="who">H</span>${esc(b)}</p>`).join('') + '</div>').join('') + '</div>').join('') + '</div>').join('') + '</details>';
  }
  if (k === 'ceremony') {
    const sc = SCENES[leg];
    extra = `<details class="ev"><summary>Texto de la ceremonia</summary><div class="cer"><div class="cer-k">Se cierra · Capítulo ${sc.close.num} · ${esc(sc.close.title)}</div>${sc.close.epilogue.map(cerLine).join('')}<p class="prize">${esc(sc.close.prize)}</p><div class="cer-k">Se abre · Capítulo ${sc.open.num} · ${esc(sc.open.title)} · ${esc(sc.open.place)}</div>${sc.open.prologue.map(cerLine).join('')}</div></details>`;
  }
  return `<div class="gate g-${k}"><span class="g-tag">${{ march: 'Marcha', station: 'Estación', rest: 'Descanso', scene: 'Escena', ceremony: 'Ceremonia', door: 'Puerta', gate: 'Condición', end: 'Fin' }[k]}</span><span class="g-t">${esc(t)}</span>${extra}</div>`;
}).join('');

CHAPTERS.forEach((ch) => {
  body += `<section class="chapter" id="cap-${ch.n.toLowerCase()}"><header class="ch-h"><div class="ch-n">Capítulo ${ch.n}</div><h2>${esc(ch.t)}</h2><div class="ch-r">Pasos ${ch.from}–${ch.to}</div></header>`;
  if (ch.n === 'I') {
    body += `<div class="note">Este capítulo se conserva tal como estaba, por decisión suya: mensajes largos de un solo bloque, del formato anterior. Incluye la tormenta y el refugio (pasos 0–4), Camp VII con Al-Qibla (5–6), Camp VIII y los cuatro pozos (7–8) y la marcha a las puertas de la Torre II. El paso 9, las puertas, no tiene chat: lo cuenta la escena 3D «At the Gates of Tower II».</div>`;
    body += '<div class="gates">' + `<div class="gate g-march"><span class="g-tag">Marcha</span><span class="g-t">Hacia las puertas de la Torre II</span></div><div class="gate g-scene"><span class="g-tag">Escena</span><span class="g-t">«At the Gates of Tower II» (3D): el Sirviente, los sellos y el camino</span></div>` + '</div>';
  }
  for (let k = Math.max(ch.from, 10); k <= ch.to; k++) {
    const s = S[k]; if (!s) continue;
    const odd = !!s.hermesInitial;
    let stats = [];
    let inner = '';
    if (s.hermesInitial) {
      const it = seq(val(s.hermesInitial)); const p = it.filter((x) => typeof x === 'string').length, a = it.length - p;
      totH += p; totAsks += a; stats.push(`Apertura: ${p} mensajes · ${a} ${a === 1 ? 'intervención' : 'intervenciones'}`);
      inner += `<h4>Apertura</h4>${renderSeq(it)}`;
    }
    if (s.choices) {
      totChoices++;
      inner += '<h4>Elección principal de Silvia</h4>';
      s.choices.forEach((c, i) => {
        const it = seq(val(c.hermesReply)); totH += it.filter((x) => typeof x === 'string').length; totAsks += it.length - it.filter((x) => typeof x === 'string').length;
        inner += `<div class="choice"><div class="pill main">${i + 1}. ${esc(c.text)}</div><p class="m s"><span class="who">S</span>${esc(c.silviaMsg)}</p>${renderSeq(it)}</div>`;
      });
    }
    if (s.hermesFinal) {
      const it = seq(val(s.hermesFinal)); const p = it.filter((x) => typeof x === 'string').length; totH += p; totAsks += it.length - p;
      stats.push(`Cierre: ${p} mensajes`);
      inner += `<h4>Cierre y telegrama</h4>${renderSeq(it)}`;
    }
    let rh = '';
    if (odd) {
      const { r, mx } = rhythm(k); maxRun = Math.max(maxRun, mx);
      rh = `<div class="rhythm" aria-label="Ritmo de la conversación">${r.map((x) => `<i class="r-${x}" title="${{ h: 'Mensaje de Hermes', a: 'Silvia interviene', c: 'Elección principal de Silvia', t: 'Telegrama del sistema' }[x]}"></i>`).join('')}</div><div class="rh-n">Racha máxima de Hermes: ${mx}</div>`;
    }
    body += `<article class="step ${odd ? 'odd' : 'even'}" id="paso-${k}"><div class="st-n">${k}</div><div class="st-b"><div class="st-place">${esc(DIV[k] || (odd ? '' : 'Cierre de la conversación'))}</div><div class="st-stats">${stats.join(' · ')}</div>${rh}<details><summary>Leer la conversación completa</summary><div class="conv">${inner}</div></details></div></article>`;
    if (GATE[k]) body += `<div class="gates">${gateHtml(k)}</div>`;
  }
  body += '</section>';
});
const tpl = fs.readFileSync(path.join(__dirname, 'wire_map_tpl.html'), 'utf8');
const html = tpl.replace('{{BODY}}', body).replace('{{TOTH}}', totH).replace('{{TOTA}}', totAsks).replace('{{TOTC}}', totChoices).replace('{{MAXRUN}}', maxRun)
  .replace('{{DATE}}', '15 de noviembre de 2026').replace('{{REVIEW}}', fs.existsSync(path.join(__dirname, 'wire_review.html')) ? fs.readFileSync(path.join(__dirname, 'wire_review.html'), 'utf8') : '<p>En curso.</p>');
fs.writeFileSync(out, html);
console.log('written', out, (html.length / 1024).toFixed(0) + ' KB', { totH, totAsks, totChoices, maxRun });
