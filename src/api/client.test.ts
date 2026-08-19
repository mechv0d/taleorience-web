import { describe, expect, it, vi } from "vitest";

import { ApiError, ApiClient, buildUrl } from "./client";

describe("buildUrl", () => {
  it("joins base and path, stripping slashes", () => {
    expect(buildUrl("/api/v1", "/projects")).toBe("/api/v1/projects");
    expect(buildUrl("/api/v1/", "projects")).toBe("/api/v1/projects");
  });

  it("appends query params and skips empty values", () => {
    const url = buildUrl("/api/v1", "/search", { q: "citadel", limit: 5, nope: undefined, empty: "" });
    expect(url).toBe("/api/v1/search?q=citadel&limit=5");
  });

  it("encodes special characters", () => {
    const url = buildUrl("/api/v1", "/search", { q: "a b&c" });
    expect(url).toBe("/api/v1/search?q=a+b%26c");
  });
});

describe("ApiClient.request", () => {
  const jsonResponse = (status: number, body: unknown, contentType = "application/json") =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": contentType },
    });

  it("sends JSON body and parses the JSON response", async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toEqual({ name: "World" });
      return jsonResponse(201, { id: "x", name: "World" });
    });

    const client = new ApiClient({ baseUrl: "/api/v1", fetchImpl });
    const result = await client.request<{ id: string; name: string }>("/projects", {
      method: "POST",
      body: { name: "World" },
    });

    expect(result).toEqual({ id: "x", name: "World" });
    expect(fetchImpl).toHaveBeenCalledWith("/api/v1/projects", expect.objectContaining({ method: "POST" }));
  });

  it("throws ApiError with problem details on 4xx", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(404, {
        code: "PROJECT_NOT_FOUND",
        messageKey: "errors.projectNotFound",
        path: "/api/v1/projects/abc",
        timestamp: "2026-01-01T00:00:00Z",
      }),
    );

    const client = new ApiClient({ baseUrl: "/api/v1", fetchImpl });

    await expect(client.request("/projects/abc")).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
      messageKey: "errors.projectNotFound",
      name: "ApiError",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("throws a generic error when the network fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const client = new ApiClient({ baseUrl: "/api/v1", fetchImpl });
    await expect(client.request("/projects")).rejects.toThrow("Network error");
  });

  it("throws ApiError when the body is not parseable", async () => {
    const fetchImpl = vi.fn(async () => new Response("not json", { status: 500 }));
    const client = new ApiClient({ baseUrl: "/api/v1", fetchImpl });
    const error = await client.request("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("HTTP_ERROR");
  });

  it("sends FormData bodies without a manual Content-Type header", async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.body).toBeInstanceOf(FormData);
      expect(init?.headers).not.toHaveProperty("Content-Type");
      return jsonResponse(201, { id: "a" });
    });
    const client = new ApiClient({ baseUrl: "/api/v1", fetchImpl });
    const form = new FormData();
    form.append("file", new Blob(["x"]), "x.png");
    await client.request("/assets", { method: "POST", body: form });
  });
});

describe("ApiError", () => {
  it("carries status/code/messageKey", () => {
    const err = new ApiError(409, {
      code: "TAG_ALREADY_EXISTS",
      messageKey: "errors.tagExists",
      path: "/tags",
      timestamp: "t",
    }, "/tags");
    expect(err.status).toBe(409);
    expect(err.code).toBe("TAG_ALREADY_EXISTS");
    expect(err.messageKey).toBe("errors.tagExists");
    expect(err).toBeInstanceOf(Error);
  });
});