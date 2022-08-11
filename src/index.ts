import * as fs from "fs";
import * as path from "path";

import express from "express";

import config from "./config";
import Classroom from "./lib/Classroom";
import startBot from "./bot";

import { Server } from "http";

const PORT = config.server.port;

const app = express();
app.get("/authorize", (req, res) =>
  res.json({ ok: true, code: req.query.code })
);

let server: Server | null = null;

const startServer = () => {
  return new Promise((resolve) => {
    server = app.listen(PORT, async () => {
      console.log(`Tokens not found, started Express server on port ${PORT}.`);
      return resolve(null);
    });
  });
};

const run = async () => {
  const foundToken = fs.existsSync(path.join(__dirname, "..", "token.json"));

  if (!foundToken) {
    if (process.env.NODE_ENV == "production") {
      const env = process.env;
      if (env.ACCESS_TOKEN && env.REFRESH_TOKEN && env.TOKEN_EXPIRY_DATE) {
        fs.writeFileSync(
          path.join(__dirname, "..", "token.json"),
          JSON.stringify({
            access_token: env.ACCESS_TOKEN,
            refresh_token: env.REFRESH_TOKEN,
            scope: config.google.scopes.join(" "),
            token_type: "Bearer",
            expiry_date: env.TOKEN_EXPIRY_DATE,
          })
        );
      } else {
        console.error(
          "token.json file not found. Cannot start app in production."
        )
        return;
      }
    } else {
      await startServer();
    }
  }

  const classroom = new Classroom();

  await classroom.authorize();
  await classroom.setCourses();
  await startBot(classroom);

  if (!foundToken && server) {
    server.close();
    console.log("Server stopped.");
  }
};

run();
