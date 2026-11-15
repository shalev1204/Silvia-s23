// Deep audit of the Field Wire script (steps 10-44 + march events). Usage: node audit_wire.js [repo] [--dump]
const fs = require('fs'), path = require('path');
const repo = process.argv[2] || process.cwd(), dump = process.argv.includes('--dump');
global.window = {};
const ASKS = {};
const mkW = (o) => ({
  choice: (s) => (o.choice && o.choice[s] != null ? o.choice[s] : null), chose: (s, i) => o.choice && o.choice[s] === i,
  seals: () => o.seals == null ? 3 : o.seals, road: () => o.road || null, flag: () => !!o.flag, hours: () => o.hours || 'Twelve',
  dream: () => o.dream || null, bridge: () => o.bridge || null, event: () => o.event == null ? null : o.event, hint: () => {},
  ask: (s, p, i) => (o.ask != null ? o.ask : null)
});
['marches', 'monolith', 'bridge', 'tower', 'stage'].forEach((f) => eval(fs.readFileSync(path.join(repo, 'web/hub/js/wire-script-' + f + '.js'), 'utf8')));
const MAX = 150;
function beats(text) {   // copy of hub-core wireBeats
  if (Array.isArray(text)) return text.reduce((a, t) => a.concat(beats(t)), []);
  if (text && typeof text === 'object') return [];
  const out = [];
  String(text == null ? '' : text).split(/\n\s*\n/).forEach((para) => {
    para = para.trim(); if (!para) return;
    const ss = para.replace(/([.!?…]["”’']?)\s+(?=["“‘'(]?[A-Z0-9])/g, '$1\u0001').split('\u0001');
    let cur = '';
    ss.forEach((sn) => { if (cur && (cur + ' ' + sn).length > MAX) { out.push(cur); cur = sn; } else cur = cur ? cur + ' ' + sn : sn; });
    if (cur) out.push(cur);
  });
  return out;
}
const seq = (t) => Array.isArray(t) ? t.reduce((a, x) => a.concat(seq(x)), []) : (t && typeof t === 'object' && Array.isArray(t.ask)) ? [t] : beats(t);
const val = (v, W) => (typeof v === 'function' ? v(W) : v);
const FORBID = /Sunken Sanctuary|Coastal Amphitheater|\bThe Coast\b|The Hermit|Stage Mistress|Azimuth|Mucro|\bMater\b|Tympan|Stereographic|Vienna|Sheet \d/i;
const settings = [
  { name: 'default', o: {} },
  { name: 'alt', o: { choice: new Proxy({}, { get: () => 1 }), seals: 4, road: 'bold', dream: 'finish', bridge: 'hide', event: 1, ask: 1 } },
  { name: 'alt2', o: { choice: new Proxy({}, { get: () => 2 }), seals: 5, road: 'observer', dream: 'never', bridge: 'trail', event: 0, ask: 2 } }
];
const issues = [];
const S = window.WIRE_SCRIPT;
const report = [];
let totals = { hermes: 0, silvia: 0 };
Object.keys(S).map(Number).sort((a, b) => a - b).forEach((k) => {
  const s = S[k];
  settings.forEach(({ name, o }) => {
    const W = mkW(o);
    const parts = [];
    if (s.hermesInitial) parts.push(['i', val(s.hermesInitial, W)]);
    if (s.hermesFinal) parts.push(['f', val(s.hermesFinal, W)]);
    (s.choices || []).forEach((c, i) => parts.push(['r' + i, val(c.hermesReply, W)]));
    parts.forEach(([p, t]) => {
      seq(t).forEach((it) => {
        if (typeof it === 'string') {
          if (!it || /undefined|null|NaN|\[object/.test(it)) issues.push(`${k}${p} [${name}] bad text: ${it.slice(0, 80)}`);
          if (it.length > MAX) issues.push(`${k}${p} [${name}] long beat ${it.length}`);
          if (FORBID.test(it)) issues.push(`${k}${p} [${name}] forbidden: ${it.match(FORBID)[0]}`);
        } else {
          if (it.ask.length < 2 || it.ask.length > 3) issues.push(`${k}${p} ask with ${it.ask.length} options`);
          it.ask.forEach((a, j) => {
            const r = beats(val(a.reply, W));
            if (!a.text || !a.silviaMsg || !r.length) issues.push(`${k}${p} ask opt ${j} incomplete`);
            r.concat([a.text, a.silviaMsg]).forEach((x) => { if (FORBID.test(x)) issues.push(`${k}${p} ask forbidden ${x.match(FORBID)[0]}`); if (/undefined|null|NaN/.test(x)) issues.push(`${k}${p} ask bad ${x.slice(0, 60)}`); });
          });
        }
      });
    });
  });
  // the default-setting stats
  const W = mkW({});
  const stat = (t) => { const it = seq(val(t, W)); let run = 0, maxRun = 0, plain = 0, asks = 0, askBeats = 0;
    it.forEach((x) => { if (typeof x === 'string') { plain++; run++; maxRun = Math.max(maxRun, run); } else { asks++; run = 0; askBeats += Math.max(...x.ask.map((a) => beats(val(a.reply, W)).length)); } });
    return { plain, asks, maxRun, askBeats, items: it }; };
  const row = { step: k };
  if (s.hermesInitial) row.i = stat(s.hermesInitial);
  if (s.hermesFinal) row.f = stat(s.hermesFinal);
  if (s.choices) row.r = s.choices.map((c) => stat(c.hermesReply));
  report.push(row);
});
console.log('STEP | opening beats(max run)/asks | final beats/asks | replies');
report.forEach((r) => {
  const f = (x) => (x ? `${x.plain}(${x.maxRun})/${x.asks}` : '-');
  console.log(String(r.step).padStart(4), '|', f(r.i).padEnd(10), '|', f(r.f).padEnd(8), '|', r.r ? r.r.map(f).join('  ') : '');
});
// march events
const M = window.WIRE_MARCH_EVENTS;
Object.keys(M).forEach((leg) => {
  const slots = M[leg];
  console.log(`march leg ${leg}: ${slots.length} slots at ${slots.map((x) => x.at).join(', ')}; variants ${slots.map((x) => x.pool.length).join('/')}; with question ${slots.map((x) => x.pool.filter((p) => p.choices).length).join('/')}`);
  slots.forEach((sl) => sl.pool.forEach((p) => {
    [p.beats].concat((p.choices || []).map((c) => c.reply)).forEach((b) => beats(val(b, mkW({}))).forEach((x) => { if (x.length > MAX) issues.push(`march ${p.id} long ${x.length}`); if (FORBID.test(x)) issues.push(`march ${p.id} forbidden`); }));
  }));
});
console.log('\nISSUES', issues.length); [...new Set(issues)].forEach((x) => console.log(' -', x));
if (dump) {
  const W = mkW({});
  const lines = [];
  Object.keys(S).map(Number).sort((a, b) => a - b).forEach((k) => {
    const s = S[k]; lines.push(`\n## Step ${k}`);
    const pr = (lab, t) => { lines.push(`### ${lab}`); seq(val(t, W)).forEach((x) => { if (typeof x === 'string') lines.push('H: ' + x); else { lines.push('  [ASK]'); x.ask.forEach((a, j) => { lines.push(`   ${j}) «${a.text}» S: ${a.silviaMsg}`); beats(val(a.reply, W)).forEach((b) => lines.push('      H: ' + b)); }); } }); };
    if (s.hermesInitial) pr('opening', s.hermesInitial);
    (s.choices || []).forEach((c, i) => { lines.push(`### choice ${i}: «${c.text}»\nS: ${c.silviaMsg}`); pr('reply ' + i, c.hermesReply); });
    if (s.hermesFinal) pr('final', s.hermesFinal);
  });
  fs.writeFileSync(path.join(__dirname, 'wire_dump.md'), lines.join('\n'));
  console.log('dump written');
}
