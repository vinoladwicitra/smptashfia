export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }
    
    // Let Cloudflare Pages assets handle all other requests
    // SPA routing is handled by the assets config (not_found_handling: single-page-application)
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
