"""One-off (18 Nov 2026): on the march east to the Arch (leg 22) Hermes drinks the last of the water, and the Four Water
Skins leave the satchel. A march question can now carry onLapse(W), run when it goes unanswered. Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

R('web/hub/js/hub-core.js', [
("""        if (e) { e.pick = 'x'; marchEvSave(st); }
        const line = marchNoReply(pend.entry.id);""", """        if (e) { e.pick = 'x'; marchEvSave(st); }
        marchLapse(pend.ev);
        const line = marchNoReply(pend.entry.id);"""),
("""      // Delivers what the walk has reached (one slot at a time). Returns true while it is speaking.""", """      // a question that went unanswered can still change something (e.g. a relic spent): its onLapse(W)
      function marchLapse(ev) { if (ev && typeof ev.onLapse === 'function') { try { ev.onLapse(window.WireScript); } catch (err) { console.warn('wire march onLapse', err); } } }
      // Delivers what the walk has reached (one slot at a time). Returns true while it is speaking."""),
("""        const st2 = marchEvState(); (st2[legNo] = st2[legNo] || []).push({ id: ev.id, pick: ev.choices ? (last ? null : 'x') : 'n' }); marchEvSave(st2);""",
 """        const st2 = marchEvState(); (st2[legNo] = st2[legNo] || []).push({ id: ev.id, pick: ev.choices ? (last ? null : 'x') : 'n' }); marchEvSave(st2);
        if (ev.choices && !last) marchLapse(ev);"""),
])

R('web/hub/js/wire-script-marches.js', [
("""    { at: 0.68, pool: [
      { id: 'ret-wrong-turn',""", """    // the last of the water: the Four Water Skins leave the satchel, whatever she answers (Operator, 18 Nov 2026)
    { at: 0.45, pool: [
      { id: 'ret-last-water',
        beats: [
          'Silvia, I shook the water skins at the last rest. Three are as flat as old gloves. The fourth sloshes, a quarter full.',
          'Nine hours to the Arch, and the sun is getting up. I have one good drink left, or two small ones.',
          'Tell me how to spend it. I trust your arithmetic more than my thirst.'
        ],
        lapse: 'No answer came through, so I drank half and kept half for the last dunes. Both halves are gone now. I left the four empty skins folded under a flat stone by the wash.',
        onLapse: () => { if (window.RelicUse) window.RelicUse.spend('water_skins', { silent: true }); },
        choices: [
          { text: 'Drink it now, while you need it.',
            silviaMsg: 'Drink it now, Hermes. Water in your body walks better than water in a bag.',
            reply: [
              'Done, to the last drop. It was warm and tasted of goat, and it was the best thing I have drunk in a week.',
              'You were right: my legs remembered what they are for. A dry skin is only weight, so I folded all four under a flat stone by the wash.',
              'If the rains ever come, someone thirsty will find them. That is how the desert keeps its accounts.'
            ],
            onPick: () => { if (window.RelicUse) window.RelicUse.spend('water_skins', { tag: 'DRUNK ON THE ROAD', lore: 'Hermes drank the last of the water on the road east to the Arch, and left the four empty skins under a flat stone by the wash.' }); } },
          { text: 'Save it for the last dunes.',
            silviaMsg: 'Save it, Hermes. Drink it at the foot of the last dune, when you need it most.',
            reply: [
              'I saved it. I walked through the heat of the day with a quarter of a skin knocking against my hip, like a promise.',
              'At the foot of the last dune I drank it to the bottom, and I climbed like a man of forty. Well. Of fifty.',
              'The empty skins I left under a flat stone at the edge of the dunes. A dry skin is only weight.'
            ],
            onPick: () => { if (window.RelicUse) window.RelicUse.spend('water_skins', { tag: 'DRUNK ON THE ROAD', lore: 'Hermes kept the last of the water for the dunes of Cairn V, drank it at the foot of the last slope, and left the empty skins under a flat stone.' }); } }
        ] }
    ] },
    { at: 0.68, pool: [
      { id: 'ret-wrong-turn',"""),
])

R('web/hub/js/relic-use.js', [
("""        var c = card(id);
        if (typeof window.showItemRelinquishedAnimation === 'function') {""", """        var c = card(id);
        // silent: spent while she was elsewhere (a question on the Wire left unanswered); the satchel just loses it
        if (opts.silent) {
          if (typeof window.dropRelic === 'function') window.dropRelic(id);
          if (typeof window.updateInventoryBadge === 'function') window.updateInventoryBadge();
          if (typeof onDone === 'function') onDone();
          return;
        }
        if (typeof window.showItemRelinquishedAnimation === 'function') {"""),
])
print('done')
