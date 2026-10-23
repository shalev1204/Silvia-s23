// The Hub without a signal (docs/IDEAS_BACKLOG.md #21). Registered by hub/js/offline.js on the published site.
// - Installing keeps the Hub (its page, scripts, styles and pictures: PRECACHE) in one cache per version.
// - The constellation games and the fonts are kept the first time they are opened, and refreshed in the
//   background whenever there is a signal.
// - A new version installs in the background and waits; offline.js lets it in the next time the Hub is
//   opened, so a deploy never reloads the page in the middle of a puzzle.
// - The cloud save (Supabase) and anything else outside the site are never touched.
'use strict';
// <offline-list> written by scripts/web/offline_list.py; do not edit by hand
var VERSION = '673825f1fc52';  // 150 files, 31.1 MB
var PRECACHE = [
  "./",
  "./assets/branding/favicon-192.png",
  "./assets/branding/favicon-32.png",
  "./assets/branding/logo-the-eclipse-order.png",
  "./assets/branding/logo-the-eclipse-order.svg",
  "./assets/cartographer_distant_light_elder.jpg",
  "./assets/chat/sketch_cairn_one.webp",
  "./assets/chat/sketch_chasm_mouth.webp",
  "./assets/chat/sketch_dry_wash.webp",
  "./assets/cliffside_workshop_bg.jpg",
  "./assets/css/desert-map-3d.css",
  "./assets/emails/email-01-parchment-full.webp",
  "./assets/emails/email-01-parchment.webp",
  "./assets/emails/email-02-fragment-1-full.webp",
  "./assets/emails/email-02-fragment-1.webp",
  "./assets/emails/email-03-zodiac-outpost-full.webp",
  "./assets/emails/email-03-zodiac-outpost.webp",
  "./assets/items/item_brass_compass.png",
  "./assets/items/item_flint_juniper.jpg",
  "./assets/items/item_flint_tinder.png",
  "./assets/items/item_gilded_feather.jpg",
  "./assets/items/item_gilded_feather.png",
  "./assets/items/item_gilded_star.webp",
  "./assets/items/item_order_wax_seal.jpg",
  "./assets/items/item_order_wax_seal.png",
  "./assets/items/item_scorched_lens.jpg",
  "./assets/items/item_servant_key.webp",
  "./assets/items/item_signal_mirror.webp",
  "./assets/items/item_spyglass_lens.png",
  "./assets/items/item_surveyor_compass.jpg",
  "./assets/items/item_tuning_pebble.webp",
  "./assets/js/camera-city-data.js",
  "./assets/js/desert-map-3d.js",
  "./assets/js/stage-mirror-data.js",
  "./assets/js/stage-mirror.js",
  "./assets/js/whisper-gallery-data.js",
  "./assets/maps/desert_quadrant_1_nw.webp",
  "./assets/maps/desert_quadrant_2_ne.webp",
  "./assets/maps/desert_quadrant_3_sw.webp",
  "./assets/maps/desert_quadrant_4_se.webp",
  "./assets/maps/desert_relief_data.js",
  "./assets/maps/desert_relief_height.png",
  "./assets/maps/desert_relief_ink.webp",
  "./assets/maps/grand_desert_map_overview.webp",
  "./assets/maps/grand_desert_map_spread1.webp",
  "./assets/maps/grand_desert_map_spread2.webp",
  "./assets/radio_station_bg.jpg",
  "./assets/silvia_navigator_avatar.jpg",
  "./assets/thumbnails/cairn_iv_preview.webp",
  "./assets/thumbnails/camera_obscura_preview.webp",
  "./assets/thumbnails/celestial_flower_preview.webp",
  "./assets/thumbnails/chronicle_station8_locked.webp",
  "./assets/thumbnails/desert_frontier_preview.webp",
  "./assets/thumbnails/desert_lexicon_preview.webp",
  "./assets/thumbnails/masks_gate_preview.webp",
  "./assets/thumbnails/midnight_calibration_preview.webp",
  "./assets/thumbnails/midnight_transit_preview.webp",
  "./assets/thumbnails/oasis_clepsydra_preview.webp",
  "./assets/thumbnails/oracle_horizon_preview.webp",
  "./assets/thumbnails/planisphere_preview.webp",
  "./assets/thumbnails/polybius_stele_preview.webp",
  "./assets/thumbnails/radio_cover.webp",
  "./assets/thumbnails/salt_playa_preview.webp",
  "./assets/thumbnails/sandstone_labyrinth_preview.webp",
  "./assets/thumbnails/severed_sky.webp",
  "./assets/thumbnails/solstice_arch_preview.webp",
  "./assets/thumbnails/stage_mirror_preview.webp",
  "./assets/thumbnails/sun_monolith_preview.webp",
  "./assets/thumbnails/transceiver_offline_preview.webp",
  "./assets/thumbnails/whispering_chasm_preview.webp",
  "./assets/thumbnails/whispering_gallery_preview.webp",
  "./assets/thumbnails/zodiac_journal_preview.webp",
  "./assets/vendor/three.min.js",
  "./constellation/celestial-cipher/assets/distant-light-precipice.jpg",
  "./constellation/midnight-calibration/logo-path-constellation.png",
  "./constellation/midnight-calibration/video/tempest_poster.jpg",
  "./favicon.ico",
  "./favicon.svg",
  "./hub/css/a11y.css",
  "./hub/css/ambience.css",
  "./hub/css/aurelia-letters.css",
  "./hub/css/base.css",
  "./hub/css/camp-messenger.css",
  "./hub/css/desert-map.css",
  "./hub/css/field-journal.css",
  "./hub/css/gate-profiles.css",
  "./hub/css/hint-ladder.css",
  "./hub/css/layout.css",
  "./hub/css/living-mirror.css",
  "./hub/css/path-themes.css",
  "./hub/css/previously.css",
  "./hub/css/sandstorm.css",
  "./hub/css/stations/s10-chasm-walk.css",
  "./hub/css/stations/s10-whispering-chasm.css",
  "./hub/css/stations/s11-salt-playa.css",
  "./hub/css/stations/s12-desert-lexicon.css",
  "./hub/css/stations/s13-oasis-clepsydra.css",
  "./hub/css/stations/s14-sun-monolith.css",
  "./hub/css/stations/s15-sandstone-labyrinth.css",
  "./hub/css/stations/s16-cairn-iv.css",
  "./hub/css/stations/s17-solstice-arch.css",
  "./hub/css/stations/s18-polybius-stele.css",
  "./hub/css/stations/s19-oracle-horizon.css",
  "./hub/css/stations/s20-masks-gate.css",
  "./hub/css/stations/s21-camera-obscura.css",
  "./hub/css/stations/s22-whispering-gallery.css",
  "./hub/css/trail-overlays.css",
  "./hub/css/view-archives.css",
  "./hub/css/view-chronicles.css",
  "./hub/css/view-cipher.css",
  "./hub/css/view-trail.css",
  "./hub/css/view-transmissions.css",
  "./hub/css/view-workshop.css",
  "./hub/css/workshop-chat.css",
  "./hub/js/a11y.js",
  "./hub/js/ambience.js",
  "./hub/js/aurelia-letters.js",
  "./hub/js/cloud-config.js",
  "./hub/js/cloud-save.js",
  "./hub/js/dawn-map-layer.js",
  "./hub/js/field-journal.js",
  "./hub/js/hide-solve-shortcuts.js",
  "./hub/js/hint-ladder.js",
  "./hub/js/hub-core.js",
  "./hub/js/journey-profile.js",
  "./hub/js/mirror-speaker.js",
  "./hub/js/offline.js",
  "./hub/js/previously.js",
  "./hub/js/profiles.js",
  "./hub/js/sandstorm-lockdown.js",
  "./hub/js/satchel-and-cairn-one.js",
  "./hub/js/sheet-seals.js",
  "./hub/js/stage-pause.js",
  "./hub/js/stations/s10-desert-map-and-chasm.js",
  "./hub/js/stations/s10-whispering-chasm.js",
  "./hub/js/stations/s11-salt-playa.js",
  "./hub/js/stations/s12-desert-lexicon.js",
  "./hub/js/stations/s13-oasis-clepsydra.js",
  "./hub/js/stations/s14-sun-monolith.js",
  "./hub/js/stations/s15-sandstone-labyrinth.js",
  "./hub/js/stations/s16-cairn-iv.js",
  "./hub/js/stations/s17-solstice-arch.js",
  "./hub/js/stations/s18-polybius-stele.js",
  "./hub/js/stations/s19-oracle-horizon.js",
  "./hub/js/stations/s20-masks-gate.js",
  "./hub/js/stations/s21-camera-obscura.js",
  "./hub/js/stations/s22-whispering-gallery.js",
  "./hub/js/tester-panel.js",
  "./shared/navigator.css",
  "./shared/navigator.js"
];
// </offline-list>
var HUB = 'eclipse-hub-' + VERSION;
var VISITED = 'eclipse-visited';
var FONTS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

