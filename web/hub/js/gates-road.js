// The road Silvia took at the Gates of Tower II (Station 13B), and what it changes further on.
// Pure rules over localStorage: no DOM. The gates scene writes the flags once; the march, the wire, the night on the Erg,
// Station 14, Station 18 and the return to the Sanctuary only read them through this file, so the rules live in one place.
//
// Stored (all travel with the cloud save):
//   order_gates_path          'humble' | 'bold' | 'observer'
//   order_gates_flags         JSON: see FLAG NOTES
//   order_monolith_march_hours  hours of the crossing, frozen when Hermes sets out
//   order_night_erg           JSON { done, choice } - the night on the Erg
//   order_gates_return        JSON { done, ending, keepers } - the bronze doors, once the five seals are home
//
// FLAG NOTES (order_gates_flags)
//   regard      int: how far the Servant trusts Hermes (-4..+7)
//   gaveOil     Hermes fed the dying brazier (kindness or penance)      lostOil   the duel took his lamp oil
//   blessing    red cord on Hermes's wrist                              coin      the Servant's coin (caught the lie)
//   lieCaught   Silvia caught the Servant's lie                         duel      'won' | 'lost'
//   nightOil    what Hermes did with his oil on the Erg: 'shared' | 'all' | 'kept'
//   statues     'riddle' once the statues' riddle is solved (the falcon and the ibis are owed back at the gates)
//   seen        details Silvia looked at: arch, staff, tracks, fire, statues
(function (root) {
  'use strict';

  var K = {
    path: 'order_gates_path',
    flags: 'order_gates_flags',
    hours: 'order_monolith_march_hours',
    night: 'order_night_erg',
    returned: 'order_gates_return'
  };
  var BASE_HOURS = 12, MIN_HOURS = 9;

  function store() { try { return root.localStorage || null; } catch (e) { return null; } }
  function get(k) { var s = store(); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { var s = store(); try { if (s) s.setItem(k, v); } catch (e) {} }
  function readJson(k) {
    try { var o = JSON.parse(get(k) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; }
  }

  function flags() { return readJson(K.flags); }
  function tone() { return get(K.path) || null; }
  function played() { return get('order_gates_scene_completed') === 'true'; }

  // the Servant is won over (a shortcut) or sore (a storm); penance in oil clears a sore name
  function helped(f) { return (f.regard || 0) >= 3; }
  function irritated(f) { return (f.regard || 0) <= -2 && !f.gaveOil; }

  // Hours of the crossing for a given set of flags (12 by default, never fewer than 9)
  function hoursFor(f) {
    var h = BASE_HOURS;
    if (helped(f)) h -= 2;
    else if (irritated(f)) h += 2;
    if (f.coin) h -= 1;
    return Math.max(MIN_HOURS, h);
  }
  // Frozen at the moment Hermes sets out, so a replayed scene never moves a walk already under way
  function marchHours() {
    var saved = parseInt(get(K.hours) || '', 10);
    if (saved >= MIN_HOURS && saved <= 20) return saved;
    // a walk that began before the road was frozen (an older save) keeps the plain twelve
    if (get('order_monolith_march_start')) return BASE_HOURS;
    return hoursFor(flags());
  }
  function freezeMarchHours() {
    if (!get(K.hours) && !get('order_monolith_march_start')) set(K.hours, String(hoursFor(flags())));
    return marchHours();
  }
  // 'shortcut' | 'storm' | 'steady'
  function marchKind() {
    var h = marchHours();
    return h < BASE_HOURS ? 'shortcut' : h > BASE_HOURS ? 'storm' : 'steady';
  }
  var WORDS = { 9: 'Nine', 10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen' };
  function hoursWord() { var h = marchHours(); return WORDS[h] || String(h); }

  // Hermes still carries lamp oil only if he neither fed the fire nor lost the duel
  function hasLantern(f) { f = f || flags(); return !f.gaveOil && !f.lostOil && f.nightOil !== 'all'; }

  // Which night awaits on the Erg: darkness (no oil), the ghost camel (Silvia saw the prints), or a traveller who begs for oil
  function nightKind(f) {
    f = f || flags();
    if (!hasLantern(f)) return 'dark';
    if (f.seen && f.seen.tracks) return 'ghost';
    return 'traveller';
  }
  function night() { return readJson(K.night); }
  function nightDone() { return !!night().done; }
  function saveNight(o) { var n = night(); for (var k in o) n[k] = o[k]; set(K.night, JSON.stringify(n)); }

  // The unique object each road leaves in the satchel: [relic id, ...]
  function relics(f) {
    f = f || flags();
    var out = [];
    if (f.blessing) out.push('red_cord');
    if (f.coin) out.push('servant_coin');
    return out;
  }

  // ---- The return (Station 19): five seals home, the bronze doors at last ----
  function sealsHome() {
    for (var i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) !== 'true') return false;
    return true;
  }
  function owns(id) {
    if (id === 'falcon_weight' && get('order_oasis_clepsydra_completed') === 'true') return true;
    try { var l = JSON.parse(get('order_inventory_relics') || '[]'); return Array.isArray(l) && l.indexOf(id) >= 0; } catch (e) { return false; }
  }
  // The two stone keepers can be paid back only by whoever read their riddle and carries both figures
  function canPayKeepers(f) { f = f || flags(); return f.statues === 'riddle' && owns('falcon_weight') && owns('ibis_figure'); }
  function returnState() { return readJson(K.returned); }
  function returned() { return !!returnState().done; }
  function needsReturn() { return sealsHome() && !returned(); }
  function saveReturn(o) { var r = returnState(); for (var k in o) r[k] = o[k]; set(K.returned, JSON.stringify(r)); }
  // How the bronze doors open: the keepers paid > a secret trusted > the tone of the road
  function ending(f, tone_, keepersPaid) {
    f = f || {};
    if (keepersPaid) return 'keepers';
    if (f.secret) return 'trusted';
    return tone_ === 'bold' || tone_ === 'observer' ? tone_ : 'humble';
  }

  function save(tone_, f) {
    set(K.path, tone_ || 'humble');
    set(K.flags, JSON.stringify(f || {}));
  }
  function patch(o) { var f = flags(); for (var k in o) f[k] = o[k]; set(K.flags, JSON.stringify(f)); return f; }

  root.GatesRoad = {
    KEYS: K, BASE_HOURS: BASE_HOURS, MIN_HOURS: MIN_HOURS,
    flags: flags, tone: tone, played: played, helped: helped, irritated: irritated,
    hoursFor: hoursFor, marchHours: marchHours, freezeMarchHours: freezeMarchHours, marchKind: marchKind, hoursWord: hoursWord,
    hasLantern: hasLantern, nightKind: nightKind, night: night, nightDone: nightDone, saveNight: saveNight,
    relics: relics, save: save, patch: patch,
    sealsHome: sealsHome, owns: owns, canPayKeepers: canPayKeepers, returned: returned, returnState: returnState, needsReturn: needsReturn, saveReturn: saveReturn, ending: ending
  };
})(typeof window !== 'undefined' ? window : globalThis);
