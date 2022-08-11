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

    return msg.reply(
      simpleEmbed("12 Science Class timetable")
      .setImage(
        "https://cdn.discordapp.com/attachments/836606519998152704/1003719954975178812/unknown.png"
      )
      .setTimestamp()
    );
  }
}

module.exports = Timetable;
