const fs = require("fs");
const app = require("./app");
const env = require("./config/env");

fs.mkdirSync(env.uploadsDir, { recursive: true });

app.listen(env.port, () => {
  console.log(`[Centro JAS Naranjo API] escuchando en http://localhost:${env.port} (${env.nodeEnv})`);
});
