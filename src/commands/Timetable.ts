import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import { simpleEmbed } from "../utils/embedUtil";

class Timetable implements ICommand {
  client: Client;
  name: string;
  aliases: string[];
  description: string;
  usage: string;

  constructor(client: Client) {
    this.client = client;
    this.name = "timetable";
    this.aliases = ["tt"];
    this.description = "View the timetable";
    this.usage = "tt";
  }

  async execute(ctx: CommandContext) {
    const msg = ctx.msg;
		const prefix = ctx.prefix;
    const correctUsage = `\`${prefix}${this.usage}\``;

    return msg.reply(
      simpleEmbed("12 Science Class timetable")
      .setImage(
        "https://media.discordapp.net/attachments/918949804967620718/988389113554161704/unknown.png"
      )
      .setTimestamp()
    );
  }
}

module.exports = Timetable;
