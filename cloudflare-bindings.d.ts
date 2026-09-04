/**
 * Minimal local type bindings for the Sites-managed Cloudflare runtime.
 * Production bindings are injected by Sites from .openai/hosting.json.
 */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
  batch(statements: unknown[]): Promise<unknown[]>;
  exec(query: string): Promise<unknown>;
}

declare module "cloudflare:workers" {
  export const env: { DB?: D1Database };
}
