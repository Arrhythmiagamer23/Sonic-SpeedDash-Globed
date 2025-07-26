const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");

const SERVERS_JSON_URL = "https://raw.githubusercontent.com/Omax64MXG4ming/SCGDPS-Globed/main/serverlist/servers.json";

let serverList = [];

// Función para cargar lista de servidores desde URL remota
async function loadServerList() {
  try {
    const response = await axios.get(SERVERS_JSON_URL);
    serverList = response.data;
    console.log("[SCGDPS] Lista de servidores cargada:", serverList);
  } catch (err) {
    console.error("[SCGDPS] Error cargando lista de servidores:", err.message);
  }
}

// Carga inicial de la lista
loadServerList();

setInterval(loadServerList, 100000);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Servidor SCGDPS-Globed WebSocket activo ✅");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
  ws.on("message", async msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }

    if (data.type === "getServerList") {
      ws.send(JSON.stringify({
        type: "serverList",
        servers: serverList
      }));
    }

    if (data.type === "login") {
      const { accountID, password } = data;

      try {
        const resp = await axios.post(
          "https://starcheese.ps.fhgdps.com/checkLogin.php",
          new URLSearchParams({ accountID, password }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const { success, userID, username, error } = resp.data;
        ws.send(JSON.stringify({
          type: "loginResult",
          success,
          userID: userID || null,
          username: username || null,
          error: success ? undefined : error
        }));

        if (success) {
          console.log(`Usuario autenticado: ${username} (ID ${userID})`);
        }
      } catch (e) {
        console.error("Error en request login:", e);
        ws.send(JSON.stringify({ type: "loginResult", success: false, error: "Error interno" }));
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SCGDPS-Globed activo en puerto ${PORT}`));
