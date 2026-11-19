"""One-off (18 Nov 2026): the tester's resets and the full resets know about spent relics and the new keys of Stations 18 and 19.
Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

H = 'web/hub/js/hub-core.js'
R(H, [
("""                'order_satchel_expedition_item', 'order_inventory_relics',
                'order_messenger_unread_count', 'order_messenger_last_read_step',""",
 """                'order_satchel_expedition_item', 'order_inventory_relics', 'order_relics_spent',
                'order_messenger_unread_count', 'order_messenger_last_read_step',"""),
("""              'order_satchel_expedition_item', 'order_inventory_relics', 'order_cartographer_title',
              'order_field_inquiries_read',""", """              'order_satchel_expedition_item', 'order_inventory_relics', 'order_relics_spent', 'order_cartographer_title',
              'order_field_inquiries_read',"""),
("""            localStorage.setItem('order_inventory_relics', JSON.stringify(['gilded_feather', 'order_wax_seal']));""",
 """            localStorage.setItem('order_inventory_relics', JSON.stringify(['gilded_feather', 'order_wax_seal']));
            localStorage.removeItem('order_relics_spent');"""),
("""            localStorage.removeItem('order_inventory_relics');
            localStorage.removeItem('order_messenger_unread_count');""", """            localStorage.removeItem('order_inventory_relics');
            localStorage.removeItem('order_relics_spent');
            localStorage.removeItem('order_messenger_unread_count');"""),
# Station 18: its own keys, and the falcon back if it was hung on the well chain
("""            reset() { dels(['order_polybius_stele_completed', 'order_stele_awake', 'order_stele_key_fails', 'order_stele_hint', 'order_stele_knocks', 'order_stele_knock_fails', 'order_stele_knock_hint', 'order_stele_fire_fails', 'order_stele_fire_hint', 'order_stele_march_start', 'order_stele_march_bypassed', 'order_stele_seals_at_well']); dropRelic('servant_key'); }""",
 """            reset() {
              const RU = window.RelicUse;
              if (RU && get('order_stele_falcon') === 'used') RU.unspend('falcon_weight');
              dels(['order_polybius_stele_completed', 'order_stele_awake', 'order_stele_key_fails', 'order_stele_hint', 'order_stele_knocks', 'order_stele_knock_fails', 'order_stele_knock_hint', 'order_stele_fire_fails', 'order_stele_fire_hint', 'order_stele_march_start', 'order_stele_march_bypassed', 'order_stele_seals_at_well',
                'order_stele_howto', 'order_stele_cine_intro', 'order_stele_coin', 'order_stele_falcon', 'order_stele_trail']);
              dropRelic('servant_key');
            }"""),
# Station 19 (and the return to the gates that it launches): everything the satchel gave there comes back
("""            reset() { dels(['order_oracle_horizon_completed', 'order_oracle_awake', 'order_oracle_key_fails', 'order_oracle_hint', 'order_oracle_disc', 'order_oracle_disc_turns', 'order_oracle_disc_hint', 'order_oracle_when_read', 'order_oracle_read_fails', 'order_oracle_vow_fails', 'order_oracle_vow_hint', 'order_oracle_stair_start', 'order_oracle_stair_bypassed', 'order_stage_passage_seen', 'order_gates_return']); dropRelic('gilded_star'); dropRelic('statue_seal'); }""",
 """            reset() {
              const RU = window.RelicUse;
              if (RU) {
                let ret = {};
                try { ret = JSON.parse(get('order_gates_return') || '{}') || {}; } catch (e) {}
                [1, 2, 3, 4, 5].forEach((i) => RU.unspend('seal_cairn_' + i));
                RU.unspend('servant_key'); RU.unspend('tuning_pebble');
                if (ret.keepers) { RU.unspend('falcon_weight'); RU.unspend('ibis_figure', true); }
                if (ret.survey) RU.unspend('raiders_survey', true);
                if (get('order_oracle_lamp') === 'lit') RU.unspend('founders_lamp', true);
                if (get('order_oracle_coin') === 'set') RU.unspend('servant_coin', true);
              }
              dels(['order_oracle_horizon_completed', 'order_oracle_awake', 'order_oracle_key_fails', 'order_oracle_hint', 'order_oracle_disc', 'order_oracle_disc_turns', 'order_oracle_disc_hint', 'order_oracle_when_read', 'order_oracle_read_fails', 'order_oracle_vow_fails', 'order_oracle_vow_hint', 'order_oracle_stair_start', 'order_oracle_stair_bypassed', 'order_stage_passage_seen', 'order_gates_return',
                'order_oracle_howto', 'order_oracle_cine_intro', 'order_oracle_key', 'order_oracle_lamp', 'order_oracle_coin', 'order_oracle_pebble']);
              dropRelic('gilded_star'); dropRelic('statue_seal');
            }"""),
])
R('web/hub/js/relic-use.js', [
("""      // for the tester's resets: a station replayed from the start gets its relic back
      function unspend(id) {
        var l = spentList(), i = l.indexOf(id);
        if (i < 0) return;
        l.splice(i, 1); set(KEY, JSON.stringify(l));
        if (typeof window.syncLampOil === 'function') window.syncLampOil();
      }""", """      // for the tester's resets: a station replayed from the start gets its relic back. Most relics come back by themselves
      // (the satchel derives them from the game's flags); `restore` puts back one that only lived in the satchel's own list.
      function unspend(id, restore) {
        var l = spentList(), i = l.indexOf(id);
        if (i < 0) return;
        l.splice(i, 1); set(KEY, JSON.stringify(l));
        if (restore) {
          try {
            var inv = JSON.parse(get('order_inventory_relics') || '[]');
            if (Array.isArray(inv) && inv.indexOf(id) < 0) { inv.push(id); set('order_inventory_relics', JSON.stringify(inv)); }
          } catch (e) {}
        }
        if (typeof window.syncLampOil === 'function') window.syncLampOil();
      }"""),
])
print('done')
