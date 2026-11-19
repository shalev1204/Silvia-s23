"""One-off (19 Nov 2026): the last scene of the Desert Path, "Dawn at the gates". The scene of the gates of Tower II gets a third
person (Aurelia, unveiled) and a mode 'farewell': Silvia chooses the gestures of the goodbye, the doors close, and the five seals
burn in the arch. Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

T = 'web/hub/js/stations/s13b-gates-tower-ii.js'
R(T, [
("""  var focusTarget = { overview: [0, 3.9, 1.6, 19], servant: [0.7, 2.6, 1.1, 11], hermes: [-0.7, 2.3, 2.3, 11] };""",
 """  var focusTarget = { overview: [0, 3.9, 1.6, 19], servant: [0.7, 2.6, 1.1, 11], hermes: [-0.7, 2.3, 2.3, 11], aurelia: [-0.2, 2.6, 1.5, 11] };
  var aureliaRef = null;   // Aurelia, unveiled: she only stands here in the farewell at dawn (mode 'farewell')"""),
("""    servantRef = servant; hermesRef = hermes;""", """    // Aurelia walks out of Tower II in the last scene of the Desert Path (hidden until then)
    var aurelia = null;
    try {
      aurelia = SC.chars.oracle ? SC.chars.oracle(paint, { scale: 1.1 }) : null;
      if (aurelia) {
        if (aurelia.userData.lift) aurelia.userData.lift(1);
        aurelia.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        aurelia.position.set(-0.25, PLAT, 1.35); aurelia.rotation.y = Math.PI; aurelia.visible = false;
        scene.add(aurelia);
      }
    } catch (e) { aurelia = null; }
    servantRef = servant; hermesRef = hermes; aureliaRef = aurelia;"""),
("""      [hermes, servant].forEach(function (o) {
        var want = stairY(o.position.x, o.position.z);""", """      [hermes, servant, aurelia].forEach(function (o) {
        if (!o) return;
        var want = stairY(o.position.x, o.position.z);"""),
("""    function who(name) { return name === 'servant' ? servant : hermes; }""",
 """    function who(name) { return name === 'servant' ? servant : name === 'aurelia' && aurelia ? aurelia : hermes; }"""),
("""        if (name === 'servant') { if (servant.userData.react) servant.userData.react(kind); }
        else if (gfx && gfx.gait && gfx.gait.react) gfx.gait.react(kind);""",
 """        if (name === 'servant') { if (servant.userData.react) servant.userData.react(kind); }
        else if (name === 'aurelia') { if (aurelia && aurelia.userData.react) aurelia.userData.react(kind); }
        else if (gfx && gfx.gait && gfx.gait.react) gfx.gait.react(kind);"""),
("""        birds.forEach(function (b) { b.life = 0; b.m.visible = false; });
      },""", """        birds.forEach(function (b) { b.life = 0; b.m.visible = false; });
        if (aurelia) aurelia.visible = false;
      },
      // put someone on a spot at once (the farewell starts with the three of them on the landing)
      place: function (name, x, z, rot) { var o = who(name); if (name === 'aurelia' && !aurelia) return; o.position.set(x, stairY(x, z), z); o.rotation.y = rot; o.visible = true; },"""),
("""    if (who === 'servant') servantRef.localToWorld(tmpV.set(0, 2.5, 0));""",
 """    if (who === 'servant') servantRef.localToWorld(tmpV.set(0, 2.5, 0));
    else if (who === 'aurelia' && aureliaRef && aureliaRef.visible) aureliaRef.localToWorld(tmpV.set(0, 2.3, 0));"""),
("""    silvia:  { name: 'Silvia',      role: 'on the field wire',  icon: '📡' }
  };""", """    silvia:  { name: 'Silvia',      role: 'on the field wire',  icon: '📡' },
    aurelia: { name: 'Aurelia',     role: 'Oracle of Tower II', icon: '⭐' }
  };"""),
("""    focusOn(who === 'servant' ? 'servant' : who === 'hermes' && !(hermesRef && !hermesRef.visible) ? 'hermes' : 'overview');""",
 """    focusOn(who === 'servant' ? 'servant' : who === 'aurelia' ? 'aurelia' : who === 'hermes' && !(hermesRef && !hermesRef.visible) ? 'hermes' : 'overview');"""),
("""  function sayV(t, extra) { var o = { who: 'silvia', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }""",
 """  function sayV(t, extra) { var o = { who: 'silvia', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function sayA(t, extra) { var o = { who: 'aurelia', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }"""),
