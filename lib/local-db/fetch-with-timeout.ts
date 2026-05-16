/**
 * Safari-safe fetch timeout: Promise.race so loading never hangs if AbortController misbehaves.
 */
export async function fetchWithHardTimeout(
  input: string,
  init: RequestInit | undefined,
  timeoutMs: number
): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`FETCH_TIMEOUT_${timeoutMs}ms`));
    }, timeoutMs);
  });

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (init?.signal) {
    if (init.signal.aborted) controller.abort();
    else init.signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    return await Promise.race([
      fetch(input, { ...init, signal: controller.signal, cache: "no-store" }),
      timeoutPromise
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
