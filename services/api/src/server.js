import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 10000);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "mergehold-td-api",
    });
    return;
  }

  if (url.pathname === "/api/config") {
    sendJson(response, 200, {
      game: "Mergehold TD",
      minClientVersion: "0.1.0",
      features: {
        cloudSaves: false,
        leaderboards: false,
        remoteBalancing: false,
      },
    });
    return;
  }

  sendJson(response, 404, {
    error: "Not found",
  });
});

server.listen(port, () => {
  console.log(`mergehold-td-api listening on ${port}`);
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  response.end(JSON.stringify(payload));
}

