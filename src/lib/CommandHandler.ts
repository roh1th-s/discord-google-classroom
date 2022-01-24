import { Message, MessageEmbed } from "discord.js";
import { readdirSync } from "fs";
import { IConfig } from "../config";
import IBot from "./IBot";
import { CommandContext, ICommand } from "./ICommand";

export default class CommandHandler {
  bot: IBot;
  cfg: IConfig;

  constructor(bot: IBot, cfg: IConfig) {
    this.bot = bot;
    this.cfg = cfg;
  }

  public initializeCommands() {
    const bot = this.bot
    const commandFiles = readdirSync("./src/commands").filter((file) =>
      file.endsWith(".ts")
    );
    for (const file of commandFiles) {
      let commandClass = require(`./commands/${file}`);
      if (commandClass.prototype && commandClass.prototype.constructor) {
        let command: ICommand = new commandClass(bot);
        bot.commands.set(command.name, command);
        if (command.aliases.length > 0) {
          for (let alias of command.aliases) {
            bot.aliases.set(alias, command);
          }
        }
      }
    }
  }

  public handle(msg: Message) {
    if (msg.author.bot) return;

    const bot = this.bot;
    const cfg = this.cfg;
    const prefix = cfg.bot.prefix;

    if (!msg.content.startsWith(prefix)) return;

    if (!msg.guild) {
      return;
    }

    const args = msg.content.slice(prefix.length).split(/\s+/);
    const cmdName = args.shift()?.toLowerCase();

    let cmd = bot.commands.has(cmdName!) && bot.commands.get(cmdName!);
    cmd = cmd || (bot.aliases.has(cmdName!) && bot.aliases.get(cmdName!)); //assign if cmd is falsy

    const cmdCtx: CommandContext = { msg, prefix, cfg, args };

    if (cmd) {
      try {
        cmd.execute(cmdCtx);
      } catch (err) {
        console.log(err);

        msg.reply(
          new MessageEmbed()
            .setTitle("Something went wrong")
            .setDescription("Please try again.")
        );
      }
    }
  }
}
