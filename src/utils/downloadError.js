// PDF downloads request a Blob, so a JSON error from the server also arrives as a Blob.
// Returns { status, code, message } read from the error (code/message may be empty).
export const readDownloadError = async (err) => {
  const status = err?.response?.status ?? err?.status ?? null;
  let body = err?.response?.data;
  try {
    if (body instanceof Blob) body = JSON.parse(await body.text());
  } catch {
    body = null;
  }
  return {
    status,
    code: body?.code || "",
    message: body?.message || body?.error || "",
  };
};
