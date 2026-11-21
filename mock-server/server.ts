import { createApp } from "./app";

const port = Number(process.env.PORT ?? 4000);

// Bind ke loopback saja: mock server tidak boleh terbuka ke jaringan lokal.
const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  fetch: createApp(),
});

console.log(`Mock API berita berjalan di http://${server.hostname}:${server.port}`);
