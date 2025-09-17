export async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeout: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const finalInit = { ...init, signal: controller.signal };

  try {
    const response = await fetch(input, finalInit);
    clearTimeout(id);
    return response;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`Request to ${input} timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
