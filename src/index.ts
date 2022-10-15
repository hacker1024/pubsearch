import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  const origin = new URL(c.req.url).origin;
  // language=HTML format=false
  return c.html(
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link
            rel="search" type="application/opensearchdescription+xml"
            href="${origin}/pub_package_search/direct"
            title="pub.dev package links">
    <link
            rel="search" type="application/opensearchdescription+xml"
            href="${origin}/pub_package_search/search"
            title="pub.dev package search">
    <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.3/new.min.css">
</head>
<body>
<h1>OpenSearch for pub.dev</h1>
<br/>
<p><a href="https://github.com/hacker1024/pubsearch">GitHub</a></p>
<p>
    Your browser should auto-detect the OpenSearch description documents.
    Otherwise, find them below.
</p>
<h2>OpenSearch description documents</h2>
<ul>
    <li><a href="${origin}/pub_package_search/search">Package search</a></li>
    <li><a href="${origin}/pub_package_search/direct">Package links</a></li>
</ul>
<h2>Adding instructions</h2>
<ul>
    <li><a href="https://support.mozilla.org/en-US/kb/add-or-remove-search-engine-firefox">Firefox</a></li>
    <li><a href="https://support.google.com/chrome/answer/95426">Chrome</a></li>
</ul>
</body>
</html>
    `,
    200
  );
});

app.get("/pub_package_search/:modifier?", (c) => {
  // @ts-ignore
  const direct = c.req.param("modifier") === "direct";

  const origin = new URL(c.req.url).origin;
  return c.body(
    // language=XML format=false
    `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
    <ShortName>${
      direct ? "pub.dev package links" : "pub.dev package search"
    }</ShortName>
    <Image height="16" width="16">https://pub.dev/favicon.ico</Image>
    <Developer>hacker1024 &lt;hacker1024@users.sourceforge.net&gt;</Developer>
    <Attribution>Package list from pub.dev</Attribution>
    <Url type="application/opensearchdescription+xml" rel="self" template="${
      c.req.url
    }" />
    <Url type="text/html" template="${
      direct
        ? "https://pub.dev/packages/{searchTerms}"
        : "https://pub.dev/packages?q={searchTerms}"
    }" />
    <Url type="application/x-suggestions+json" template="${origin}/search?q={searchTerms}" />
</OpenSearchDescription>
        `,
    200,
    { "Content-Type": "application/opensearchdescription+xml" }
  );
});

app.get("/search", async (c) => {
  const query = c.req.query("q") ?? "";

  const cache = caches.default;
  let request = new Request("https://pub.dev/api/package-name-completion-data");
  let response = await cache.match(request);
  if (!response) {
    response = await fetch(request);
    response = new Response(response.body, response);
    c.executionCtx.waitUntil(cache.put(request, response.clone()));
  }

  const allPackages = (await response.json<Record<string, any>>())
    .packages as string[];
  const suggestedPackages = allPackages.filter((packageName) =>
    packageName.startsWith(query)
  );

  return c.body(
    JSON.stringify([
      query,
      suggestedPackages,
      suggestedPackages.map((packageName) => `${packageName} package`),
      suggestedPackages.map(
        (packageName) => `https://pub.dev/packages/${packageName}`
      ),
    ]),
    200,
    { "Content-Type": "application/x-suggestions+json" }
  );
});

export default app;
