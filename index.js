const http = require("http");
const WebSocket = require("ws");

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200);
    res.end("Servidor Globed con WebSocket activo ✅");
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Crear servidor WebSocket usando el servidor HTTP
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  // Enviar mensaje al cliente al conectar
  ws.send("¡Bienvenido al servidor Globed!");

  // Escuchar mensajes recibidos del cliente
  ws.on("message", (message) => {
    console.log(`Mensaje recibido: ${message}`);

    // Responder a cliente
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
