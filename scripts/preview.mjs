import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { paints } from "../site/catalog.js";

const contentTypes = {
  "index.html": "text/html; charset=utf-8",
  "style.css": "text/css; charset=utf-8",
  "app.js": "text/javascript; charset=utf-8",
  "catalog.js": "text/javascript; charset=utf-8",
  "bike.js": "text/javascript; charset=utf-8",
  "mark.svg": "image/svg+xml",
  "yubc-mask.png": "image/png",
  ...Object.fromEntries(paints.flatMap(({photo,swatch}) => [
    [photo.slice(2), "image/jpeg"],
    ...(swatch ? [[swatch.slice(2), "image/png"]] : []),
  ])),
};

export function preview(port = 4173) {
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;
    const file = path === "/" ? "index.html" : path.slice(1);
    if (!Object.hasOwn(contentTypes, file)) {
      response.writeHead(404).end();
      return;
    }
    const data = await readFile(new URL("../site/" + file, import.meta.url));
    response.writeHead(200, {"Content-Type": contentTypes[file]}).end(data);
  });
  return server.listen(port, "127.0.0.1");
}
if (process.argv[1]?.endsWith("preview.mjs")) {
  const server = preview(Number(process.env.PORT ?? 4173));
  server.once("listening", () => console.log("Local: http://127.0.0.1:" + server.address().port));
}
