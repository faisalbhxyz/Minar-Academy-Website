/**
 * Same player UX as web `LessonVideoPlayer` (Plyr + custom chrome).
 * Loaded inside RN WebView with baseUrl so YouTube Error 153 is avoided.
 */
export function buildPlyrPlayerHtml(params: {
  provider: "youtube" | "vimeo";
  videoId: string;
  autoPlay?: boolean;
  title?: string;
  startAt?: number;
}): string {
  const { provider, videoId, autoPlay = true, title = "", startAt = 0 } = params;
  const safeTitle = title.replace(/[<>&"']/g, "");
  const startSeconds = Number.isFinite(startAt) ? Math.max(0, startAt) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.css" />
  <style>
    :root {
      --ma-primary: #246962;
      --ma-ink: #14201e;
    }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%;
      background: #000; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;
    }
    #shell {
      position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;
    }
    #player { width: 100%; height: 100%; }
    .plyr, .plyr__video-wrapper, .plyr__video-embed {
      width: 100% !important;
      height: 100% !important;
      background: #000;
    }
    .plyr__controls { display: none !important; }
    .plyr__video-embed {
      padding-bottom: 0 !important;
    }
    .plyr__video-embed iframe {
      pointer-events: none;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    #hit {
      position: absolute; inset: 0; z-index: 20;
    }
    #ui {
      position: absolute; inset: 0; z-index: 30;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 8px 10px 10px;
      background: linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.2) 40%, transparent 68%);
      transition: opacity .25s ease;
    }
    #ui.hidden { opacity: 0; pointer-events: none; }
    #times {
      display: flex; justify-content: space-between;
      color: #fff; font-size: 10px; margin-bottom: 2px; opacity: .9;
    }
    #seek {
      width: 100%; accent-color: #fff; height: 14px; margin: 0;
    }
    #seek::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: #fff; border: 0;
    }
    #seek::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: #fff; border: 0;
    }
    #row {
      margin-top: 4px; display: flex; align-items: center; justify-content: space-between;
      color: #fff;
    }
    #left, #right { display: flex; align-items: center; gap: 8px; }
    button.ctrl {
      appearance: none; border: 0; background: transparent; color: #fff;
      padding: 4px; font-size: 12px; font-weight: 600; line-height: 1;
    }
    button.ctrl svg { display: block; width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; }
    #speedWrap { position: relative; }
    #speedMenu {
      display: none; position: absolute; right: 0; bottom: 28px;
      background: rgba(0,0,0,.9); border-radius: 8px; padding: 4px; min-width: 64px;
    }
    #speedMenu.open { display: block; }
    #speedMenu button {
      display: block; width: 100%; text-align: left; border: 0; background: transparent;
      color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 11px;
    }
    #speedMenu button.active, #speedMenu button:active { background: rgba(36,105,98,.55); }
    #poster {
      position: absolute; inset: 0; z-index: 40;
      display: flex; align-items: center; justify-content: center;
      background: #0b1211 center/cover no-repeat;
    }
    #poster.gone { display: none; }
    #poster::before {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(160deg, rgba(26,79,74,.55), rgba(0,0,0,.55));
    }
    #playBig {
      position: relative; width: 44px; height: 44px; border-radius: 999px;
      border: 0; background: var(--ma-primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 18px rgba(0,0,0,.35);
    }
    #playBig svg { width: 18px; height: 18px; margin-left: 2px; }
    #caption {
      position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 1;
      color: #fff; font-size: 12px; font-weight: 600; text-shadow: 0 1px 8px rgba(0,0,0,.5);
    }
  </style>
