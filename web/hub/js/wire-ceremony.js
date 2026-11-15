// The Field Wire: the ceremony that closes a chapter and opens the next.
// When the last message of a chapter has been read, the chat offers "Close the chapter". That plays this scene: the book of the chapter
// closes (its title, a wax seal that is stamped, the epilogue told line by line, what was brought back and what she chose), and then
// the next chapter opens (a numeral in light, its title and place, a prologue). Then the conversation goes on.
// hub-core.js owns the chapter list and the saved state; this file owns the narrative and the animation.
//   window.WireCeremony.has(step)            does the chapter that starts at `step` have a ceremony?
//   window.WireCeremony.open(step, ctx, cb)  ctx = { picks: [text], relics: [id] }; cb runs when she enters the new chapter
(function () {
  'use strict';

  // Keyed by the first wire step of the NEW chapter. Written like the novel the expedition is: short, concrete, a little solemn.
  const SCENES = {
    25: {
      close: {
        num: 'II', title: 'The Five Cairns', place: 'The Seals of the Sun',
        epilogue: [
          'Four cairns woke under Hermes’s hands: the sun-stone that told the noon, the labyrinth that kept its road in the dark, the pillars that sang over the bridge, the arch that caught the midsummer ray.',
          'Each gave up a seal, and each seal weighed more than bronze. Together with the first they made a key the desert had held back since 1998.',
          'On the last night a light answered from Tower II. Then the smoke rose. The chapter of the stones is over, and the chapter of the tower is about to begin.'
        ],
        prize: 'The Seals of Cairns II, III, IV and V'
      },
      open: {
        num: 'III', title: 'Tower II in Flames', place: 'Tower II · The Sandstone Sanctuary',
        prologue: [
          'At noon, under the Arch, the smoke stood on the horizon like a pillar of grey sand. It was coming from Tower II.',
          'Hermes carries five seals and a mirror that learned to answer a tower. He also carries a fear he will not say aloud: that he is late again.',
          'Six hours of road lie between the Arch and the gates. Behind the gates an old servant keeps a lamp, and under the servant someone has waited a very long time.'
        ]
      }
    },
    33: {
      close: {
        num: 'III', title: 'Tower II in Flames', place: 'The Oracle of Tower II',
        epilogue: [
          'The fire gave way to a stone grid and the key that fitted it, and the Servant was found alive by the well.',
          'Then came the inner stair, the five seals laid in their places, and a voice the desert had not heard since 1971.',
          'The Oracle was never a stranger or a ghost. She was Aurelia, and she had waited for the light as long as Hermes had walked away from it.',
          'The first truth was spoken: the WHEN. Two secrets still sleep, and the road to the next tower leaves at dawn, with the two of them walking side by side.'
        ],
        prize: 'The first truth: the WHEN'
      },
      open: {
        num: 'IV', title: 'The Mirror Sanctuary', place: 'Tower III · The Stage Tower',
        prologue: [
          'The desert ends on a plateau of wind, and on the plateau stands a tower made of glass, shadow and echo.',
          'It is guarded by someone who is never seen, only reflected. Hermes has promised himself to look at the glass and never at the face.',
          'Nine pieces of a broken mirror lie scattered through its rooms, and each room opens only for the one who has read the room before it.',
          'The crossing takes eighteen hours and nobody sleeps. This time Aurelia walks beside him, and the navigator walks on the wire.'
        ]
      }
    },
    41: {
      close: {
        num: 'IV', title: 'The Mirror Sanctuary', place: 'The Gate of Masks · The Camera Obscura',
        epilogue: [
          'The wall of masks opened to a single word, and behind it the first piece of the mirror lay waiting in the warm dark.',
          'In the Camera Obscura a whole city drew itself on the wall in light, upside down and silent, and the second piece came out of its shadow.',
          'Two fragments are home. Hermes has begun to understand that the mirror is not a thing to be mended, but someone to be answered.'
        ],
        prize: 'Fragments I and II of the mirror'
      },
      open: {
        num: 'V', title: 'The Whispering Gallery', place: 'Tower III · Below the Stage',
        prologue: [
          'The second stair is narrow and goes down. Halfway, the sounds of the tower begin to come back, a heartbeat late.',
          'In the Whispering Gallery nothing that is said is lost, and nothing returns the same. Words arrive as their own reflections.',
          'Hermes is afraid of one thing here: that he will hear his own voice say what he never dared to say. Be quiet, listen, and answer.'
        ]
      }
    }
  };

  const reduce = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const fast = () => !!window.__wireFast;
  let root = null, running = false;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function sfxCall(name) { try { const s = window.sfx; if (s && typeof s[name] === 'function') s[name](); } catch (e) {} }

  const SEAL_SVG = (num) => '<svg class="wcer-seal-svg" viewBox="0 0 200 200" aria-hidden="true">' +
    '<defs><radialGradient id="wcerWax" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#e8b07a"/><stop offset="0.5" stop-color="#b3592c"/><stop offset="1" stop-color="#6b2a12"/></radialGradient></defs>' +
    '<path d="M100 8c20 2 28 14 46 16 14 2 28 12 30 28 2 16-6 24-4 40 2 16 10 26 4 42-6 14-20 20-34 24-14 4-22 16-42 16s-30-10-44-16c-16-6-26-14-30-30-4-16 6-28 4-44-2-14-10-24-2-38 8-14 22-18 36-22C80 20 86 6 100 8z" fill="url(#wcerWax)" stroke="#4a1c0a" stroke-width="3"/>' +
    '<circle cx="100" cy="100" r="62" fill="none" stroke="#f3cf9d" stroke-opacity="0.75" stroke-width="3"/>' +
    '<circle cx="100" cy="100" r="54" fill="none" stroke="#f3cf9d" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="2 6"/>' +
    '<path d="M100 46 A54 54 0 0 1 100 154 Z" fill="#3a1408" fill-opacity="0.38"/>' +
    '<text x="100" y="116" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="46" font-weight="700" fill="#f8dcae">' + num + '</text></svg>';

  function build() {
    if (root) return root;
    root = el('div', 'wcer');
    root.id = 'wire-ceremony';
    root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Chapter ceremony');
    root.innerHTML =
      '<div class="wcer-bg"></div><div class="wcer-stars"></div><div class="wcer-vignette"></div>' +
      '<section class="wcer-scene wcer-close" aria-live="polite">' +
        '<div class="wcer-kicker"></div><h2 class="wcer-title"></h2><div class="wcer-rule"></div>' +
        '<div class="wcer-seal"></div><div class="wcer-lines"></div>' +
        '<div class="wcer-prize"></div><div class="wcer-relics"></div><ul class="wcer-picks"></ul>' +
        '<button type="button" class="wcer-btn wcer-next"></button>' +
      '</section>' +
      '<section class="wcer-scene wcer-open" aria-live="polite">' +
        '<div class="wcer-rays"></div><div class="wcer-num"></div><h2 class="wcer-otitle"></h2><div class="wcer-place"></div><div class="wcer-prologue"></div>' +
        '<button type="button" class="wcer-btn wcer-go">Enter the chapter ➔</button>' +
      '</section>' +
      '<button type="button" class="wcer-skip">Skip the telling ➔</button>';
    document.body.appendChild(root);
    return root;
  }

  async function run(step, ctx, done) {
    const S = SCENES[step];
    if (!S || running) { if (typeof done === 'function') done(); return; }
    running = true;
    build();
    const q = (s) => root.querySelector(s);
    const close = q('.wcer-close'), open = q('.wcer-open'), skipBtn = q('.wcer-skip');
    let skipped = false;
    // a pause that a click on "Skip" (or the fast mode of the tests) cuts short
    const wait = (ms) => new Promise((res) => { if (skipped || fast() || reduce()) { res(); return; } const t = setTimeout(res, ms); root._cut = () => { clearTimeout(t); res(); }; });
    skipBtn.onclick = () => { skipped = true; if (root._cut) root._cut(); skipBtn.hidden = true; };

    // reset the scenes
    root.classList.remove('is-out', 'is-open-scene');
    close.className = 'wcer-scene wcer-close'; open.className = 'wcer-scene wcer-open';
    q('.wcer-kicker').textContent = 'CHAPTER ' + S.close.num + ' · COMPLETE';
    q('.wcer-title').textContent = S.close.title;
    q('.wcer-seal').innerHTML = SEAL_SVG(S.close.num);
    q('.wcer-lines').innerHTML = '';
    q('.wcer-prize').textContent = ''; q('.wcer-prize').className = 'wcer-prize';
    q('.wcer-relics').innerHTML = '';
    const picksEl = q('.wcer-picks'); picksEl.innerHTML = '';
    const next = q('.wcer-next'); next.textContent = 'Begin Chapter ' + S.open.num + ' ➔'; next.classList.remove('is-ready'); next.disabled = true;
    q('.wcer-num').textContent = S.open.num; q('.wcer-otitle').textContent = S.open.title; q('.wcer-place').textContent = S.open.place;
    q('.wcer-prologue').innerHTML = '';
    const go = q('.wcer-go'); go.classList.remove('is-ready'); go.disabled = true;
    skipBtn.hidden = false;
    root.hidden = false;
    document.body.classList.add('wcer-on');
    void root.offsetWidth;
    root.classList.add('is-on');

    // ---- the chapter closes
    await wait(700);
    close.classList.add('is-title');
    await wait(1100);
    close.classList.add('is-stamp'); sfxCall('playStoneLift');
    await wait(900); sfxCall('playCelestialChime');
    for (const line of S.close.epilogue) {
      const p = el('p', 'wcer-line', line); q('.wcer-lines').appendChild(p);
      void p.offsetWidth; p.classList.add('is-in'); sfxCall('playSoftTick');
      await wait(Math.min(3600, 900 + line.length * 22));
    }
    if (S.close.prize) { const pz = q('.wcer-prize'); pz.textContent = '✦ ' + S.close.prize; pz.classList.add('is-in'); await wait(700); }
    const relics = (ctx && ctx.relics) || [];
    for (const id of relics) {
      const r = window.SATCHEL_RELICS && window.SATCHEL_RELICS[id]; if (!r) continue;
      const im = el('img', 'wcer-relic'); im.src = r.image; im.alt = r.name; im.title = r.name; q('.wcer-relics').appendChild(im);
      void im.offsetWidth; im.classList.add('is-in'); sfxCall('playSoftTick'); await wait(320);
    }
    const picks = (ctx && ctx.picks) || [];
    if (picks.length) {
      const t = el('li', 'wcer-picks-title', 'Your choices in this chapter'); picksEl.appendChild(t);
      picks.forEach((txt) => picksEl.appendChild(el('li', 'wcer-pick', txt)));
      picksEl.classList.add('is-in'); await wait(600);
    }
    skipBtn.hidden = true;
    next.disabled = false; next.classList.add('is-ready'); next.focus({ preventScroll: true });
    await new Promise((res) => { next.onclick = () => { sfxCall('playMechanicalClick'); res(); }; if (fast()) res(); });

    // ---- the next chapter opens
    skipped = false; skipBtn.hidden = false;
    root.classList.add('is-open-scene');
    close.classList.add('is-gone');
    await wait(800);
    open.classList.add('is-light'); sfxCall('playCelestialChime');
    await wait(1100);
    open.classList.add('is-num');
    await wait(1000);
    open.classList.add('is-title');
    await wait(800);
    open.classList.add('is-place');
    await wait(700);
    for (const line of S.open.prologue) {
      const p = el('p', 'wcer-pline', line); q('.wcer-prologue').appendChild(p);
      void p.offsetWidth; p.classList.add('is-in'); sfxCall('playSoftTick');
      await wait(Math.min(3600, 900 + line.length * 22));
    }
    skipBtn.hidden = true;
    go.disabled = false; go.classList.add('is-ready'); go.focus({ preventScroll: true });
    await new Promise((res) => { go.onclick = () => { sfxCall('playMechanicalClick'); res(); }; if (fast()) res(); });

    root.classList.add('is-out');
    await wait(650);
    root.classList.remove('is-on', 'is-out', 'is-open-scene');
    root.hidden = true;
    document.body.classList.remove('wcer-on');
    running = false;
    if (typeof done === 'function') done();
  }

  window.WireCeremony = {
    has: (step) => !!SCENES[step],
    open: (step, ctx, done) => { run(step, ctx, done).catch((e) => { console.warn('wire ceremony', e); running = false; if (root) { root.hidden = true; document.body.classList.remove('wcer-on'); } if (typeof done === 'function') done(); }); },
    closing: (step) => SCENES[step] && SCENES[step].close,
    opening: (step) => SCENES[step] && SCENES[step].open
  };
})();
