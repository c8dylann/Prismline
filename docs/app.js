// Prismline site: lightbox + the latest release (download link, version, size) from GitHub.
(function () {
  'use strict';

  var RELEASE_API = 'https://api.github.com/repos/c8dylann/Prismline/releases/latest';

  // ---- latest release (falls back silently to the link and text already in the page) ----
  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  }

  function setAll(sel, fn) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) fn(els[i]);
  }

  function applyRelease(rel) {
    var zip = null;
    var assets = (rel && rel.assets) || [];
    for (var i = 0; i < assets.length; i++) {
      if (/\.zip$/i.test(assets[i].name)) { zip = assets[i]; break; }
    }
    if (!zip) return;

    // "Prismline v3.0.4b" -> "v3.0.4b"; if the release has no usable name, take it from the file name
    var version = (rel.name || '').replace(/^\s*prismline[\s._-]*/i, '').trim() ||
                  zip.name.replace(/^prismline[._-]*/i, '').replace(/\.zip$/i, '');

    setAll('[data-download]', function (a) { a.href = zip.browser_download_url; });
    setAll('[data-file]', function (e) { e.textContent = zip.name; });
    setAll('[data-size]', function (e) { e.textContent = fmtSize(zip.size); });
    if (version) setAll('[data-version]', function (e) { e.textContent = version; });
    setAll('[data-live]', function (e) { e.hidden = false; });
  }

  try {
    if (window.fetch) {
      fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(applyRelease)
        .catch(function () { /* offline, blocked or rate limited: keep the static link and text */ });
    }
  } catch (e) { /* ignore */ }

  // ---- lightbox ----
  var box = document.getElementById('lightbox');
  var boxImg = box && box.querySelector('img');
  var boxCap = box && box.querySelector('p');

  function openBox(src, alt, cap) {
    if (!box) return;
    boxImg.src = src;
    boxImg.alt = alt || '';
    boxCap.textContent = cap || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeBox() {
    if (!box) return;
    box.classList.remove('open');
    boxImg.removeAttribute('src');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (ev) {
    var shot = ev.target.closest && ev.target.closest('[data-zoom]');
    if (shot) {
      var img = shot.querySelector('img');
      var cap = shot.querySelector('figcaption');
      openBox(shot.getAttribute('data-zoom') || img.src, img.alt, cap ? cap.textContent : '');
      return;
    }
    if (box && box.classList.contains('open')) closeBox();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeBox();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target && ev.target.hasAttribute && ev.target.hasAttribute('data-zoom')) {
      ev.preventDefault();
      ev.target.click();
    }
  });
})();
