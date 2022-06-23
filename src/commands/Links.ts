import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import { simpleEmbed, errorEmbed } from "../utils/embedUtil";
import { getLinks } from "../utils/timetableUtil";

class Links implements ICommand {
  client: Client;
  name = "links";
  aliases = ["l"];
  description = "View all class links";
  usage = "links";

  constructor(client: Client) {
    this.client = client;
  }

  async execute(ctx: CommandContext) {
    const msg = ctx.msg;

    const links = getLinks();

    let description: string = "";

    if (links && Object.keys(links).length) {
      for (let period in links) {
        let link = (links as any)[period];
        if (typeof(link) != "string") {
            for (let subPeriod in link) {
                description += `**»** [${subPeriod}](${link[subPeriod]})\n`
            }
        } else {
            description += `**»** [${period}](${link})\n`
        }
      }
      msg.reply(simpleEmbed("Links", description));
    } else {
      msg.reply(errorEmbed("Oops", "No links found ¯\\_(ツ)_/¯"));
    }
  }
}

module.exports = Links;
