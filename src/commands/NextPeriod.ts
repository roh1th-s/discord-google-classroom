import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import { simpleEmbed } from "../utils/embedUtil";
import { getPeriod, PERIOD_ERROR_TYPE, Period } from "../utils/timetableUtil";

class NextPeriod implements ICommand{
	client: Client;
	name = "NextPeriod";
	aliases = ["periodnext", "next"];
	description = "See what the next period is";
	usage = "nextperiod";

	constructor(client : Client) {
		this.client = client;
	}

	async execute(ctx : CommandContext) {
		const msg = ctx.msg;
		const prefix = ctx.prefix;
		const cfg = ctx.cfg;
		const args = ctx.args;
		const correctUsage = `\`${prefix}${this.usage}\``;

		let [success, period] = getPeriod(cfg.bot.timezone, true)

		if (success) {
			period = <Period>period;
			//if the link field is an object (not a string), then it has multiple links
			const hasMultipleLinks = typeof(period.link) != "string";
			let linkInfo = `[Click to join](${period.link})`;

			if (hasMultipleLinks) {
				linkInfo = ""
				for (let subject in <object>period.link) {
					let link = <string>(period.link as any)[subject];

					if (link && link != "") {
						linkInfo += `[${subject}](${link})\n`
					}
				}
			}

			const periodEmbed = simpleEmbed(
				`Next period : ${period.name}`,
				`Start time : \`${period.startTime}\`\tEnd time : \`${period.endTime}\``,	
			)
			if (period.link != "")
				periodEmbed.addField(`Link${hasMultipleLinks ? "s" : ""}`, linkInfo)

			msg.channel.send(periodEmbed);
		} else {
			if (period == PERIOD_ERROR_TYPE.NONE_SCHEDULED_NOW) {
				return msg.reply(simpleEmbed(`No classes are scheduled for now.`));
			}
			else if (period == PERIOD_ERROR_TYPE.NONE_SCHEDULED_TODAY) {
				msg.channel.send(simpleEmbed(`No classes are scheduled for today.`));
			}
			else if (period == PERIOD_ERROR_TYPE.NO_PERIOD_NEXT) {
				msg.channel.send(simpleEmbed(`There are no further classes for today.`));
			}
		}
    }
}

module.exports = NextPeriod;
