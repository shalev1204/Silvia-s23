    // Canonical story point (12 Nov 2026): Silvia's own journey, exactly as her device saved it to the Order's archive
    // on 12 Nov at 10:51 CET (eclipse_saves #392, 106 keys). She crossed the Gates by the humble road on 11 Nov at
    // 00:03 CET, the ten-hour march is over and Hermes waits at the foot of the Sun Monolith (Station 14), not begun.
    // Every profile gets it once (the flag travels inside each seeker's journey, see profiles.js): Carles's, and Silvia's
    // where the cloud save is off (the Operator's local copy), with the same answers, choices, relics and Ledger letters.
    // Where the cloud save is on, Silvia's profile is left to it: an empty browser asks the archive for her LATEST save,
    // which is never older than this copy. Loaded in <head> straight after cloud-save.js, before anything reads the journey.
    (function () {
      'use strict';
      var FLAG = 'order_story_monolith_v1';
      var DEVICE_KEYS = ['the_eclipse_active_seeker', 'the_eclipse_gate_ok_at', 'hub_sidebar_collapsed'];
      function isDeviceKey(k) {
        return DEVICE_KEYS.indexOf(k) >= 0 || k.indexOf('eclipse_profile_vault_') === 0 || k.indexOf('eclipse_cloud_') === 0;
      }
      try {
        var store = window.localStorage;
        var seeker = String(store.getItem('the_eclipse_active_seeker') || '').toLowerCase();
        if ((seeker !== 'silvia' && seeker !== 'carles') || store.getItem(FLAG) === 'done') return;
        var SAVE = {
        "cartographer_radio_active_slide": "0",
        "order_active_map_path": "desert",
        "order_ambience_muted": "false",
        "order_balance_state": "{\"silvia\":{\"open\":\"lon-sec|diff-tf\",\"pairs\":{\"lat-deg|diff-kg\":{\"step\":3,\"entries\":[52,26,22]},\"lon-deg|diff-pb\":{\"step\":3,\"entries\":[42,21,17]},\"lon-min|diff-ve\":{\"step\":3,\"entries\":[24,12,2]},\"lon-sec|diff-tf\":{\"step\":3,\"entries\":[32,16,6]}}}}",
        "order_cairn1_completed": "true",
        "order_cairn1_found": "true",
        "order_carles_waypoint_v2": "done",
        "order_cartographer_title": "Hermes",
        "order_chasm_howto": "seen",
        "order_chasm_march_start": "1792684800000",
        "order_chasm_walk": "{\"pos\":[23,24],\"h\":1,\"trail\":[25,26,27,28,29,30,31,32,33,34,59,84,85,86,61,36,37,38,39,40,65,90,89,88,113,138,137,136,135,134,159,184,185,186,187,188,213,238,239,240,215,190,165,140,141,142,167,192,193,194,169,144,119,94,95,96,71,46,47,48,73,98,123,148,173,198,197,196,221,246,247,248,273,298,297,296,295,294,319,344,345,346,371,396,397,398,423,448,473,498,523,548,547,546,521,496,471,446,445,444,419,394,393,392,367,342,317,292,291,290,289,288,287,286,261,236,235,234,259,284,283,282,281,280,255,230,231,232,207,182,181,180,179,178,153,128,129,130,131,132,107,82,81,80,79,78,77,76,101,126,151,176,201,226,227,228,253,278,303,328,353,378,403,428,453,478,479,480,455,430,431,432,457,482,507,532,557,582,583,584,559,534,509,484,459,434,409,384,385,386,387,388,363,338,339,340,365,390,415,440,441,442,467,492,491,490,489,488,487,486,511,536,537,538,539,540,565,590,591,592,567,542,543,544,569,594,595,596,597,598,599],\"ss\":215,\"runes\":6,\"water\":2.75,\"min\":734.32,\"wh\":0,\"cp\":[21,15],\"ch\":1,\"walked\":276,\"forks\":17,\"fails\":2,\"heard\":1}",
        "order_chasm_wire": "{\"seen0\":true,\"reply0\":2,\"seen1\":true,\"reply1\":1,\"seen2\":true,\"reply2\":2,\"seen3\":true,\"reply3\":1,\"seen4\":true,\"reply4\":1,\"seen5\":true,\"reply5\":1}",
        "order_chat_sound": "on",
        "order_cinematic_night_of_steles_seen": "true",
        "order_cipher_completed": "true",
        "order_clepsydra_act1": "true",
        "order_clepsydra_howto": "seen",
        "order_clepsydra_march_start": "1794310302450",
        "order_dawn_choices": "[1,1]",
        "order_dawn_step": "3",
        "order_desert3d_shown_d": "5472.8996505737305",
        "order_desert3d_shown_lvl": "7",
        "order_desert_lexicon_completed": "true",
        "order_desert_path_unlocked": "true",
        "order_desert_station_active": "12",
        "order_field_inquiries_read": "[\"inq-eclipse-order\",\"inq-al-qibla\",\"inq-river-hunch\",\"inq-ledger-how\"]",
        "order_field_wire_choices": "[2,0,1,0,null,0,null,0]",
        "order_field_wire_completed": "true",
        "order_field_wire_step": "9",
        "order_flower_completed": "true",
        "order_gates_flags": "{\"trial\":true,\"tlook\":true,\"testPassed\":true,\"lieHeard\":true,\"blessing\":true,\"secret\":true,\"regard\":5,\"seen\":{\"staff\":true}}",
        "order_gates_march_start": "1794312900000",
        "order_gates_path": "humble",
        "order_gates_scene_completed": "true",
        "order_hint_s10-chasm_fails": "2",
        "order_hint_s10-chasm_level": "1",
        "order_hint_s10-chasm_secs": "1010",
        "order_hint_s11-playa_secs": "580",
        "order_hint_s11-sump_fails": "6",
        "order_hint_s11-sump_level": "3",
        "order_hint_s11-sump_secs": "2100",
        "order_hint_s12-dial_secs": "155",
        "order_hint_s12-lexicon_level": "3",
        "order_hint_s12-lexicon_secs": "2100",
        "order_hint_s13-key_secs": "235",
        "order_hint_s13-visions_fails": "4",
        "order_hint_s13-visions_level": "2",
        "order_hint_s13-visions_secs": "2055",
        "order_hub_unlocked": "true",
        "order_hub_unlocked_v4": "true",
        "order_inventory_relics": "[\"gilded_feather\",\"order_wax_seal\",\"surveyor_compass\",\"seal_cairn_1\",\"water_skins\",\"falcon_weight\",\"lamp_oil\",\"red_cord\"]",
        "order_journal": "{\"chasm\":{\"at\":1792839107045,\"fails\":2,\"notes\":1,\"arrived\":1792778400000},\"playa\":{\"at\":1792973013103,\"fails\":6,\"notes\":3,\"restarts\":0,\"arrived\":1792875519287},\"lexicon\":{\"at\":1793036676850,\"fails\":0,\"notes\":3,\"restarts\":0,\"arrived\":null},\"clepsydra\":{\"at\":1794312985309,\"fails\":4,\"notes\":2,\"restarts\":0,\"arrived\":null},\"gates\":{\"at\":1794351833028,\"fails\":0,\"notes\":0,\"restarts\":0,\"arrived\":null}}",
        "order_last_seen_at": "1794477104529",
        "order_lexicon_cine_intro": "seen",
        "order_lexicon_cine_outro": "seen",
        "order_lexicon_howto": "seen",
        "order_lexicon_march_start": "1792973386476",
        "order_lexicon_solved_words": "[\"ac-2\",\"dn-2\",\"dn-4\",\"ac-6\",\"ac-8\",\"dn-7\",\"ac-9\",\"ac-3\",\"dn-5\",\"dn-1\"]",
        "order_lexicon_walk": "{\"carved\":[\"ac-2\",\"dn-2\",\"dn-4\",\"ac-6\",\"ac-8\",\"dn-7\",\"ac-9\",\"ac-3\",\"dn-5\",\"dn-1\"],\"watch\":4,\"min\":1412,\"wrong\":0,\"heard\":0,\"waits\":4,\"atDial\":true,\"sigil\":true,\"locked\":true,\"dialWrong\":0,\"bearWrong\":0,\"flee\":[0,1,-1,1,0,-1,1],\"dead\":0,\"tried\":{},\"hidden\":true,\"hearts\":3,\"tries\":1}",
        "order_matrix_completed": "true",
        "order_messenger_last_read_step": "9",
        "order_midnight_completed": "true",
        "order_monolith_gate_seal1": "true",
        "order_monolith_march_hours": "10",
        "order_monolith_march_start": "1794351831574",
        "order_oasis_clepsydra_completed": "true",
        "order_playa_cine_intro": "seen",
        "order_playa_cine_outro": "seen",
        "order_playa_first_light_called": "true",
        "order_playa_howto": "seen",
        "order_playa_howto2": "seen",
        "order_playa_march_start": "1792839519287",
        "order_playa_walk": "{\"path\":[3,4,3,2,2,3,3],\"edge\":3,\"min\":916,\"fails\":1,\"sinks\":1,\"cracks\":0,\"heavy\":5,\"light\":7,\"revealed\":{},\"mirage\":2,\"sent\":true,\"words\":0,\"sump\":[0,-1,1,0,1,-1],\"sRevealed\":{\"4\":\"hollow\"},\"sFails\":1,\"asked\":{\"0\":[\"wet\"],\"1\":[\"crack\",\"wet\",\"ridge\"],\"2\":[\"ridge\",\"wet\",\"crack\"],\"3\":[\"wet\",\"ridge\",\"crack\"],\"4\":[\"ridge\",\"crack\"],\"5\":[\"wet\"]},\"asks\":13,\"hearts\":2,\"tries\":1}",
        "order_salt_playa_completed": "true",
        "order_salt_playa_path": "[3,4,3,2,2,3,3]",
        "order_sandstorm_start_time": "1792087200000",
        "order_sandstorm_target_time": "1792324800000",
        "order_sandstorm_triggered": "true",
        "order_sandstorm_wire_unlocked": "true",
        "order_satchel_expedition_item": "{\"id\":\"surveyor_compass\",\"name\":\"1998 Brass Surveyor's Compass\",\"icon\":\"🧭\",\"desc\":\"Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail.\"}",
        "order_seal_cairn_1": "true",
        "order_silvia_inquiries_reset_v1": "done",
        "order_silvia_live_v3": "done",
        "order_silvia_live_v4": "done",
        "order_silvia_north_portal_v1": "done",
        "order_silvia_oa_ledger_v1": "done",
        "order_silvia_waypoint_v2": "done",
        "order_silvia_wire_resume_v1": "done",
        "order_silvia_wire_resume_v2": "done",
        "order_station8_unlock_target": "1790632800000",
        "order_station8_unlocked": "true",
        "order_storm_tester_bypassed": "true",
        "order_tester_desert_reset_v1": "done",
        "order_whispering_chasm_completed": "true",
        "order_zodiac_completed": "true",
        "seeker_carles_cipher_completed": "true",
        "seeker_carles_inventory_relics": "[\"gilded_feather\",\"order_wax_seal\",\"surveyor_compass\",\"seal_cairn_1\",\"water_skins\",\"falcon_weight\",\"lamp_oil\",\"red_cord\"]",
        "seeker_carles_midnight_completed": "true",
        "seeker_carles_satchel_expedition_item": "{\"id\":\"surveyor_compass\",\"name\":\"1998 Brass Surveyor's Compass\",\"icon\":\"🧭\",\"desc\":\"Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail.\"}",
        "seeker_silvia_cipher_completed": "true",
        "seeker_silvia_cipher_ledger": "{\"O\":23,\"A\":7,\"K\":26,\"G\":22,\"P\":21,\"B\":17,\"V\":12,\"E\":2,\"T\":16,\"F\":6,\"X\":15,\"Q\":14,\"Z\":5,\"R\":3}",
        "seeker_silvia_equations_open_editors": "{\"chasm-xe\":false,\"playa-qe\":false,\"stele-oz\":false,\"stele-rf\":false}",
        "seeker_silvia_equations_resolved": "{\"lat-min\":true,\"zod-diff\":true,\"playa-qe\":true,\"lat-deg\":true,\"diff-kg\":true,\"lon-deg\":true,\"diff-pb\":true,\"lon-min\":true,\"diff-ve\":true,\"playa-ta\":true,\"lon-sec\":true,\"diff-tf\":true,\"falcon-pa\":true,\"chasm-xe\":true,\"stele-oz\":true,\"falcon-qz\":true,\"stele-rf\":true}",
        "seeker_silvia_inventory_relics": "[\"gilded_feather\",\"order_wax_seal\",\"surveyor_compass\",\"seal_cairn_1\",\"water_skins\",\"falcon_weight\",\"lamp_oil\",\"red_cord\"]",
        "seeker_silvia_midnight_completed": "true",
        "seeker_silvia_satchel_expedition_item": "{\"id\":\"surveyor_compass\",\"name\":\"1998 Brass Surveyor's Compass\",\"icon\":\"🧭\",\"desc\":\"Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail.\"}"
        };
        var cloudOn = !!(window.EclipseCloud && window.EclipseCloud.state && window.EclipseCloud.state.enabled);
        if (seeker === 'silvia' && cloudOn) return;   // the archive restores her real, latest journey
        // Her own device already holds this journey, or a later one: only her device ever wrote this march stamp
        if (seeker === 'silvia' && store.getItem('order_monolith_march_start') === SAVE.order_monolith_march_start) {
          store.setItem(FLAG, 'done');
          return;
        }
        var old = [], i, k;
        for (i = 0; i < store.length; i++) { k = store.key(i); if (k && !isDeviceKey(k)) old.push(k); }
        old.forEach(function (key) { store.removeItem(key); });
        Object.keys(SAVE).forEach(function (key) { store.setItem(key, SAVE[key]); });
        store.setItem(FLAG, 'done');
      } catch (e) {}
    })();