// Pages of the site are kept without their query (the Hub reads it, the server does not). The published
// site answers ".../index.html" with a redirect to ".../": both names find the same page
function aliases(url) {
  var u = new URL(url);
  u.hash = '';
  if (u.origin !== self.location.origin) return [u.href];   // a font: its address names it, query and all
  u.search = '';
  var list = [u.href];
  if (/\/index\.html$/.test(u.pathname)) list.push(u.href.replace(/index\.html$/, ''));
  else if (/\/$/.test(u.pathname)) list.push(u.href + 'index.html');
  return list;
}
// A redirected answer cannot be given back to a page: keep its body under the address that was asked
function clean(res) {
  if (!res.redirected) return Promise.resolve(res);
  return res.blob().then(function (body) { return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers }); });
}
function lookup(name, url) {
  return caches.open(name).then(function (cache) {
    var list = aliases(url), i = 0;
    function next() {
      if (i >= list.length) return undefined;
      return cache.match(list[i++]).then(function (hit) { return hit || next(); });
    }
    return next();
  });
}
// Audio and video ask for a slice (Range); a kept file answers with that slice
function slice(request, res) {
  var m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  if (!m) return res;
  return res.blob().then(function (blob) {
    var start = m[1] ? parseInt(m[1], 10) : Math.max(0, blob.size - parseInt(m[2], 10));
    var end = m[1] && m[2] ? Math.min(parseInt(m[2], 10), blob.size - 1) : blob.size - 1;
    var headers = new Headers(res.headers);
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + blob.size);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(blob.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers: headers });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(HUB).then(function (cache) {
    return Promise.all(PRECACHE.map(function (url) {
      // 'no-cache' asks the server whether each file changed: a new version downloads only what did
      return fetch(new Request(url, { cache: 'no-cache' })).then(function (res) {
        if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
        return clean(res).then(function (body) { return cache.put(url, body); });
      });
    }));
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (n) { return n.indexOf('eclipse-hub-') === 0 && n !== HUB; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (event) {
  if (event.data === 'eclipse-sw-update') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin && FONTS.indexOf(url.origin) < 0) return;   // the cloud save goes straight out
  var ranged = req.headers.has('range');
  event.respondWith(lookup(HUB, req.url).then(function (hub) {
    if (hub) return ranged ? slice(req, hub) : hub;
    return lookup(VISITED, req.url).then(function (kept) {
      if (ranged) return kept ? slice(req, kept) : fetch(req);
      // a game or a font: the kept copy answers at once and the signal, when there is one, refreshes it
      var fresh = fetch(req).then(function (res) {
        if (res.ok || res.type === 'opaque') {
          var copy = res.clone();
          event.waitUntil(clean(copy).then(function (body) {
            return caches.open(VISITED).then(function (c) { return c.put(aliases(req.url)[0], body); });
          }).catch(function () {}));
        }
        return res;
      });
      if (!kept) return fresh;
      event.waitUntil(fresh.catch(function () {}));
      return kept;
    });
  }));
});