</head>
<body>
  <div id="shell">
    <div id="player" data-plyr-provider="${provider}" data-plyr-embed-id="${videoId}"></div>
    <div id="hit"></div>
    <div id="ui" class="hidden">
      <div id="times"><span id="cur">0:00</span><span id="dur">0:00</span></div>
      <input id="seek" type="range" min="0" max="100" value="0" step="0.1" />
      <div id="row">
        <div id="left">
          <button class="ctrl" id="playBtn" aria-label="Play">
            <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>
          </button>
          <button class="ctrl" id="muteBtn" aria-label="Mute">
            <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
          </button>
        </div>
        <div id="right">
          <div id="speedWrap">
            <button class="ctrl" id="speedBtn">1x</button>
            <div id="speedMenu">
              <button data-speed="0.5">0.5x</button>
              <button data-speed="0.75">0.75x</button>
              <button data-speed="1" class="active">1x</button>
              <button data-speed="1.25">1.25x</button>
              <button data-speed="1.5">1.5x</button>
              <button data-speed="2">2x</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="poster" style="background-image:url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')">
      <button id="playBig" aria-label="Play">
        <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>
      </button>
      ${safeTitle ? `<div id="caption">${safeTitle}</div>` : ""}
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.min.js"></script>
  <script>
    (function () {
      var autoPlay = ${autoPlay ? "true" : "false"};
      var startAt = ${startSeconds};
      var poster = document.getElementById("poster");
      var ui = document.getElementById("ui");
      var hit = document.getElementById("hit");
      var playBtn = document.getElementById("playBtn");
      var muteBtn = document.getElementById("muteBtn");
      var speedBtn = document.getElementById("speedBtn");
      var speedMenu = document.getElementById("speedMenu");
      var seek = document.getElementById("seek");
      var curEl = document.getElementById("cur");
      var durEl = document.getElementById("dur");
      var player = null;
      var hideTimer = null;
      var playing = false;
      var lastPost = 0;

      function post(msg) {
        try {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        } catch (err) {}
      }

      function fmt(sec) {
        if (!isFinite(sec) || sec < 0) return "0:00";
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60).toString().padStart(2, "0");
        return m + ":" + s;
      }

      function setPlayIcon(isPlaying) {
        playBtn.innerHTML = isPlaying
          ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/></svg>'
          : '<svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>';
      }

      function showUi(temp) {
        ui.classList.remove("hidden");
        if (hideTimer) clearTimeout(hideTimer);
        if (temp && playing && !speedMenu.classList.contains("open")) {
          hideTimer = setTimeout(function () { ui.classList.add("hidden"); }, 2800);
        }
      }

      function boot() {
        if (player) return;
        poster.classList.add("gone");
        ui.classList.remove("hidden");

        player = new Plyr("#player", {
          controls: [],
          settings: [],
          clickToPlay: false,
          hideControls: true,
          disableContextMenu: true,
          youtube: {
            noCookie: true,
            modestbranding: 1,
            controls: 0,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1
          },
          vimeo: { byline: false, portrait: false, title: false, controls: false },
          fullscreen: { enabled: false }
        });

        player.on("ready", function () {
          durEl.textContent = fmt(player.duration || 0);
          if (startAt > 0 && player.duration > 0 && startAt < player.duration - 5) {
            player.currentTime = startAt;
          }
          post({ type: "ready", duration: player.duration || 0, current: player.currentTime || 0 });
          if (autoPlay) player.play();
        });
        player.on("play", function () {
          playing = true;
          setPlayIcon(true);
          showUi(true);
        });
        player.on("pause", function () {
          playing = false;
          setPlayIcon(false);
          showUi(false);
          post({
            type: "progress",
            current: player.currentTime || 0,
            duration: player.duration || 0
          });
        });
        player.on("ended", function () {
          post({
            type: "ended",
            current: player.currentTime || 0,
            duration: player.duration || 0
          });
        });
        player.on("timeupdate", function () {
          var d = player.duration || 0;
          var c = player.currentTime || 0;
          curEl.textContent = fmt(c);
          durEl.textContent = fmt(d);
          if (d > 0) seek.value = String((c / d) * 100);
          var now = Date.now();
          if (now - lastPost >= 2000) {
            lastPost = now;
            post({ type: "progress", current: c, duration: d });
          }
        });
        player.on("volumechange", function () {
          muteBtn.style.opacity = player.muted || player.volume === 0 ? "0.6" : "1";
        });
      }

      document.getElementById("playBig").addEventListener("click", function (e) {
        e.stopPropagation();
        boot();
      });
      poster.addEventListener("click", function () { boot(); });

      playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!player) { boot(); return; }
        player.togglePlay();
      });

      muteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!player) return;
        player.muted = !player.muted;
      });

      seek.addEventListener("input", function (e) {
        e.stopPropagation();
        if (!player || !player.duration) return;
        player.currentTime = (Number(seek.value) / 100) * player.duration;
      });

      speedBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        speedMenu.classList.toggle("open");
        showUi(false);
      });

      speedMenu.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (!player) return;
          var s = Number(btn.getAttribute("data-speed"));
          player.speed = s;
          speedBtn.textContent = s + "x";
          speedMenu.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          speedMenu.classList.remove("open");
          showUi(true);
        });
      });

      hit.addEventListener("click", function () {
        if (!player) { boot(); return; }
        if (ui.classList.contains("hidden")) {
          showUi(true);
        } else {
          player.togglePlay();
          showUi(true);
        }
      });

      ui.addEventListener("touchstart", function () { showUi(true); }, { passive: true });

      if (startAt > 0) boot();
    })();
  </script>
</body>
</html>`;
}
