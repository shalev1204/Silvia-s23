"""One-off (18 Nov 2026): the satchel's relic texts become short game-style descriptions.
lore: what it is and why it matters, 1-2 sentences; inscription: one line on the reverse; hermesNote: one sentence in his voice.
Origins lose the 'Oct 2026' stamp (the Wire runs in real time). Run from the repo root."""
import re, json

P = 'web/hub/js/hub-core.js'
s = open(P).read()

LORE = {
    'gilded_feather': "The last carrier pigeon of the Order flew it over the Alps with your journal. Its tip was dipped in the gold of the observatory.",
    'order_wax_seal': "It held your journal shut on its way to you: a half-lit sun inside the degree ring of the Astrolabe.",
    'flint_tinder': "Hidden under a boulder in the wash in 1998. Twenty-eight years later, its spark kept Hermes alive through the red storm.",
    'surveyor_compass': "Left in a stone niche in 1998. Set to the 112° E stamped on his copper plate, it led Hermes blind through the storm to Watchtower VI.",
    'spyglass_lens': "Dropped by the raiders' scouts on the bluff above the gorge. The glass is ground for one purpose: to follow the Grand Eclipse.",
    'tuning_pebble': "Wedged in the Left pillar of Cairn IV, it made the wind sing Aurelia's code. The bronze reeds are ancient. The pebble is not.",
    'signal_mirror': "It lay under the Seal of Cairn V, polished by a recent hand. With it Hermes flashed Aurelia's code at Tower II, and the light answered.",
    'gilded_star': "Painted by Aurelia while Hermes told her of the road: lapis, then gold, then a touch of white on every point. “For the navigator who brought him back.”",
    'servant_key': "The Servant pressed it, still warm, into Hermes's hand. It opens the inner stair down to the Oracle.",
    'seal_cairn_1': "Buried under the third stone of Cairn I, in the dry riverbed. The first of the five keys of the Great Circuit.",
    'seal_cairn_2': "It slid out of Cairn II once the sun had walked its day across the ridge and woken the four shadows. The second key.",
    'seal_cairn_3': "The spiral on its face is the true road of the labyrinth, read from the outside in. Hermes lifted it in the dark, with the raiders' torches near.",
    'founders_lamp': "The founders left lamps in their labyrinth for whoever came after. This one still held oil, thick as honey.",
    'raiders_survey': "Dropped by the BC Ashes at the Southern Mouth: the founders' survey, all five cairns ringed in soot. It explains how they knew. Not who copied it for them.",
    'seal_cairn_4': "The pillars of Cairn IV turn the night wind into a song, and this seal is the song written down. The fourth key.",
    'seal_cairn_5': "The last of the five, from under the Solar Altar. With it the Cairns are answered, and the Oracle's door can be asked to open.",
    'mirror_fragment_1': "Hidden behind the wall of masks, for the one who named the true mask. Its edge is clean: someone looks after it. One of nine.",
    'mirror_fragment_2': "The city that fell on the dark wall of the Camera Obscura is still faintly in the glass, like a candle flame left on the eye.",
    'mirror_fragment_3': "It answered the tune played backwards. The gallery gives back every word; the mirror, every face. Three of nine.",
    'water_skins': "The four wells were a mirage. Under the stone falcon a cleft wept cold water, and Hermes filled all four. They make the Great Erg crossable.",
    'falcon_weight': "The last brass piece of the nomads' water clock, left in the cleft when the water sank. A falcon with folded wings and a notch on its crown.",
    'red_cord': "Untied from the Servant's staff and knotted round Hermes's wrist. “Red for the road. It will not stop the sun; it will remind you who waits.”",
    'servant_coin': "Given only to the one who caught the old man's lie. The keepers must lie once to every visitor, and almost nobody notices.",
    'ibis_figure': "The Ibis slab at the Monolith was never a trap: it was a lock, and this was its key. Its twin is a falcon.",
    'statue_seal': "A sixth seal, paid to the two stone keepers with a falcon and an ibis of brass. It opens nothing new. It honours the ones who paid attention.",
}
LAMP_HALF = "Hermes broke the seal on the dunes to light a stranger's way to the well. Half is left, and the stranger paid in secrets: the morning shadow of the Monolith."
LAMP_FULL = "Found beside the falcon weight, nearly full. The only light for the night roads: feed a fire with it, wager it, or share it in the dark."

