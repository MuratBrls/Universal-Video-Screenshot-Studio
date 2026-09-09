/**
 * popup.js — Universal Video Frame Studio (Safari)
 */

(function () {
  'use strict';

  const _browser = (typeof browser !== 'undefined') ? browser : chrome;

  // ── Elements ──────────────────────────────────────────────────────────────
  const segPng        = document.getElementById('seg-png');
  const segJpg        = document.getElementById('seg-jpg');
  const segTif        = document.getElementById('seg-tif');
  const fmtDesc       = document.getElementById('fmt-desc');
  const qualityWrap   = document.getElementById('quality-wrap');
  const slider        = document.getElementById('jpg-quality');
  const qDisplay      = document.getElementById('q-display');

  const scale1080p    = document.getElementById('scale-1080p');
  const scale4k       = document.getElementById('scale-4k');
  const scaleNative   = document.getElementById('scale-native');
  const scaleDesc     = document.getElementById('scale-desc');

  const kbdBox        = document.getElementById('kbd-box');
  const recBtn        = document.getElementById('rec-btn');
  const shortcutHint  = document.getElementById('shortcut-hint');
  const overlaySwitch = document.getElementById('show-overlay-switch');
  const captureBtn    = document.getElementById('capture-now-btn');
  const videoInfo     = document.getElementById('video-info');
  const statusDot     = document.getElementById('status-dot');
  const statusLabel   = document.getElementById('status-label');
  const saveBtn       = document.getElementById('save-btn');

  let currentFormat = 'png';
  let currentScale  = '1080p';

  const fmtDescriptions = {
    png: 'Kayıpsız Display-P3 — 4K & HDR için önerilen',
    jpg: 'Sıkıştırılmış — küçük dosya boyutu',
    tif: 'Kayıpsız profesyonel TIFF formatı'
  };

  const scaleDescriptions = {
    '1080p': 'Düşük akışları bile en az 1080p Full HD netliğe yükseltir',
    '4k': 'Tüm video karelerini 4K Ultra HD çözünürlüğe süper-ölçekler',
    'native': 'Videonun orijinal ham akış çözünürlüğünü korur'
  };

  // ── Scale Selection ────────────────────────────────────────────────────────
  function setScale(sc, save = true) {
    currentScale = sc || '1080p';
    [scale1080p, scale4k, scaleNative].forEach(b => b.classList.remove('active'));
    const btn = { '1080p': scale1080p, '4k': scale4k, 'native': scaleNative }[currentScale];
    if (btn) btn.classList.add('active');
    scaleDesc.textContent = scaleDescriptions[currentScale] || '';
    if (save) _browser.storage.local.set({ scale: currentScale });
  }

  scale1080p.addEventListener('click', () => setScale('1080p'));
  scale4k.addEventListener('click', () => setScale('4k'));
  scaleNative.addEventListener('click', () => setScale('native'));

  // ── Load Settings ──────────────────────────────────────────────────────────
  _browser.storage.local.get(['format', 'jpgQuality', 'shortcutKey', 'showOverlay', 'scale'], (d) => {
    currentFormat = d.format || 'png';
    currentScale  = d.scale  || '1080p';
    const quality = d.jpgQuality !== undefined ? d.jpgQuality : 100;
    const key = (d.shortcutKey || 'p').toUpperCase();
    const showOverlay = d.showOverlay !== undefined ? d.showOverlay : true;

    setFormat(currentFormat, false);
    setScale(currentScale, false);
    slider.value = quality;
    qDisplay.textContent = quality;
    updateSlider(quality);
    kbdBox.textContent = key;
    shortcutHint.textContent = `${key} tuşuna bas → aktif videoyu yakala`;
    overlaySwitch.checked = showOverlay;
  });

  // ── Check Active Tab Video Status ──────────────────────────────────────────
  _browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) {
      statusLabel.textContent = 'Bağlantı yok';
      captureBtn.disabled = true;
      videoInfo.textContent = 'Aktif sekme bulunamadı';
      return;
    }

    _browser.tabs.sendMessage(tabId, { action: 'get_page_status' }, (res) => {
      if (_browser.runtime.lastError || !res) {
        statusDot.classList.remove('on');
        statusLabel.textContent = 'Video yok';
        captureBtn.disabled = true;
        videoInfo.textContent = 'Bu sayfada video algılanmadı';
        return;
      }

      if (res.hasVideo) {
        statusDot.classList.add('on');
        statusLabel.textContent = 'Hazır';
        statusLabel.style.color = '#34c759';
        captureBtn.disabled = false;

        const resParts = (res.resolution || '').split('×').map(Number);
        const w = resParts[0] || 0;
        if (w > 0 && w < 1280) {
          videoInfo.innerHTML = `<span>${res.videoTitle || 'Aktif Video'}</span><br><span style="color:#ff9500;font-weight:600;">⚡ Kaynak ${res.resolution} → Hedef 1080p HD</span>`;
        } else if (w >= 1280) {
          const qStr = w >= 3840 ? '4K' : (w >= 1920 ? '1080p' : '720p');
          videoInfo.innerHTML = `<span>${res.videoTitle || 'Aktif Video'}</span> <span style="color:#34c759;font-weight:600;">✓ ${qStr} (${res.resolution})</span>`;
        } else {
          videoInfo.textContent = res.videoTitle || 'Aktif Video';
        }
      } else {
        statusDot.classList.remove('on');
        statusLabel.textContent = 'Video yok';
        captureBtn.disabled = true;
        videoInfo.textContent = 'Bu sayfada video algılanmadı';
      }
    });
  });

  // ── Quick Capture Button ───────────────────────────────────────────────────
  captureBtn.addEventListener('click', () => {
    _browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      _browser.tabs.sendMessage(tabId, { action: 'capture_now' }, () => {
        const originalText = captureBtn.innerHTML;
        captureBtn.innerHTML = `<span>✓ Kare İndirildi</span>`;
        captureBtn.style.background = '#34c759';
        setTimeout(() => {
          captureBtn.innerHTML = originalText;
          captureBtn.style.background = '';
        }, 1500);
      });
    });
  });

  // ── Format Selection ───────────────────────────────────────────────────────
  function setFormat(fmt, save = true) {
    currentFormat = fmt;

    [segPng, segJpg, segTif].forEach(s => s.classList.remove('active'));
    const activeBtn = { png: segPng, jpg: segJpg, tif: segTif }[fmt];
    if (activeBtn) activeBtn.classList.add('active');

    fmtDesc.textContent = fmtDescriptions[fmt] || '';

    if (fmt === 'jpg') {
      qualityWrap.classList.add('show');
    } else {
      qualityWrap.classList.remove('show');
    }

    if (save) _browser.storage.local.set({ format: fmt });
  }

  segPng.addEventListener('click', () => setFormat('png'));
  segJpg.addEventListener('click', () => setFormat('jpg'));
  segTif.addEventListener('click', () => setFormat('tif'));

  // ── Quality Slider ─────────────────────────────────────────────────────────
  slider.addEventListener('input', () => {
    qDisplay.textContent = slider.value;
    updateSlider(slider.value);
  });

  function updateSlider(val) {
    const pct = ((val - 60) / 40) * 100;
    slider.style.setProperty('--pct', pct + '%');
  }

  // ── Keyboard Shortcut Recorder ─────────────────────────────────────────────
  let recording = false;

  recBtn.addEventListener('click', () => {
    if (!recording) {
      recording = true;
      kbdBox.textContent = '·';
      kbdBox.classList.add('recording');
      recBtn.textContent = 'İptal';
      shortcutHint.textContent = 'Herhangi bir tuşa bas…';
      shortcutHint.style.color = '#007aff';
    } else {
      cancelRecording();
    }
  });

  function cancelRecording() {
    recording = false;
    kbdBox.classList.remove('recording');
    recBtn.textContent = 'Değiştir';
    shortcutHint.style.color = '';
    _browser.storage.local.get(['shortcutKey'], (d) => {
      const k = (d.shortcutKey || 'p').toUpperCase();
      kbdBox.textContent = k;
      shortcutHint.textContent = `${k} tuşuna bas → aktif videoyu yakala`;
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!recording) return;
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
    if (e.key === 'Escape') { cancelRecording(); return; }
    e.preventDefault();

    const key = e.key.toLowerCase();
    recording = false;
    kbdBox.textContent = key.toUpperCase();
    kbdBox.classList.remove('recording');
    kbdBox.style.borderColor = '#34c759';
    kbdBox.style.color = '#34c759';
    recBtn.textContent = 'Değiştir';
    shortcutHint.textContent = `${key.toUpperCase()} tuşuna bas → aktif videoyu yakala`;
    shortcutHint.style.color = '#34c759';

    setTimeout(() => {
      kbdBox.style.borderColor = '';
      kbdBox.style.color = '';
      shortcutHint.style.color = '';
    }, 1500);

    _browser.storage.local.set({ shortcutKey: key });
  });

  // ── Save Settings ──────────────────────────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    const quality = parseInt(slider.value, 10);
    const key = kbdBox.textContent.toLowerCase();
    const showOverlay = overlaySwitch.checked;

    _browser.storage.local.set(
      {
        format: currentFormat,
        jpgQuality: quality,
        shortcutKey: key,
        showOverlay: showOverlay,
        scale: currentScale
      },
      () => {
        saveBtn.textContent = '✓ Ayarlar Kaydedildi';
        saveBtn.classList.add('ok');
        setTimeout(() => {
          saveBtn.textContent = 'Ayarları Kaydet';
          saveBtn.classList.remove('ok');
        }, 1600);
      }
    );
  });
})();
