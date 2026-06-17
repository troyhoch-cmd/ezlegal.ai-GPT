import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify({
      ok: true,
      service: "ezlegal-prototype",
      environment: process.env.CONTEXT ?? process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
    }),
  };
};