("""    ds: ds, CHOICES: CHOICES, nar: nar, sayH: sayH, sayS: sayS, sayV: sayV, look: look, R: R, STAFF_Q: STAFF_Q,""",
 """    ds: ds, CHOICES: CHOICES, nar: nar, sayH: sayH, sayS: sayS, sayV: sayV, sayA: sayA, look: look, R: R, STAFF_Q: STAFF_Q,
    finishFarewell: showFarewellCard, sealGlow: function () { ds.sealGlow = true; sealFlash = 1.4; },"""),
("""        } else {
          sealLight.intensity = firstSealMesh && firstSealMesh.visible ? 0.7 + 0.15 * Math.sin(t * 2) : 0;
          sealMat.emissiveIntensity = 0.55;
        }""", """        } else {
          sealLight.intensity = firstSealMesh && firstSealMesh.visible ? 0.7 + 0.15 * Math.sin(t * 2) : 0;
          sealMat.emissiveIntensity = 0.55;
        }
        // the farewell: the five seals keep burning in the arch, like five small suns
        if (ds.sealGlow) { sealMat.emissiveIntensity = Math.max(sealMat.emissiveIntensity, 1.7 + 0.3 * Math.sin(t * 1.7)); sealLight.intensity = Math.max(sealLight.intensity, 2.2); }"""),
("""    if (ds.stage !== 'done' && ds.stage !== 'ret_done' && ds.mode !== 'return') act.home();""",
 """    if (ds.stage !== 'done' && ds.stage !== 'ret_done' && ds.mode !== 'return' && ds.mode !== 'farewell') act.home();"""),
("""    ds.mode = null; ds.onReturn = null; ds.retSeals = back ? 5 : 0; ds.away = !!resume;
    openDoors(back ? 'full' : 'shut');""", """    ds.mode = null; ds.onReturn = null; ds.retSeals = back ? 5 : 0; ds.away = !!resume; ds.sealGlow = false;
    openDoors(back ? 'full' : 'shut');"""),
("""    ds.mode = 'return'; ds.onReturn = onDone || null;""", """    ds.mode = 'return'; ds.onReturn = onDone || null; ds.sealGlow = false;"""),
("""  var RETURN_WORDS = {""", """  // ---- the farewell (launched by desert-farewell.js after the last talk of the Desert Path): dawn, the doors open, the three of them ----
  async function startFarewell(onDone) {
    var token = ++ds.token, Road = window.GatesRoad;
    ds.mode = 'farewell'; ds.onReturn = onDone || null;
    ds.stage = 'intro'; ds.asked = {}; ds.busy = true; ds.fast = false; ds.knows = true;
    ds.flags = Road ? Road.flags() : {}; ds.tone = Road ? Road.tone() : null;
    ds.regard = ds.flags.regard || 0; ds.seen = ds.flags.seen || {};
    ds.wrongs = 0; ds.picked = {}; ds.duel = null; ds.relics = []; ds.statueMiss = 0;
    ds.ret = { sealed: true, asked: true, keepers: true, survey: true };
    ds.fw = {};   // the gestures of the goodbye she chose
    ds.retSeals = 5; ds.away = false; ds.sealGlow = false;
    openDoors('full'); act.reset(); act.setTime('dawn'); act.hermesAway(false);
    act.place('servant', 1.15, 0.95, 2.6);
    act.place('hermes', -1.15, 1.75, -0.9);
    act.place('aurelia', -0.2, 1.3, Math.PI);
    fireFed = !!(ds.flags.gaveOil || ds.flags.lostOil);
    pauseCtl.set(false);
    if (SUB) SUB.reset(subtitle, 'Dawn at the gates of Tower II.');
    if (hudTime) hudTime.textContent = '06:05 · DAWN';
    if (extras) extras.reset();
    logEl.innerHTML = '';
    choicesBox.innerHTML = '';
    choicesBox.parentNode.style.display = 'none';
    if (decreeCard) decreeCard.style.display = 'none';
    hideStageBubble();
    updateHUD();
    focusThing('overview');
    setMission('Dawn at the gates · the road east');
    logCard('📖 Where we are', [
      'The Desert Path is walked. Hermes and Aurelia leave Tower II at first light, on the ruts of the wagons.',
      'The Servant has come to the bronze doors to see them off. How they part is yours to choose.'
    ]);
    await sleep(1400);
    var ok = await play(extras ? extras.farewellLines() : [], token);
    if (!ok) return;
    ds.stage = 'fw';
    ds.busy = false;
    setSpeaking(null);
    setMission('Say goodbye at the gates');
    renderChoices();
    hideStageBubbleSoon(token);
  }
  function showFarewellCard(fw) {
    if (!decreeCard) return;
    var title = decreeCard.querySelector('.gates-decree-title span:last-child');
    var body = decreeCard.querySelector('.gates-decree-body');
    var tagsEl = decreeCard.querySelector('.gates-path-tags');
    var tags = [];
    if (fw && fw.veil) tags.push('🕊 The veil stays');
    if (fw && fw.cord) tags.push('🧶 A thirteenth knot');
    if (fw && fw.compass) tags.push('🧭 Two degrees east');
    if (fw && fw.flint) tags.push('🔥 A flint for his lamp');
    if (tagsEl) tagsEl.innerHTML = '<span class="gpt-label">YOUR GOODBYE</span>' + tags.concat(['☀ Five seals burning']).map(function (x) { return '<span class="gpt-tag">' + x + '</span>'; }).join('');
    var icon = decreeCard.querySelector('.gates-decree-title span:first-child');
    if (icon) icon.textContent = '🌅';
    if (title) title.textContent = 'The Road East';
    if (body) body.textContent = 'The bronze doors are shut behind them, and five small suns burn in the arch. Ahead lie the ruts of the wagons, a plateau of wind, and the third tower.';
    if (btnDepart) { var lb = btnDepart.querySelector('span'); if (lb) lb.textContent = '🗺️ The Desert Path, walked ➔'; }
    if (btnReplay) btnReplay.style.display = 'none';
    decreeCard.style.display = 'flex';
    if (sfx.playCelestialChime) sfx.playCelestialChime();
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    decreeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (btnDepart) setTimeout(function () { try { btnDepart.focus({ preventScroll: true }); } catch (e) {} }, 80);
  }

  var RETURN_WORDS = {"""),
