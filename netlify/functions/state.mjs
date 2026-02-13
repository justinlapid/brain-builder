import { getStore } from "@netlify/blobs";

const STORE_NAME = "brainbuilder";
const BLOB_KEY = "state";

export default async (req) => {

  const store = getStore(STORE_NAME);

  // GET — load state
  if (req.method === "GET") {
    try {
      const data = await store.get(BLOB_KEY);
      if (!data) {
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(data, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // PUT — save state
  if (req.method === "PUT") {
    try {
      const body = await req.text();
      // Basic validation
      const parsed = JSON.parse(body);
      if (!parsed || parsed.version !== 1) {
        return new Response(JSON.stringify({ error: "invalid state" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await store.set(BLOB_KEY, body);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/state",
};
