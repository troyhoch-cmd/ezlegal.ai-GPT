/** Keep public pages usable when a deployment has no backend connection. */
export function hasBackendConfiguration(url: unknown, key: unknown): boolean {
  return typeof url === 'string' && url.trim().length > 0
    && typeof key === 'string' && key.trim().length > 0;
}

/** Fail closed locally: never send user content to a placeholder backend. */
export async function unavailableBackendFetch(): Promise<Response> {
  return new Response(JSON.stringify({
    message: 'Connected services are unavailable in this preview. Please try again when the service is configured.',
    error_description: 'Connected services are unavailable in this preview.',
    code: 'backend_unavailable',
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}
