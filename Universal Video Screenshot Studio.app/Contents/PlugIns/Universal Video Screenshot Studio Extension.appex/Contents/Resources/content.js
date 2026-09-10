/**
 * content.js — Universal Video Frame Studio (Safari)
 *
 * Professional High-Fidelity Video Frame Extractor.
 * GPU-synchronized frame capture with Display-P3 color space.
 * Includes Smart Resolution Booster (1080p HD / 4K UHD / Native).
 */

(function () {
  'use strict';

  // Safari compatibility shim
  const _browser = (typeof browser !== 'undefined') ? browser : chrome;

  // ── Auto-enable CORS on newly created video elements ──────────────────────
  function ensureCors(video) {
    if (!video || video.dataset.uvsCors) return;
    video.dataset.uvsCors = 'true';
    // Only set crossOrigin before media loading begins.
    // Modifying crossOrigin on an already playing or buffered video forces WebKit to reload & reset playback!
    if (!video.crossOrigin && !video.currentSrc && video.readyState === 0) {
      try {
        video.crossOrigin = 'anonymous';
      } catch (e) {}
    }
  }

  // Intercept video creation at document_start
  const origCreate = document.createElement.bind(document);
  document.createElement = function (tag, options) {
    const el = origCreate(tag, options);
    if (tag && tag.toLowerCase() === 'video') {
      ensureCors(el);
    }
    return el;
  };

  // ── Preferences ────────────────────────────────────────────────────────────
  let prefs = {
    format: 'png',
    jpgQuality: 100,
    shortcutKey: 'p',
    showOverlay: true,
    scale: '1080p' // '1080p', '4k', 'native'
  };

  function reloadPrefs() {
    _browser.storage.local.get(['format', 'jpgQuality', 'shortcutKey', 'showOverlay', 'scale'], (d) => {
      prefs.format      = d.format      || 'png';
      prefs.jpgQuality  = d.jpgQuality  !== undefined ? d.jpgQuality : 100;
      prefs.shortcutKey = (d.shortcutKey || 'p').toLowerCase();
      prefs.showOverlay = d.showOverlay !== undefined ? d.showOverlay : true;
      prefs.scale       = d.scale       || '1080p';

      const overlays = document.querySelectorAll('.uvs-video-overlay');
      overlays.forEach(el => {
        el.style.display = prefs.showOverlay ? 'flex' : 'none';
      });
    });
  }
  reloadPrefs();
  _browser.storage.onChanged.addListener(reloadPrefs);

  // ── YouTube Auto-Max Quality Booster ───────────────────────────────────────
  function boostYouTubeQuality() {
    if (!location.hostname.includes('youtube.com')) return;
    try {
      const p = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
      if (p && p.getAvailableQualityLevels && p.setPlaybackQualityRange) {
        const lvls = p.getAvailableQualityLevels();
        if (lvls && lvls.length > 0) {
          const best = lvls[0]; // YouTube returns highest quality first ('hd2160', 'hd1440', 'hd1080')
          if (best && p.getPlaybackQuality() !== best) {
            p.setPlaybackQualityRange(best, best);
          }
        }
      }
    } catch (e) {}
  }
  setInterval(boostYouTubeQuality, 3000);

  // ── State & Active Video Tracking ──────────────────────────────────────────
  let currentlyHoveredVideo = null;
  let activeVideo = null;

  function isElementInViewport(el) {
    if (!el || !document.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  document.addEventListener('pointerover', (e) => {
    const v = e.target.closest('video') ||
              (e.target.querySelector && e.target.querySelector('video'));
    if (v && v.tagName === 'VIDEO') {
      ensureCors(v);
      currentlyHoveredVideo = v;
      activeVideo = v;
    }
  }, true);

  document.addEventListener('pointerout', (e) => {
    if (currentlyHoveredVideo && (e.target === currentlyHoveredVideo || !currentlyHoveredVideo.contains(e.target))) {
      if (!e.relatedTarget || !currentlyHoveredVideo.contains(e.relatedTarget)) {
        currentlyHoveredVideo = null;
      }
    }
  }, true);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function sanitize(s) {
    return (s || '')
      .replace(/[\/\\:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 100);
  }

  function fmtTime(sec) {
    const sInt = Math.floor(sec || 0);
    const h = Math.floor(sInt / 3600);
    const m = Math.floor((sInt % 3600) / 60);
    const s = Math.floor(sInt % 60);
    const p = n => String(n).padStart(2, '0');
    return h > 0 ? `${h}h${p(m)}m${p(s)}s` : `${p(m)}m${p(s)}s`;
  }

  function getVideoTitle(video) {
    if (location.hostname.includes('youtube.com')) {
      const ytTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                      document.querySelector('#title h1 yt-formatted-string') ||
                      document.querySelector('ytd-watch-metadata h1') ||
                      document.querySelector('h1.title');
      if (ytTitle && ytTitle.textContent.trim()) {
        return ytTitle.textContent.trim();
      }
    }

    const attrTitle = video.getAttribute('title') ||
                      video.getAttribute('aria-label') ||
                      video.getAttribute('data-title');
    if (attrTitle && attrTitle.trim()) {
      return attrTitle.trim();
    }

    const container = video.closest('[data-title], [aria-label]');
    if (container) {
      const ct = container.getAttribute('data-title') || container.getAttribute('aria-label');
      if (ct && ct.trim()) return ct.trim();
    }

    let docTitle = document.title || 'Video';
    docTitle = docTitle
      .replace(/\s*-\s*YouTube$/i, '')
      .replace(/\s*\|\s*Vimeo$/i, '')
      .replace(/\s*\/\s*X$/i, '')
      .replace(/\s*-\s*Twitter$/i, '')
      .replace(/\s*•\s*Instagram.*$/i, '')
      .replace(/\s*:\s*Reddit$/i, '')
      .replace(/\s*\|\s*TikTok$/i, '')
      .trim();

    return docTitle || 'Video_Frame';
  }

  function findTargetVideo() {
    // 1. Fullscreen video has absolute priority
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) {
      const fsVideo = fsEl.tagName === 'VIDEO' ? fsEl : fsEl.querySelector('video');
      if (fsVideo && fsVideo.videoWidth > 0) return fsVideo;
    }

    // 2. Video currently under mouse cursor & visible in viewport
    if (currentlyHoveredVideo && isElementInViewport(currentlyHoveredVideo) && currentlyHoveredVideo.videoWidth > 0) {
      return currentlyHoveredVideo;
    }

    const allVideos = Array.from(document.querySelectorAll('video')).filter(v => v.videoWidth > 0);
    if (allVideos.length === 0) return null;

    // 3. Actively playing video visible in viewport
    const playingVisible = allVideos.find(v => !v.paused && !v.ended && v.currentTime > 0 && isElementInViewport(v));
    if (playingVisible) return playingVisible;

    // 4. Any actively playing video
    const anyPlaying = allVideos.find(v => !v.paused && !v.ended && v.currentTime > 0);
    if (anyPlaying) return anyPlaying;

    // 5. Recently active video if still visible in viewport
    if (activeVideo && isElementInViewport(activeVideo) && activeVideo.videoWidth > 0) {
      return activeVideo;
    }

    // 6. Largest visible video in viewport
    let best = null;
    let maxArea = -1;
    for (const v of allVideos) {
      if (isElementInViewport(v)) {
        const rect = v.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          best = v;
        }
      }
    }
    if (best) return best;

    return allVideos[0] || null;
  }

  // ── macOS Floating Toast Notification ──────────────────────────────────────
  let _notifTimer = null;
  function notify(msg, ok = true) {
    const prev = document.getElementById('uvs-notif');
    if (prev) { prev.remove(); clearTimeout(_notifTimer); }

    const accent = ok ? '#34c759' : '#007aff';
    const iconBg = ok ? 'rgba(52,199,89,0.12)' : 'rgba(0,122,255,0.12)';
    const icon = ok
      ? `<polyline points="20 6 9 17 4 12"/>`
      : `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>`;

    const n = document.createElement('div');
    n.id = 'uvs-notif';
    n.style.cssText = `
      position:fixed; top:18px; right:-350px; z-index:2147483647;
      width:320px; padding:12px 14px;
      display:flex; align-items:center; gap:12px;
      background:rgba(255, 255, 255, 0.97);
      -webkit-backdrop-filter:blur(24px) saturate(180%);
      backdrop-filter:blur(24px) saturate(180%);
      border:0.5px solid rgba(0,0,0,0.12);
      border-radius:14px;
      box-shadow:0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06);
      font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;
      font-size:12px; color:#1c1c1e; pointer-events:none;
      transition:right 0.38s cubic-bezier(0.34,1.56,0.64,1);
    `;
    n.innerHTML = `
      <div style="width:34px;height:34px;flex-shrink:0;border-radius:10px;background:${iconBg};
                  display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="${accent}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
          ${icon}
        </svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;color:#1c1c1e;margin-bottom:2px;letter-spacing:-0.01em;">Video Frame Studio</div>
        <div style="font-size:11px;color:#636366;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${msg}</div>
      </div>
    `;
    document.body.appendChild(n);
    requestAnimationFrame(() => requestAnimationFrame(() => { n.style.right = '18px'; }));
    _notifTimer = setTimeout(() => {
      n.style.transition = 'right 0.3s ease, opacity 0.25s ease';
      n.style.right = '-350px';
      n.style.opacity = '0';
      setTimeout(() => n.remove(), 340);
    }, 4500);
  }

  // ── CSP-safe DataURL to Blob conversion ───────────────────────────────────
  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
    const bstr = atob(parts[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  }

  // ── File Download ──────────────────────────────────────────────────────────
  function downloadBlob(blob, filename) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      // Keep blob alive for 30s so WebKit doesn't cancel download with WebKitBlobResource error 1
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 30000);
    } catch (err) {
      // Fallback for sandboxed iframes disallowing downloads
      if (window !== window.top) {
        window.top.postMessage({ action: 'uvs_download', blob, filename }, '*');
      }
    }
  }

  // Handle cross-frame download requests in top window
  if (window === window.top) {
    window.addEventListener('message', (ev) => {
      if (ev.data && ev.data.action === 'uvs_download' && ev.data.blob && ev.data.filename) {
        downloadBlob(ev.data.blob, ev.data.filename);
      }
    });
  }

  // ── Synchronous High-Fidelity Video Frame Capture ──────────────────────────
  function captureVideo(video) {
    if (!video || !video.videoWidth || !video.videoHeight) {
      notify('Yakalanacak video karesi bulunamadı', false);
      return false;
    }

    ensureCors(video);
    activeVideo = video;

    const sourceW = video.videoWidth;
    const sourceH = video.videoHeight;
    const maxDim = Math.max(sourceW, sourceH);

    // Calculate target output dimensions respecting aspect ratio (landscape & portrait)
    let outW = sourceW;
    let outH = sourceH;

    if (prefs.scale === '4k') {
      const targetMax = 3840;
      if (maxDim < targetMax) {
        const factor = targetMax / maxDim;
        outW = Math.round(sourceW * factor);
        outH = Math.round(sourceH * factor);
      }
    } else if (prefs.scale === '1080p') {
      const targetMax = 1920;
      if (maxDim < targetMax) {
        const factor = targetMax / maxDim;
        outW = Math.round(sourceW * factor);
        outH = Math.round(sourceH * factor);
      }
    }

    // Capture synchronously within active user gesture stack
    const cv = document.createElement('canvas');
    cv.width = outW;
    cv.height = outH;

    let ctx = null;
    try {
      ctx = cv.getContext('2d', { colorSpace: 'display-p3' });
    } catch (e) {}
    if (!ctx) {
      try {
        ctx = cv.getContext('2d');
      } catch (e) {}
    }

    if (!ctx) {
      notify('Tuval (canvas) oluşturulamadı', false);
      return false;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    try {
      ctx.drawImage(video, 0, 0, outW, outH);
    } catch (e) {
      notify('Video karesi korumalı (CORS/DRM engeli)', false);
      return false;
    }

    const timeLabel = fmtTime(video.currentTime || 0);
    const rawTitle = getVideoTitle(video);
    const title = sanitize(rawTitle);

    let blob = null;
    let ext = 'png';

    try {
      if (prefs.format === 'tif' && typeof UTIF !== 'undefined') {
        const imgData = ctx.getImageData(0, 0, outW, outH);
        const tifBuf = UTIF.encodeImage(new Uint8Array(imgData.data), outW, outH);
        blob = new Blob([tifBuf], { type: 'image/tiff' });
        ext = 'tif';
      } else if (prefs.format === 'jpg') {
        const quality = Math.max(0.1, Math.min(1.0, prefs.jpgQuality / 100));
        const dataUrl = cv.toDataURL('image/jpeg', quality);
        blob = dataUrlToBlob(dataUrl);
        ext = 'jpg';
      } else {
        // Lossless PNG with Display-P3 wide color gamut
        const dataUrl = cv.toDataURL('image/png');
        blob = dataUrlToBlob(dataUrl);
        ext = 'png';
      }
    } catch (e) {
      notify('Kare kaydedilemedi: ' + (e.message || ''), false);
      return false;
    }

    if (!blob) {
      notify('Video karesi kaydedilemedi', false);
      return false;
    }

    const filename = `${title}_${timeLabel}.${ext}`;
    downloadBlob(blob, filename);

    const sizeMB = (blob.size / 1024 / 1024).toFixed(1);
    const qName = maxDim >= 3840 ? '4K Ultra HD' : (maxDim >= 1920 ? '1080p Full HD' : `${outW}×${outH}`);
    notify(`✓ ${qName} (${outW}×${outH})  ·  ${sizeMB} MB  ·  ${ext.toUpperCase()}`, true);
    return true;
  }

  // ── Capture Target Trigger ─────────────────────────────────────────────────
  function captureTarget() {
    const v = findTargetVideo();
    if (v) {
      return captureVideo(v);
    }

    // If no video found in top frame, broadcast to child iframes
    if (window === window.top) {
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length > 0) {
        iframes.forEach(f => {
          try {
            f.contentWindow?.postMessage({ action: 'uvs_trigger_capture' }, '*');
          } catch (e) {}
        });
        return true;
      }
    }

    notify('Sayfada yakalanacak video bulunamadı', false);
    return false;
  }

  // ── macOS Floating Settings Panel ──────────────────────────────────────────
  function toggleSettingsPanel(anchorBtn) {
    const ex = document.getElementById('uvs-panel');
    if (ex) { ex.remove(); return; }

    const rect = anchorBtn ? anchorBtn.getBoundingClientRect() : { top: 100, right: 120, bottom: 100 };
    const panelW = 280;
    const right = Math.max(12, window.innerWidth - rect.right);
    const bottom = Math.max(12, window.innerHeight - rect.top + 8);

    const p = document.createElement('div');
    p.id = 'uvs-panel';
    p.style.cssText = `
      position:fixed;
      bottom:${bottom}px;
      right:${right}px;
      z-index:2147483647;
      width:${panelW}px;
      background:rgba(255, 255, 255, 0.96);
      -webkit-backdrop-filter:blur(24px) saturate(180%);
      backdrop-filter:blur(24px) saturate(180%);
      border-radius:16px;
      border:0.5px solid rgba(0,0,0,0.12);
      box-shadow:0 12px 40px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.08);
      font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;
      font-size:13px; color:#1c1c1e;
      overflow:hidden;
      opacity:0; transform:translateY(8px) scale(0.97);
      transition:opacity 0.2s ease, transform 0.2s ease;
    `;

    p.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:12px 14px 10px;border-bottom:0.5px solid rgba(0,0,0,0.1);">
        <span style="font-size:13px;font-weight:600;letter-spacing:-0.01em;">Video Frame Studio</span>
        <button id="uvs-close" style="width:22px;height:22px;border:none;background:rgba(120,120,128,0.14);
               border-radius:50%;cursor:pointer;font-size:11px;color:#6c6c70;
               display:flex;align-items:center;justify-content:center;padding:0;">✕</button>
      </div>

      <!-- Format -->
      <div style="padding:12px 14px 0;">
        <div style="font-size:10.5px;font-weight:500;color:#8e8e93;text-transform:uppercase;
                    letter-spacing:0.05em;margin-bottom:8px;">Format</div>
        <div id="uvs-fmt-row" style="display:flex;background:rgba(120,120,128,0.12);
             border-radius:9px;padding:2px;gap:2px;">
          <div class="uvs-seg" data-fmt="png" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;">PNG</div>
          <div class="uvs-seg" data-fmt="jpg" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;">JPG</div>
          <div class="uvs-seg" data-fmt="tif" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;">TIF</div>
        </div>
        <div id="uvs-fmt-desc" style="font-size:11px;color:#8e8e93;margin-top:6px;min-height:16px;"></div>
      </div>

      <!-- Scale -->
      <div style="padding:4px 14px 0;">
        <div style="font-size:10.5px;font-weight:500;color:#8e8e93;text-transform:uppercase;
                    letter-spacing:0.05em;margin-bottom:8px;">Çözünürlük</div>
        <div id="uvs-scale-row" style="display:flex;background:rgba(120,120,128,0.12);
             border-radius:9px;padding:2px;gap:2px;">
          <div class="uvs-scale-seg" data-scale="1080p" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:11.5px;font-weight:600;cursor:pointer;transition:all 0.15s;">1080p</div>
          <div class="uvs-scale-seg" data-scale="4k" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:11.5px;font-weight:600;cursor:pointer;transition:all 0.15s;">4K</div>
          <div class="uvs-scale-seg" data-scale="native" style="flex:1;text-align:center;padding:6px 2px;border-radius:7px;
               font-size:11.5px;font-weight:600;cursor:pointer;transition:all 0.15s;">Orijinal</div>
        </div>
      </div>

      <div id="uvs-qual-wrap" style="padding:0 14px;overflow:hidden;max-height:0;opacity:0;transition:all 0.2s;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 6px;">
          <span style="font-size:12px;color:#3c3c43;">JPG Kalitesi</span>
          <span id="uvs-qual-val" style="font-size:12px;font-weight:600;color:#007aff;">${prefs.jpgQuality}</span>
        </div>
        <input type="range" id="uvs-qual" min="60" max="100" value="${prefs.jpgQuality}"
               style="width:100%;accent-color:#007aff;cursor:pointer;">
      </div>

      <div style="padding:12px 14px 14px;border-top:0.5px solid rgba(0,0,0,0.08);margin-top:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;color:#3c3c43;">Klavye Kısayolu</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <div id="uvs-kbd" style="min-width:30px;height:24px;padding:0 8px;background:#f2f2f7;
                 border:0.5px solid rgba(0,0,0,0.15);border-radius:5px;
                 display:flex;align-items:center;justify-content:center;
                 font-family:monospace;font-size:12px;font-weight:700;">${prefs.shortcutKey.toUpperCase()}</div>
            <button id="uvs-rec-btn" style="padding:4px 9px;border:0.5px solid rgba(0,0,0,0.15);
                   border-radius:6px;background:#fff;font-size:11px;font-weight:500;cursor:pointer;">Değiştir</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.opacity = '1';
      p.style.transform = 'translateY(0) scale(1)';
    });

    p.querySelector('#uvs-close').addEventListener('click', () => p.remove());

    const descMap = {
      png: 'Kayıpsız Display-P3 — 4K & HDR için en iyisi',
      jpg: 'Sıkıştırılmış — küçük dosya boyutu',
      tif: 'Kayıpsız profesyonel TIFF'
    };
    const fmtDesc = p.querySelector('#uvs-fmt-desc');
    const qualWrap = p.querySelector('#uvs-qual-wrap');

    function updateFormatUI(fmt) {
      p.querySelectorAll('.uvs-seg').forEach(el => {
        const isCur = el.getAttribute('data-fmt') === fmt;
        el.style.background = isCur ? '#fff' : 'transparent';
        el.style.color = isCur ? '#1c1c1e' : '#6c6c70';
        el.style.boxShadow = isCur ? '0 1px 3px rgba(0,0,0,0.12)' : 'none';
      });
      fmtDesc.textContent = descMap[fmt] || '';
      if (fmt === 'jpg') {
        qualWrap.style.maxHeight = '60px';
        qualWrap.style.opacity = '1';
      } else {
        qualWrap.style.maxHeight = '0';
        qualWrap.style.opacity = '0';
      }
    }
    updateFormatUI(prefs.format);

    function updateScaleUI(sc) {
      p.querySelectorAll('.uvs-scale-seg').forEach(el => {
        const isCur = el.getAttribute('data-scale') === sc;
        el.style.background = isCur ? '#fff' : 'transparent';
        el.style.color = isCur ? '#1c1c1e' : '#6c6c70';
        el.style.boxShadow = isCur ? '0 1px 3px rgba(0,0,0,0.12)' : 'none';
      });
    }
    updateScaleUI(prefs.scale);

    p.querySelectorAll('.uvs-seg').forEach(el => {
      el.addEventListener('click', () => {
        const f = el.getAttribute('data-fmt');
        prefs.format = f;
        _browser.storage.local.set({ format: f });
        updateFormatUI(f);
      });
    });

    p.querySelectorAll('.uvs-scale-seg').forEach(el => {
      el.addEventListener('click', () => {
        const sc = el.getAttribute('data-scale');
        prefs.scale = sc;
        _browser.storage.local.set({ scale: sc });
        updateScaleUI(sc);
      });
    });

    const qualSlider = p.querySelector('#uvs-qual');
    const qualVal = p.querySelector('#uvs-qual-val');
    qualSlider.addEventListener('input', () => {
      qualVal.textContent = qualSlider.value;
      prefs.jpgQuality = parseInt(qualSlider.value, 10);
      _browser.storage.local.set({ jpgQuality: prefs.jpgQuality });
    });

    const kbdEl = p.querySelector('#uvs-kbd');
    const recBtn = p.querySelector('#uvs-rec-btn');
    let recording = false;
    recBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      recording = !recording;
      if (recording) {
        kbdEl.textContent = '·';
        kbdEl.style.color = '#007aff';
        recBtn.textContent = 'İptal';
      } else {
        kbdEl.textContent = prefs.shortcutKey.toUpperCase();
        kbdEl.style.color = '';
        recBtn.textContent = 'Değiştir';
      }
    });

    document.addEventListener('keydown', function rec(e) {
      if (!recording) return;
      if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      if (e.key === 'Escape') {
        recording = false;
        kbdEl.textContent = prefs.shortcutKey.toUpperCase();
        recBtn.textContent = 'Değiştir';
        document.removeEventListener('keydown', rec);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      recording = false;
      document.removeEventListener('keydown', rec);
      const k = e.key.toLowerCase();
      prefs.shortcutKey = k;
      _browser.storage.local.set({ shortcutKey: k });
      kbdEl.textContent = k.toUpperCase();
      kbdEl.style.color = '#34c759';
      recBtn.textContent = 'Değiştir';
      setTimeout(() => { kbdEl.style.color = ''; }, 1200);
    }, true);

    setTimeout(() => {
      document.addEventListener('click', function out(e) {
        if (!p.contains(e.target) && (!anchorBtn || !anchorBtn.contains(e.target))) {
          p.remove();
          document.removeEventListener('click', out);
        }
      });
    }, 200);
  }

  // ── YouTube Specific Button Integration ────────────────────────────────────
  function injectYouTubeButtons() {
    if (!location.hostname.includes('youtube.com')) return;
    const controls = document.querySelector('.ytp-right-controls');
    if (!controls) return;
    if (controls.querySelector('#yt-fc-btn')) return;

    const makeBtn = (id, title, svg, onClick) => {
      const b = document.createElement('button');
      b.id = id;
      b.title = title;
      b.className = 'ytp-button';
      b.innerHTML = svg;
      b.style.cssText = 'width:36px;height:36px;opacity:0.9;cursor:pointer;background:none;border:none;padding:0;display:inline-flex;align-items:center;justify-content:center;transition:opacity .2s,transform .15s;';
      b.addEventListener('mouseenter', () => { b.style.opacity = '1'; b.style.transform = 'scale(1.1)'; });
      b.addEventListener('mouseleave', () => { b.style.opacity = '0.9'; b.style.transform = 'scale(1)'; });
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        b.style.transform = 'scale(0.88)';
        setTimeout(() => { b.style.transform = 'scale(1)'; }, 140);
        onClick(b);
      });
      return b;
    };

    controls.insertBefore(
      makeBtn('yt-fc-settings-btn', 'Frame Studio — Ayarlar',
        `<svg viewBox="0 0 24 24" width="20" height="20" fill="white" style="opacity:0.85">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61
                   l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54
                   c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54
                   c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87
                   c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94
                   l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96
                   c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41
                   l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32
                   c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6
                   3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>`,
        (btn) => toggleSettingsPanel(btn)
      ),
      controls.firstChild
    );

    controls.insertBefore(
      makeBtn('yt-fc-btn', 'Video Karesi Yakala (P)',
        `<svg viewBox="0 0 36 36" width="100%" height="100%" fill="white">
          <path d="M27,11L24.5,11L23,8.5C22.7,8,22.1,7.7,21.5,7.7L14.5,7.7
                   C13.9,7.7,13.3,8,13,8.5L11.5,11L9,11C7.3,11,6,12.3,6,14L6,24
                   C6,25.7,7.3,27,9,27L27,27C28.7,27,30,25.7,30,24L30,14
                   C30,12.3,28.7,11,27,11Z M18,24C15.2,24,13,21.8,13,19
                   C13,16.2,15.2,14,18,14C20.8,14,23,16.2,23,19C23,21.8,20.8,24,18,24Z"/>
          <circle cx="18" cy="19" r="2.5"/>
        </svg>`,
        () => captureTarget()
      ),
      controls.firstChild
    );
  }

  // ── Universal Floating Overlay for Any Web Video ───────────────────────────
  function attachUniversalOverlay(video) {
    if (location.hostname.includes('youtube.com')) return;
    ensureCors(video);

    if (video.dataset.uvsAttached) return;
    video.dataset.uvsAttached = 'true';

    let container = video.parentElement;
    if (!container) return;

    const cs = window.getComputedStyle(container);
    if (cs.position === 'static') {
      container.style.position = 'relative';
    }

    const overlay = document.createElement('div');
    overlay.className = 'uvs-video-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2147483640;
      display: ${prefs.showOverlay ? 'flex' : 'none'};
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: rgba(28, 28, 30, 0.78);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 0.5px solid rgba(255, 255, 255, 0.22);
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      opacity: 0;
      pointer-events: auto;
      transition: opacity 0.25s ease, transform 0.25s ease;
      transform: translateY(-4px);
    `;

    // Camera button
    const camBtn = document.createElement('button');
    camBtn.title = `Video Karesi Yakala (${prefs.shortcutKey.toUpperCase()})`;
    camBtn.style.cssText = `
      background: none; border: none; cursor: pointer; padding: 3px;
      display: flex; align-items: center; justify-content: center;
      color: #ffffff; border-radius: 50%; outline: none;
      transition: transform 0.15s, opacity 0.15s;
    `;
    camBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    `;
    camBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      camBtn.style.transform = 'scale(0.85)';
      setTimeout(() => { camBtn.style.transform = 'scale(1)'; }, 150);
      captureVideo(video);
    });

    // Resolution badge
    const resBadge = document.createElement('div');
    resBadge.style.cssText = `
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
      display: flex; align-items: center; gap: 4px; user-select: none;
    `;

    function updateResBadge() {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        resBadge.style.display = 'none';
        return;
      }
      resBadge.style.display = 'flex';
      if (prefs.scale === '4k') {
        resBadge.style.background = 'rgba(0, 122, 255, 0.22)';
        resBadge.style.color = '#007aff';
        resBadge.style.border = '0.5px solid rgba(0, 122, 255, 0.35)';
        resBadge.innerHTML = `<span>4K UHD</span><span style="font-size:9px;">⚡</span>`;
        resBadge.title = `4K Ultra HD modunda yakalanacak (${w}×${h} kaynak)`;
      } else if (prefs.scale === '1080p') {
        resBadge.style.background = 'rgba(52, 199, 89, 0.22)';
        resBadge.style.color = '#34c759';
        resBadge.style.border = '0.5px solid rgba(52, 199, 89, 0.35)';
        resBadge.innerHTML = `<span>1080p HD</span><span style="font-size:9px;">✓</span>`;
        resBadge.title = `1080p Full HD kalitesinde yakalanacak (${w}×${h} kaynak)`;
      } else {
        if (w < 1280) {
          resBadge.style.background = 'rgba(255, 149, 0, 0.25)';
          resBadge.style.color = '#ff9f0a';
          resBadge.style.border = '0.5px solid rgba(255, 149, 0, 0.4)';
          resBadge.innerHTML = `<span>${w}×${h}</span><span style="font-size:9px;">⚠️</span>`;
          resBadge.title = `⚠️ Ham kaynak akış çözünürlüğü (${w}×${h}).\n1080p için ayarları açın veya videoyu tam ekrana alın.`;
        } else {
          const label = w >= 3840 ? '4K' : (w >= 1920 ? '1080p' : `${w}×${h}`);
          resBadge.style.background = 'rgba(52, 199, 89, 0.22)';
          resBadge.style.color = '#34c759';
          resBadge.style.border = '0.5px solid rgba(52, 199, 89, 0.35)';
          resBadge.innerHTML = `<span>${label}</span><span style="font-size:9px;">✓</span>`;
          resBadge.title = `✓ Orijinal Yüksek Kalite (${w}×${h})`;
        }
      }
    }

    resBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSettingsPanel(resBadge);
    });

    video.addEventListener('resize', updateResBadge);
    video.addEventListener('loadedmetadata', updateResBadge);

    // Settings button
    const gearBtn = document.createElement('button');
    gearBtn.title = 'Ayarlar';
    gearBtn.style.cssText = `
      background: none; border: none; cursor: pointer; padding: 3px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255, 255, 255, 0.8); border-radius: 50%; outline: none;
      transition: transform 0.15s, opacity 0.15s;
    `;
    gearBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    `;
    gearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSettingsPanel(gearBtn);
    });

    overlay.appendChild(camBtn);
    overlay.appendChild(resBadge);
    overlay.appendChild(gearBtn);
    container.appendChild(overlay);

    let hideTimer = null;
    const showOverlay = () => {
      if (!prefs.showOverlay) return;
      clearTimeout(hideTimer);
      updateResBadge();
      overlay.style.opacity = '1';
      overlay.style.transform = 'translateY(0)';
    };

    const hideOverlay = (delay = 1800) => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateY(-4px)';
      }, delay);
    };

    container.addEventListener('mouseenter', showOverlay);
    container.addEventListener('mousemove', showOverlay);
    container.addEventListener('mouseleave', () => hideOverlay(300));
    video.addEventListener('play', () => hideOverlay(1500));
    video.addEventListener('pause', showOverlay);
  }

  // ── Scan and Initialize Page Videos ────────────────────────────────────────
  function scanVideos() {
    boostYouTubeQuality();
    if (location.hostname.includes('youtube.com')) {
      injectYouTubeButtons();
    } else {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        ensureCors(v);
        attachUniversalOverlay(v);
      });
    }
    notifyTopFrameVideo();
  }

  // Cross-frame communication for embedded videos (iframes)
  function notifyTopFrameVideo() {
    if (window !== window.top) {
      const v = findTargetVideo();
      if (v) {
        try {
          window.top.postMessage({
            action: 'uvs_child_video',
            hasVideo: true,
            videoTitle: getVideoTitle(v),
            resolution: `${v.videoWidth}×${v.videoHeight}`
          }, '*');
        } catch (e) {}
      }
    }
  }

  let childFrameVideoInfo = null;
  if (window === window.top) {
    window.addEventListener('message', (ev) => {
      if (ev.data && ev.data.action === 'uvs_child_video') {
        childFrameVideoInfo = ev.data;
      }
    });
  }

  // Any frame listens for remote capture trigger
  window.addEventListener('message', (ev) => {
    if (ev.data && ev.data.action === 'uvs_trigger_capture') {
      const v = findTargetVideo();
      if (v) captureVideo(v);
    }
  });

  // Throttled MutationObserver for SPA / Dynamic Content (avoids high CPU)
  let scanTimer = null;
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanVideos();
    }, 250);
  }

  new MutationObserver(() => scheduleScan())
    .observe(document.body || document.documentElement, { childList: true, subtree: true });

  // ── Typing Detection Helper ────────────────────────────────────────────────
  function isTyping(e) {
    const check = (node) => {
      if (!node) return false;
      const tag = (node.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (node.isContentEditable) return true;
      if (node.getAttribute) {
        const role = node.getAttribute('role');
        if (role === 'textbox' || role === 'searchbox' || role === 'combobox') return true;
        if (node.getAttribute('contenteditable') === 'true') return true;
      }
      return false;
    };
    return check(e.target) || check(document.activeElement);
  }

  // ── Keyboard Shortcut Handler ──────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (isTyping(e)) return;
    if (document.getElementById('uvs-panel')) return;

    if (e.key.toLowerCase() === prefs.shortcutKey) {
      const target = findTargetVideo();
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        captureVideo(target);
      } else if (window === window.top && childFrameVideoInfo && childFrameVideoInfo.hasVideo) {
        e.preventDefault();
        e.stopPropagation();
        captureTarget();
      }
    }
  }, true);

  // ── Message Listener for Popup Interaction ─────────────────────────────────
  _browser.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === 'get_page_status') {
      const target = findTargetVideo();
      const count = document.querySelectorAll('video').length;
      if (target) {
        sendResponse({
          hasVideo: true,
          videoCount: count,
          videoTitle: getVideoTitle(target),
          resolution: `${target.videoWidth}×${target.videoHeight}`
        });
      } else if (childFrameVideoInfo && childFrameVideoInfo.hasVideo) {
        sendResponse({
          hasVideo: true,
          videoCount: 1,
          videoTitle: childFrameVideoInfo.videoTitle || 'Gömülü Video',
          resolution: childFrameVideoInfo.resolution || ''
        });
      } else {
        sendResponse({
          hasVideo: false,
          videoCount: 0,
          videoTitle: '',
          resolution: ''
        });
      }
      return false;
    }

    if (req.action === 'capture_now') {
      const ok = captureTarget();
      sendResponse({ success: !!ok });
      return false;
    }

    return false;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanVideos);
  } else {
    scanVideos();
  }

  // SPA navigation events for YouTube, Vimeo, Twitter/X
  window.addEventListener('yt-navigate-finish', () => setTimeout(scanVideos, 350));
  window.addEventListener('load', scanVideos);
  window.addEventListener('focus', scanVideos);
})();
