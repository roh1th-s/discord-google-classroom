import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import * as fs from "fs";
import { resolve } from "path";
import { successEmbed } from "../utils/embedUtil";

const CONFIG_PATH = resolve(__dirname, "../..", "config.json");

class SetPingRole implements ICommand {
	client: Client;
	name: string;
	aliases: string[];
	description: string;
	usage: string;

	constructor(client : Client) {
		this.client = client;
		this.name = "setpingrole";
		this.aliases = ["pingrole"];
		this.description = "Set a role for announcement pings.";
		this.usage = "pingrole <role>";
	}

	async execute(ctx : CommandContext) {
		const msg = ctx.msg;
		const prefix = ctx.prefix;
		const args = ctx.args;
		const correctUsage = `\`${prefix}${this.usage}\``;

        if (args.length) {
			const role = msg.mentions.roles.first();
	
			if (role) {
			  try {
				let rawData = fs.readFileSync(CONFIG_PATH, { encoding: "utf8" });
				ctx.cfg = JSON.parse(rawData);
			  } catch (err) {
				console.error(err);
			  }
	
			  ctx.cfg.bot.pingRole = role.id;
	
			  fs.writeFileSync(CONFIG_PATH, JSON.stringify(ctx.cfg, null, 4));
			  
			  return msg.reply(successEmbed("Settings updated",`<@&${role.id}> will be pinged for updates.`));
			}
		  }
    }
}

module.exports = SetPingRole;
