import { Client } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import { simpleEmbed } from "../utils/embedUtil";
import { getPeriod, PERIOD_ERROR_TYPE, Period } from "../utils/timetableUtil";

class CurrentPeriod implements ICommand{
	client: Client;
	name = "currentperiod";
	aliases = ["period", "now"];
	description = "See what period is currently going on.";
	usage = "periodnow";

	constructor(client : Client) {
		this.client = client;
	}

	async execute(ctx : CommandContext) {
		const msg = ctx.msg;
		const prefix = ctx.prefix;
		const cfg = ctx.cfg;
		const args = ctx.args;
		const correctUsage = `\`${prefix}${this.usage}\``;

		let [success, period] = getPeriod(cfg.bot.timezone)

		if (success) {
			period = <Period>period;

			//if the link field is an object (not a string), then it's elective
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
				period.isSubject ? `Current period : ${period.name}` : `${period.name} is going on.`,
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
		}
    }
}

module.exports = CurrentPeriod;
