import { ICommand, CommandContext } from "../lib/ICommand";
import { resolve } from "path";
import * as fs from "fs";
import { Client } from "discord.js";
import { errorEmbed, successEmbed } from "../utils/embedUtil";

const CONFIG_PATH = resolve(__dirname, "../..", "config.json");

class SetChannel implements ICommand {
  client: Client;
  name: string;
  aliases: string[];
  description: string;
  usage: string;

  constructor(client: Client) {
    this.client = client;
    this.name = "setchannel";
    this.aliases = ["set"];
    this.description = "Set the channel for google classroom updates.";
    this.usage = "set <channel>";
  }

  async execute(ctx: CommandContext) {
    const msg = ctx.msg;
		const args = ctx.args;

    if (args.length) {
      const channel = msg.mentions.channels.first();

      if (channel) {
        //TODO: persist this data
        
        /* try {
          let rawData = fs.readFileSync(CONFIG_PATH, { encoding: "utf8" });
          ctx.cfg.bot = JSON.parse(rawData).bot;
        } catch (err) {
          console.error(err);
        } */

        ctx.cfg.bot.channel = channel.id;

        /* fs.writeFileSync(CONFIG_PATH, JSON.stringify(ctx.cfg, null, 4)); */

        return msg.reply(successEmbed("Settings updated",`<#${channel.id}> set as google classroom channel.`));
      } else {
        return msg.reply(errorEmbed("Error",`Channel not found!`));
      }
    }
  }
}

module.exports = SetChannel;