INSCR = {
    'gilded_feather': 'Gold leaf from the terrace of the Alpine Observatory.',
    'order_wax_seal': 'The ◐ of the Order, ringed by 24 marks.',
    'flint_tinder': 'Stamped on the striker: 1998 BENCHMARK CACHE.',
    'surveyor_compass': 'Inside the lid: “WADI AL-HAJAR · OCT 1998 · 112° E TO WATCHTOWER VI”',
    'spyglass_lens': 'A scorched brass ring, a smudge of ash along the edge.',
    'seal_cairn_1': 'Four river stones over running water · I',
    'water_skins': 'Goatskin, rawhide, brass spouts. Still cold to the touch.',
    'falcon_weight': 'Tally marks on the base, and an empty place for a twin.',
    'lamp_oil': 'Meridian lines and star arcs around a brass belly.',
    'red_cord': 'Twelve knots, a staff apart · brass beads marked with sun and moon.',
    'servant_coin': 'Half light, half shadow, and a keyhole at the heart.',
    'ibis_figure': 'A beak like a scribe’s reed pen · three water ripples on the base.',
    'statue_seal': 'Falcon and ibis face to face under a sun.',
    'seal_cairn_2': 'A monolith and its noon shadow under a bronze sun · II',
    'seal_cairn_3': 'A square spiral to a single dot · 348° NNW on the back.',
    'tuning_pebble': 'Lapis blue under beeswax, a gold star of eight points · ··· ——',
    'seal_cairn_4': 'An arch, two singing pillars, three arcs of sound · IV',
    'signal_mirror': 'A rim of sun rays, the ◐ of the Order at the top.',
    'seal_cairn_5': 'An arch, and eight rays meeting beneath it · V',
    'servant_key': 'A bow cut in a grid of five squares by five.',
    'gilded_star': 'Gold leaf on lapis, a breath of white on every point.',
    'mirror_fragment_1': 'Scratched on the back: a half-lit face.',
    'mirror_fragment_2': 'The ghost of a city of slender towers, upside down.',
    'mirror_fragment_3': 'Curved lines along the edge · it hums when sung to backwards.',
}

def js(t):
    return json.dumps(t, ensure_ascii=False)

