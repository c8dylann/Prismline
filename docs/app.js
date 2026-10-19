// Prismline site: lightbox + live version info from the update manifest.
(function () {
  'use strict';

  var MANIFEST_URL = 'https://raw.githubusercontent.com/closeocean/Prismline/main/manifest.txt';
  var LOADER_NAME = 'PrismlineLoader.exe';

  // ---- live version / size (falls back silently to the static text in the page) ----
  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  }

  function setAll(sel, text) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].textContent = text;
  }

  function applyManifest(text) {
    var version = null, size = null;
    text.split(/\r?\n/).forEach(function (line) {
      var m = line.match(/^version\s+(.+)$/);
      if (m) version = m[1].trim();
      var f = line.match(/^file\s+[0-9a-fA-F]{64}\s+(\d+)\s+(.+)$/);
      if (f && f[2].trim() === LOADER_NAME) size = parseInt(f[1], 10);
    });
    if (version) {
      setAll('[data-version]', version);
      var live = document.querySelectorAll('[data-live]');
      for (var i = 0; i < live.length; i++) live[i].hidden = false;
    }
    if (size) setAll('[data-size]', fmtSize(size));
  }

  try {
    if (window.fetch) {
      fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(applyManifest)
        .catch(function () { /* offline or blocked: keep the static text */ });
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