("""    var ret = !!(opts && opts.mode === 'return');
    if (!ret && typeof window.isGatesMarchOver""", """    var ret = !!(opts && opts.mode === 'return'), fare = !!(opts && opts.mode === 'farewell');
    if (!ret && !fare && typeof window.isGatesMarchOver"""),
("""    var begin = function () { if (ret) startReturn(opts.onDone); else startConversation(isCompleted()); };""",
 """    var begin = function () { if (ret) startReturn(opts.onDone); else if (fare) startFarewell(opts.onDone); else startConversation(isCompleted()); };"""),
("""      if (ds.mode === 'return') {
        var next = ds.onReturn; ds.onReturn = null;""", """      if (ds.mode === 'return' || ds.mode === 'farewell') {
        var next = ds.onReturn; ds.onReturn = null;"""),
])

X = 'web/hub/js/stations/s13b-gates-extras.js'
R(X, [
("""    var ds = c.ds, nar = c.nar, H = c.sayH, S = c.sayS, V = c.sayV, look = c.look, R = c.R;""",
 """    var ds = c.ds, nar = c.nar, H = c.sayH, S = c.sayS, V = c.sayV, AU = c.sayA, look = c.look, R = c.R;"""),
("""    var returnChoices = {""", """    // =====================================================================
    // THE FAREWELL · dawn at the gates, the last scene of the Desert Path (stage 'fw'; desert-farewell.js launches it)
    // Hermes and Aurelia leave for Tower III. Silvia chooses the gestures of the goodbye; then the doors close and the seals burn.
    // =====================================================================
    function fwHas(id) { var ru = RU(); return ru ? ru.has(id) : false; }
    function farewellLines() {
      return [
        nar('Dawn. The bronze doors of Tower II stand open, and for the first time in fifty-five years Aurelia walks out through them.', { hold: 1400, fx: function () { react('aurelia', 'wonder'); } }),
        nar('She stops on the top step, bare-faced in the cold light, and looks at the desert as if someone had moved it in the night.'),
        AU('It is bigger than I drew it.'),
        H('We are on the steps, Silvia, with the road east at our feet. The Servant has come to see us off. He is pretending he has not.'),
        S('I came to shut the doors. Someone has to.')];
    }
    function veilLines() {
      return [
        H('Silvia asks about your veil, Aurelia.'),
        nar('Aurelia unpins the grey veil from her shoulder, folds it in four, and lays it in the old man’s wrapped hands.', { hold: 1500, fx: function () { react('aurelia', 'offer'); var a = A(); if (a) a.later(0.9, function () { react('servant', 'bow'); }); } }),
        AU('Keep it, old friend. The desert can do without an Oracle for one winter.'),
        S('And if someone comes to ask the Oracle a question?'),
        AU('Tell them she has gone to ask one of her own.')];
    }
    function cordLines() {
      return [
        nar('Hermes holds out his staff. The red cord hangs from it, twelve knots, worn grey by the road.', { fx: function () { react('hermes', 'offer'); } }),
        nar('The old man takes it in his burnt fingers and, slowly, ties one more.', { hold: 1700, fx: function () { react('servant', 'offer'); if (c.cue) c.cue('click'); } }),
        S('Twelve knots for the road you walked. One for the road you have not.'),
        H('The thirteenth, Silvia. He pulled it tighter than all the others.')];
    }
    function compassLines() {
      return [
        nar('Aurelia takes the brass compass from Hermes, taps the glass, and turns the little screw on its back with her thumbnail.', { hold: 1600, fx: function () { react('hermes', 'offer'); var a = A(); if (a) a.later(0.8, function () { react('aurelia', 'nod'); }); } }),
        AU('Two degrees east. It has been two degrees east since the day you bought it.'),
        H('Twenty-eight years, Silvia. Twenty-eight years I have been two degrees wrong, and nobody told me.'),
        AU('I am telling you now.')];
    }
    function flintLines() {
      return [
        nar('Hermes lays his flint and tinder on the rim of the bronze brazier.', { fx: function () { react('hermes', 'offer'); if (c.feedFire) c.feedFire(); } }),
        H('For your lamp, elder. Mine has had its share of fire.'),
        S('I will light it at dusk. Every dusk, until you are back.')];
    }
    function eastLines() {
      var fw = ds.fw || {};
      var out = [
        nar('They go down the steps together, Aurelia a pace ahead. Behind them the old man lays both hands on the bronze leaves, and closes them.', { hold: 3200, fx: function () {
          var a = A();
          if (a) {
            a.walk('aurelia', -0.6, 3.9, { speed: 0.9, face: Math.PI });
            a.walk('hermes', -1.5, 3.4, { speed: 0.9, face: a.faceTo('hermes', 0.2, 0.4) });
            a.walk('servant', 0.15, 0.6, { speed: 0.8, face: 0, then: function () { react('servant', 'offer'); c.openDoors('shut'); if (c.cue) c.cue('stone'); } });
          } else c.openDoors('shut');
        } }),
        nar('In the arch the five seals catch the first sun, one after the other, and burn like five small suns.', { hold: 2200, fx: function () { look('arch')(); c.sealGlow(); c.fireBurst(1.2); if (c.cue) c.cue('bell', { f: 196, v: 0.5, len: 5 }); } }),
        S('As long as they burn, the house is kept. Go.', { fx: function () { var a = A(); if (a) a.walk('servant', 0.95, 0.95, { speed: 0.8, face: 2.44 }); } })];
      if (fw.veil) out.push(nar('He stands on the top step with the folded veil against his chest, and does not go in.'));
      out.push(
        H('Five lights in the arch, Silvia. I can still see them from the road. You put every one of them there.', { fx: function () { look('overview')(); react('hermes', 'bow'); } }),
        AU('Come along, surveyor. The east will not wait for a man who looks back.'));
      return out;
    }
    var farewellChoices = {
      fw_veil: {
        icon: '🕊', label: 'Ask Aurelia about the Oracle’s veil.', say: 'Hermes, ask her about the veil. Is she taking it?',
        lines: veilLines, after: function () { ds.fw.veil = true; }
      },
      fw_cord: {
        icon: '🧶', label: 'Show the Servant his red cord.', say: 'The red cord, Hermes. Show him you kept it all the way.',
        lines: cordLines, after: function () { ds.fw.cord = true; }
      },
      fw_compass: {
        icon: '🧭', label: 'Let Aurelia see the compass.', say: 'Give Aurelia your compass for a moment, Hermes. She corrected your chart in a minute.',
        lines: compassLines, after: function () { ds.fw.compass = true; }
      },
      fw_flint: {
        icon: '🔥', label: 'Leave the flint with the Servant.', say: 'Leave him your flint and tinder, Hermes. For his lamp.',
        lines: flintLines,
        after: function () { ds.fw.flint = true; var ru = RU(); if (ru) ru.spend('flint_tinder', { silent: true }); }
      },
      fw_go: {
        icon: '🌅', label: 'East, Hermes. The road is waiting.', say: 'East, Hermes. Both of you. The road is waiting, and so am I.',
        lines: eastLines,
        after: function () { ds.stage = 'fw_done'; c.setMission('The road east'); c.finishFarewell(ds.fw); }
      }
    };
    for (var fk in farewellChoices) choices[fk] = farewellChoices[fk];
    function farewellMenu() {
      var fw = ds.fw || {}, out = [];
      if (!fw.veil) out.push('fw_veil');
      if (!fw.cord && fwHas('red_cord')) out.push('fw_cord');
      if (!fw.compass && fwHas('surveyor_compass')) out.push('fw_compass');
      if (!fw.flint && fwHas('flint_tinder')) out.push('fw_flint');
      return out.concat(['fw_go']);
    }

    var returnChoices = {"""),
("""      if (stage === 'ret') return returnMenu();
      if (stage === 'ret_done') return [];""", """      if (stage === 'ret') return returnMenu();
      if (stage === 'ret_done' || stage === 'fw_done') return [];
      if (stage === 'fw') return farewellMenu();"""),
("""    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines };""",
 """    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines, farewellLines: farewellLines };"""),
])
print('done')
