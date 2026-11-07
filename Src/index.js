const UPSTREAM_ORIGIN = "https://bloxd.io";

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      UPSTREAM_ORIGIN
    );

    // Proxy only GET/HEAD to Bloxd. Avoid forwarding credentials or cookies
    // to an unrelated host and do not inject third-party JavaScript.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Only GET and HEAD requests are supported.", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const headers = new Headers(request.headers);
    headers.delete("cookie");
    headers.delete("authorization");
    headers.delete("host");

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      redirect: "follow",
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: upstreamResponse.headers,
    });
  },
};
