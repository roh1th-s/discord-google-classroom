import { Client, Collection } from "discord.js";
import config from "./config";
import check from "./lib/check";
import { IClassroom } from "./lib/IClassroom";
import * as fs from "fs";
import { resolve } from "path";
import { ICommand } from "./lib/ICommand";
import IBot from "./lib/IBot";
import CommandHandler from "./lib/CommandHandler";

let cfg = config;

const bot : IBot = {
  client : new Client(),
  commands: new Collection<string, ICommand>(),
  aliases: new Collection<string, ICommand>(),
};

const cmdHandler = new CommandHandler(bot, cfg);

const TOKEN_PATH = resolve(__dirname, "..", "token.json");

const startBot = async (classroom: IClassroom) => {
  bot.client.on("ready", async () => {
    console.log("Logged in");

    classroom.client.on("tokens", (t) => {
      console.log("Tokens event callback => token has been generated");

      if (t.refresh_token) {
        try {
          let rawJson = fs.readFileSync(TOKEN_PATH, { encoding: "utf-8" });
          let json = JSON.parse(rawJson);

          json.refresh_token = t.refresh_token;
          json.access_token = t.access_token;
          json.expiry_date = t.expiry_date;

          fs.writeFileSync(TOKEN_PATH, JSON.stringify(json));

          console.log(
            "Tokens event callback => New token written to file (token.json)"
          );
        } catch (err) {
          console.error(err);
        }
      }
    });

    let noOfPolls = 0;

    setInterval(async () => {
      if (!cfg.bot.channel) return;
      check(bot.client, classroom, cfg, ++noOfPolls);
    }, cfg.bot.checkInterval * 1000);
  });

  bot.client.on("message", async (msg) => {
    if (process.env.NODE_ENV !== "production" && msg.content === "cr.debug") {
      await check(bot.client, classroom, cfg, 0);
    }
    cmdHandler.handle(msg)
  });

  /* bot.client.on("debug", (info) => {
    console.log(`[DJS] ${info}`);
  }) */
  
  cmdHandler.initializeCommands();
  await bot.client.login(cfg.bot.token);
};

export default startBot;