NOTE = {
    'gilded_feather': "() => localStorage.getItem('order_masks_gate_completed') === 'true'\n            ? " + js("The tiny feather on the Living Mirror of Tower III wears the same gold. Someone has been to the Alps, Silvia.") + "\n            : " + js("My last pigeon crossed the Alps in a gale for you. Keep it close: gold remembers where it was laid."),
    'order_wax_seal': "() => " + js("The Order never writes twice, Silvia. I broke the die after this seal, so no hand but yours could open that journal."),
    'surveyor_compass': "() => localStorage.getItem('order_sandstone_labyrinth_completed') === 'true'\n            ? " + js("Twenty-eight years in a rock shelf, and not a hair of rust. It found me the watchtower, then the twin plate under Cairn III.") + "\n            : " + js("I still feel that cold copper plate under my fingers. Keep the needle steady: 112° East brings us home."),
    'flint_tinder': "() => " + js("That spark saved my fingers in Watchtower VI while the storm tore at the shutters."),
    'spyglass_lens': "() => " + js("Whoever ground this glass knows the sky as well as I do. Careful: the edge is still sharp."),
    'seal_cairn_1': "() => localStorage.getItem('order_gates_scene_completed') === 'true'\n            ? " + js("At the gates of Tower II the Servant set it in the first socket of the arch. Four more were waiting.") + "\n            : " + js("I found it under the silt at dawn. My hand knew those stacked stones before my memory did."),
    'water_skins': "() => localStorage.getItem('order_sun_monolith_completed') === 'true'\n            ? " + js("Half spent on the dunes, and every drop left still tastes of mountain rock.") + "\n            : " + js("Four full skins: all the wealth we carry across the Great Erg."),
    'falcon_weight': "() => {\n            const owned = getOwnedRelicIds();\n            if (owned.includes('statue_seal')) return " + js("So the falcon and the ibis were the keys of the stone keepers all along.") + ";\n            if (owned.includes('ibis_figure')) return " + js("Its notches match the Brass Ibis. Both birds belong to the statues of Tower II!") + ";\n            return " + js("Heavier than brass ought to be. It looks as if it waits for a second bird.") + ";\n          }",
    'lamp_oil': "() => {\n            const shared = (window.GatesRoad && window.GatesRoad.flags && window.GatesRoad.flags().nightOil === 'shared') ||\n              (function () { try { return JSON.parse(localStorage.getItem('order_gates_flags') || '{}').nightOil === 'shared'; } catch (e) { return false; } })();\n            return shared\n              ? " + js("Half a flask, given at 02:40 to a man walking blind. His shadow clue repaid it twice.") + "\n              : " + js("Nearly full. On a moonless road, every drop is an hour of sight.") + ";\n          }",
    'red_cord': "() => " + js("“Red for the road,” he said. Twelve knots a staff apart: the best measuring line in the satchel."),
    'servant_coin': "() => " + js("If fire ever rises over his tower, show this coin to whoever finds the Servant."),
    'ibis_figure': "() => getOwnedRelicIds().includes('statue_seal')\n            ? " + js("Ibis and falcon together: the stone keepers' riddle, answered.") + "\n            : " + js("Both desert birds in one satchel. I wonder what the two stone keepers will say."),
    'statue_seal': "() => " + js("The five cairns open the road. This one is for the ones who noticed the small things on the steps."),
    'seal_cairn_2': "() => localStorage.getItem('order_sun_monolith_completed') === 'true'\n            ? " + js("Iron scrapes on the lid: the BC Ashes tried to force it without waking the shadows, and failed.") + "\n            : " + js("Cut to fit the second socket of the arch of Tower II."),
    'seal_cairn_3': "() => " + js("It lay under my own copper plate of 1998, and I never knew. The founders aimed it at 348° long before me."),
    'tuning_pebble': "() => localStorage.getItem('order_oracle_horizon_completed') === 'true'\n            ? " + js("Aurelia painted it with her own brush and tuned Cairn IV to sing our code. She was ahead of me all along.") + "\n            : " + js("The paint is fresh, Silvia. Only one hand I ever knew ground lapis like this."),
    'seal_cairn_4': "() => " + js("Won by listening. SUN, ECHO, STONE: that is how the Order measures the world."),
    'signal_mirror': "() => " + js("Someone polished it for me, Silvia. And someone on Tower II knew our code."),
    'seal_cairn_5': "() => " + js("The fifth seal, Silvia. With all five, the Oracle's doors cannot stay shut."),
    'servant_key': "() => " + js("Still warm from the fire at the well. Only someone who can read its grid deserves the door it opens."),
    'gilded_star': "() => " + js("She painted the tips holding her breath. Keep it beside your compass, Silvia: it is yours."),
    'mirror_fragment_1': "() => " + js("Not a speck of tarnish after all these years. This mirror tells the truth only to those who doubt the gold."),
    'mirror_fragment_2': "() => " + js("Tilt it to the candle and the city is still there, smoke and all."),
    'mirror_fragment_3': "() => " + js("Three of nine, Silvia. Each whisper brings the Mirror of Tower III closer to waking."),
}

cat0 = s.index('const SATCHEL_RELICS = {')
cat1 = s.index('function getSatchelExpeditionItem()')
ex0 = s.index('const RELIC_EXTRAS = {')
ex1 = s.index('\n      };', ex0)
cat, ext = s[cat0:cat1], s[ex0:ex1]

def block(text, key):
    m = re.search(r'\n        ' + key + r': \{\n(.*?)\n        \}', text, re.S)
    assert m, key
    return m

for k, v in LORE.items():
    m = block(cat, k)
    body = m.group(1)
    nb, n = re.subn(r'lore: ".*?"\n', lambda _: 'lore: ' + js(v) + '\n', body + '\n', count=1, flags=re.S)
    assert n == 1, k
    cat = cat[:m.start(1)] + nb[:-1] + cat[m.end(1):]

for pre, new in (('lore: "Hermes uncorked the wax seal', LAMP_HALF), ('lore: "Buried in the cleft beside the falcon weight', LAMP_FULL)):
    i = cat.index(pre); j = cat.index('"\n', i + 6)
    cat = cat[:i] + 'lore: ' + js(new) + cat[j + 1:]

cat = cat.replace(' · Oct 2026"', '"')

for k in INSCR:
    m = block(ext, k)
    body = m.group(1)
    head = re.match(r"(.*?)\n          inscription: ", body, re.S)
    assert head, k
    nb = head.group(1) + '\n          inscription: ' + js(INSCR[k]) + ',\n          hermesNote: ' + NOTE[k]
    ext = ext[:m.start(1)] + nb + ext[m.end(1):]

s = s[:cat0] + cat + s[cat1:ex0] + ext + s[ex1:]
open(P, 'w').write(s)
print('done', len(LORE) + 2, 'lore,', len(INSCR), 'reverse/notes')
