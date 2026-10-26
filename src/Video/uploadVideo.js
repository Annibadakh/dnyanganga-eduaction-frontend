import videoApi from "./videoApi";

// Uploads a video file straight to S3 in 10 MiB parts (the server only hands out signed part
// links and finishes the upload). Parts go 4 at a time and each part is retried up to 3 times.
//
//   const upload = uploadVideo({ file, title, standardId, onProgress });
//   await upload.done;      // { videoId, status: "processing" }
//   upload.cancel();        // stops and removes the half-finished upload
const PARALLEL = 4;
const RETRIES = 3;
const URL_BATCH = 20;

export const uploadVideo = ({ file, title, standardId, onProgress = () => {} }) => {
  const controller = new AbortController();
  let videoId = null;
  let cancelled = false;
  let completing = false; // once "complete" is called the file is saved in S3 — keep it

  const done = (async () => {
    const { data } = await videoApi.post("/admin/uploads", {
      title,
      standardId,
      fileName: file.name,
      sizeBytes: file.size,
    });
    videoId = data.videoId;
    const { partSize, partCount } = data;

    const loaded = new Array(partCount + 1).fill(0); // bytes sent per part
    const report = () => onProgress(Math.min(loaded.reduce((a, b) => a + b, 0) / file.size, 1));

    // Signed links are fetched in batches, just before they're needed. Each part number maps to
    // the promise of its batch, so parallel lanes share one request instead of each asking.
    const links = new Map(); // partNumber → Promise<url>
    const linkFor = (partNumber) => {
      if (!links.has(partNumber)) {
        const batch = [];
        for (let n = partNumber; n < partNumber + URL_BATCH && n <= partCount; n++) if (!links.has(n)) batch.push(n);
        const request = videoApi.post(`/admin/uploads/${videoId}/parts`, { partNumbers: batch }).then(
          (res) => new Map(res.data.parts.map((p) => [p.partNumber, p.url])),
        );
        batch.forEach((n) => links.set(n, request.then((urls) => urls.get(n))));
        request.catch(() => batch.forEach((n) => links.delete(n))); // ask again on the next try
      }
      return links.get(partNumber);
    };

    const sendPart = (partNumber) =>
      new Promise((resolve, reject) => {
        const start = (partNumber - 1) * partSize;
        const blob = file.slice(start, Math.min(start + partSize, file.size));
        linkFor(partNumber)
          .then((url) => {
            if (cancelled) return reject(new Error("cancelled"));
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);
            xhr.upload.onprogress = (e) => {
              loaded[partNumber] = e.loaded;
              report();
            };
            xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Part ${partNumber}: ${xhr.status}`)));
            xhr.onerror = () => reject(new Error(`Part ${partNumber}: network error`));
            xhr.onabort = () => reject(new Error("cancelled")); // cancel() — otherwise the upload never settles
            const onAbort = () => xhr.abort();
            controller.signal.addEventListener("abort", onAbort, { once: true });
            xhr.onloadend = () => controller.signal.removeEventListener("abort", onAbort);
            xhr.send(blob);
          })
          .catch(reject);
      });

    const sendWithRetry = async (partNumber) => {
      for (let attempt = 1; ; attempt++) {
        if (cancelled) throw new Error("cancelled");
        try {
          await sendPart(partNumber);
          loaded[partNumber] = Math.min(partSize, file.size - (partNumber - 1) * partSize);
          report();
          return;
        } catch (error) {
          loaded[partNumber] = 0;
          if (cancelled) throw new Error("cancelled");
          if (attempt >= RETRIES) throw error;
          links.delete(partNumber); // fresh link in case the old one expired
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    };

    let next = 1;
    const lane = async () => {
      while (next <= partCount) {
        const partNumber = next++;
        await sendWithRetry(partNumber);
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, partCount) }, lane));
    if (cancelled) throw new Error("cancelled");

    completing = true;
    const finished = await videoApi.post(`/admin/uploads/${videoId}/complete`);
    onProgress(1);
    return { videoId, ...finished.data };
  })();

  const cancel = async () => {
    cancelled = true;
    controller.abort();
    if (videoId) await videoApi.post(`/admin/uploads/${videoId}/abort`).catch(() => {});
  };

  // If a part fails for good before completion, remove the half-finished upload
  done.catch(async () => {
    if (!cancelled && !completing && videoId) {
      await videoApi.post(`/admin/uploads/${videoId}/abort`).catch(() => {});
    }
  });

  return { done, cancel };
};

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i >= 2 ? 1 : 0)} ${units[i]}`;
};

export const formatDuration = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return "-";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};
