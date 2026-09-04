/**
 * In-app PDF viewer (pdf.js) that scales each page to the screen width
 * so native WebView letterboxing / side gutters do not appear.
 */
export function buildPdfViewerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      min-height: 100%;
      background: #ffffff;
      -webkit-text-size-adjust: 100%;
    }
    #status {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      font: 15px/1.4 -apple-system, system-ui, sans-serif;
      color: #5a6b68;
      text-align: center;
    }
    #pages {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      background: #ffffff;
    }
    .page {
      display: block;
      width: 100% !important;
      height: auto !important;
      margin: 0;
      background: #ffffff;
    }
    .page + .page { border-top: 1px solid #e8eeec; }
  </style>
</head>
<body>
  <div id="status">Loading PDF…</div>
  <div id="pages" hidden></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    var statusEl = document.getElementById("status");
    var pagesEl = document.getElementById("pages");
    var rendering = false;

    function setStatus(msg) {
      statusEl.hidden = false;
      pagesEl.hidden = true;
      statusEl.textContent = msg;
    }

    function post(type, extra) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, extra || {})));
      }
    }

    async function renderPdf(data) {
      if (rendering) return;
      rendering = true;
      try {
        setStatus("Opening PDF…");
        var loadingTask = pdfjsLib.getDocument({ data: data });
        var pdf = await loadingTask.promise;
        pagesEl.innerHTML = "";
        var cssWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

        for (var i = 1; i <= pdf.numPages; i++) {
          var page = await pdf.getPage(i);
          var unscaled = page.getViewport({ scale: 1 });
          var scale = cssWidth / unscaled.width;
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement("canvas");
          canvas.className = "page";
          var ctx = canvas.getContext("2d", { alpha: false });
          var outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          pagesEl.appendChild(canvas);
        }

        statusEl.hidden = true;
        pagesEl.hidden = false;
        post("ready", { pages: pdf.numPages });
      } catch (err) {
        setStatus("Could not open this PDF.");
        post("error", { message: String(err && err.message ? err.message : err) });
      } finally {
        rendering = false;
      }
    }

    function decodeBase64(b64) {
      var raw = atob(b64);
      var len = raw.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i);
      return bytes;
    }

    function onMessage(event) {
      try {
        var payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!payload || payload.type !== "pdf-base64" || !payload.data) return;
        renderPdf(decodeBase64(payload.data));
      } catch (e) {
        setStatus("Could not open this PDF.");
        post("error", { message: String(e && e.message ? e.message : e) });
      }
    }

    document.addEventListener("message", onMessage);
    window.addEventListener("message", onMessage);
    post("viewer-ready");
  </script>
</body>
</html>`;
}
