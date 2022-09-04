/** @jsx h */

import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import { render } from "https://deno.land/x/resvg_wasm/mod.ts";
import { router } from "https://crux.land/router@0.0.5";
import * as mod from "https://deno.land/std@0.154.0/encoding/base64.ts";

const readData = await Deno.readFile("./bg.jpg");
const encodedData = mod.encode(readData);
const dataUrl = `data:image/jpeg;base64,${encodedData}`;

const handler = router({
  "GET@/": (_req) => {
    //get querystring
    const url = new URL(_req.url);
    const search = url.search;
    const line1 = url.searchParams.get("line1");
    const line2 = url.searchParams.get("line2");
    const line3 = url.searchParams.get("line3");
    const author = url.searchParams.get("author");

    const html = `
      <html>
      <head>
        <style>body{background: #ddd;}</style>
        <meta property="og:title" content="Deno Haiku">
        <meta property="og:image" content="https://haiku.deno.dev/ogp.png${search}">
      </head>
      <body>
      <form action="/" method="get">
      <div><label>Line1</label><input type="text" name="line1" value="${line1}"></div>
      <div><label>Line2</label><input type="text" name="line2" value="${line2}"></div>
      <div><label>Line3</label><input type="text" name="line3" value="${line3}"></div>
      <div><label>Author</label><input type="text" name="author" value="${author}"></div>
      <button class="btn">Update</button>
      </form>
      <img src="./ogp.png${search}" />
      </body>
      </html>
    `;

    return new Response(
      html,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  },
  "GET@/ogp.png": async (_req) => {
    const url = new URL(_req.url);
    const line1 = url.searchParams.get("line1");
    const line2 = url.searchParams.get("line2");
    const line3 = url.searchParams.get("line3");
    const author = url.searchParams.get("author");

    try {
      const data = await render(`<?xml version="1.0" encoding="UTF-8"?>
        <svg width="800" height="600" viewBox="0 0 800 600" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <image href="${dataUrl}" x="0" y="0" height="600" width="800" />
            <g>
                <text id="test-text" font-family="sans-serif" font-size="32" font-weight="bold" fill="#111827">
                  <tspan x="51" y="${200 + 60 * 0}">${line1}</tspan>
                  <tspan x="51" y="${200 + 60 * 1}">${line2}</tspan>
                  <tspan x="51" y="${200 + 60 * 2}">${line3}</tspan>
                </text>
                <text id="monospace" font-family="monospace" font-size="32" font-weight="normal" fill="#2D53A4">
                    <tspan x="502" y="400" text-anchor="end">- ${author}</tspan>
                </text>
            </g>
        </svg>`);

      const imageBlob = new Blob([data], { type: "image/png" });
      const res = new Response(imageBlob, {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "image/png",
          "Content-Length": String(imageBlob.size),
        },
      });
      return res;
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  },
});

await serve(handler);
