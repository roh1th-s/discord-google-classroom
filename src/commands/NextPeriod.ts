import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";

const timetable = require("../../data/timetable.json")

class NextPeriod implements ICommand{
	client: Client;
	name: string;
	aliases: string[];
	description: string;
	usage: string;

	constructor(client : Client) {
		this.client = client;
		this.name = "nextperiod";
		this.aliases = ["periodnext"];
		this.description = "See what the next period is.";
		this.usage = "nextperiod";
	}

	async execute(ctx : CommandContext) {
		const msg = ctx.msg;
		const prefix = ctx.prefix;
		const args = ctx.args;
		const correctUsage = `\`${prefix}${this.usage}\``;

        
    }
}

module.exports = NextPeriod;
