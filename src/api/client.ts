import type { ProblemDetails } from "./types";

/** Error thrown for non-2xx API responses. Carries the Problem Details payload. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messageKey: string;
  readonly params: Record<string, unknown> | undefined;
  readonly path: string | undefined;

  constructor(status: number, problem: ProblemDetails, requestUrl: string) {
    super(problem.messageKey ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = problem.code ?? "UNKNOWN";
    this.messageKey = problem.messageKey;
    this.params = problem.params;
    this.path = problem.path ?? requestUrl;
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  /** Send body as raw string instead of JSON. */
  rawBody?: string;
};

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "");
}

export function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const joined = `${baseUrl.replace(/\/+$/, "")}/${stripLeadingSlash(path)}`;
  return `${joined}${buildQuery(query)}`;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class ApiClient {
  readonly baseUrl: string;
  private fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api/v1";
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  }

  /** Swap the underlying fetch implementation (used by tests). */
  setFetchImpl(impl: typeof fetch): void {
    this.fetchImpl = impl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", query, body, headers, rawBody } = options;

    const init: RequestInit = {
      method,
      headers: {
        ...(body !== undefined &&
        rawBody === undefined &&
        !(typeof FormData !== "undefined" && body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      },
    };

    if (body !== undefined) {
      init.body = rawBody ?? (body instanceof FormData ? body : JSON.stringify(body));
    }

    const url = buildUrl(this.baseUrl, path, query);

    let response: Response;
    try {
      response = await this.fetchImpl(url, init);
    } catch (cause) {
      throw new Error(`Network error while calling ${url}`, { cause });
    }

    if (!response.ok) {
      throw await this.parseError(response, url);
    }

    // 204 has no body
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async parseError(response: Response, url: string): Promise<ApiError> {
    let problem: ProblemDetails;
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = {
        code: "HTTP_ERROR",
        messageKey: `errors.http.${response.status}`,
        path: url,
        timestamp: new Date().toISOString(),
      };
    }
    return new ApiError(response.status, problem, url);
  }
}

/** Shared singleton bound to the Vite-proxied `/api/v1` base URL. */
export const api = new ApiClient();

/** Resolve an API path against the shared client base URL (e.g. for <img src>). */
export function apiUrl(path: string): string {
  return buildUrl(api.baseUrl, path);
}

export type { ProblemDetails };