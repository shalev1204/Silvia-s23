// Rules of the road at the Gates of Tower II. Run: node scratch/verifications/test_gates_road.js
const assert = require('assert');
const mem = {};
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
require('../../web/hub/js/gates-road.js');
const R = globalThis.GatesRoad;
const reset = () => Object.keys(mem).forEach(k => delete mem[k]);
let n = 0; const t = (name, fn) => { reset(); fn(); n++; console.log('ok -', name); };

t('no flags: twelve hours, steady, traveller night', () => {
  assert.strictEqual(R.marchHours(), 12); assert.strictEqual(R.marchKind(), 'steady'); assert.strictEqual(R.nightKind(), 'traveller'); assert.deepStrictEqual(R.relics(), []);
});
t('won over (regard 3): shortcut of 2 h', () => { R.save('humble', { regard: 3 }); assert.strictEqual(R.marchHours(), 10); assert.strictEqual(R.marchKind(), 'shortcut'); });
t('sore (regard -2): storm adds 2 h', () => { R.save('bold', { regard: -2 }); assert.strictEqual(R.marchHours(), 14); assert.strictEqual(R.marchKind(), 'storm'); });
t('penance in oil clears the storm', () => { R.save('bold', { regard: -2, gaveOil: true }); assert.strictEqual(R.marchHours(), 12); });
t('the coin takes an hour off, never below 9', () => { R.save('humble', { regard: 5, coin: true }); assert.strictEqual(R.marchHours(), 9); R.save('humble', { regard: 0, coin: true }); assert.strictEqual(R.marchHours(), 11); });
t('hours freeze at set-out: later flags cannot move a walk under way', () => {
  R.save('humble', { regard: 4 }); assert.strictEqual(R.freezeMarchHours(), 10);
  R.save('bold', { regard: -4 }); assert.strictEqual(R.marchHours(), 10);
});
t('a corrupt frozen value is ignored', () => { mem.order_monolith_march_hours = 'abc'; R.save('humble', { regard: 3 }); assert.strictEqual(R.marchHours(), 10); mem.order_monolith_march_hours = '99'; assert.strictEqual(R.marchHours(), 10); });
t('an older walk already under way keeps twelve hours', () => { mem.order_monolith_march_start = '123'; R.save('humble', { regard: 5 }); assert.strictEqual(R.freezeMarchHours(), 12); assert.strictEqual(R.marchHours(), 12); });
t('corrupt flags JSON is an empty road', () => { mem.order_gates_flags = '[1,2]'; assert.deepStrictEqual(R.flags(), {}); mem.order_gates_flags = '{oops'; assert.deepStrictEqual(R.flags(), {}); });
t('night kind: dark beats ghost beats traveller', () => {
  R.save('observer', { seen: { tracks: true } }); assert.strictEqual(R.nightKind(), 'ghost');
  R.save('observer', { seen: { tracks: true }, gaveOil: true }); assert.strictEqual(R.nightKind(), 'dark');
  R.save('bold', { lostOil: true }); assert.strictEqual(R.nightKind(), 'dark');
  R.save('humble', {}); assert.strictEqual(R.nightKind(), 'traveller');
});
t('relics follow the road', () => { R.save('humble', { blessing: true, coin: true }); assert.deepStrictEqual(R.relics(), ['red_cord', 'servant_coin']); });
t('night state persists and merges', () => { R.saveNight({ choice: 'a' }); R.saveNight({ done: true }); assert.deepStrictEqual(R.night(), { choice: 'a', done: true }); assert.ok(R.nightDone()); });
t('return needs five seals and happens once', () => {
  assert.ok(!R.needsReturn());
  [1, 2, 3, 4].forEach(i => { mem['order_seal_cairn_' + i] = 'true'; }); assert.ok(!R.needsReturn());
  mem.order_seal_cairn_5 = 'true'; assert.ok(R.needsReturn());
  R.saveReturn({ done: true, ending: 'humble' }); assert.ok(R.returned()); assert.ok(!R.needsReturn());
});
t('the keepers are paid only with the riddle and both figures', () => {
  R.save('observer', { statues: 'riddle' }); assert.ok(!R.canPayKeepers());
  mem.order_oasis_clepsydra_completed = 'true'; assert.ok(!R.canPayKeepers());
  mem.order_inventory_relics = JSON.stringify(['ibis_figure']); assert.ok(R.canPayKeepers());
  R.save('bold', {}); assert.ok(!R.canPayKeepers());
});
t('ending: keepers > secret > tone', () => {
  assert.strictEqual(R.ending({ secret: true }, 'bold', true), 'keepers');
  assert.strictEqual(R.ending({ secret: true }, 'bold', false), 'trusted');
  assert.strictEqual(R.ending({}, 'observer', false), 'observer');
  assert.strictEqual(R.ending({}, null, false), 'humble');
});
console.log(n + ' tests passed');
