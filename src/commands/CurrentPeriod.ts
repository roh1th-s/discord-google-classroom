import { Client, MessageEmbed } from "discord.js";
import { ICommand, CommandContext } from "../lib/ICommand";
import { getCurrentTime, timeStringToMinutes } from "../utils/timeUtils";

const timetable = require("../../data/timetable.json")
const timings = timetable.timings;

class CurrentPeriod implements ICommand{
	client: Client;
	name = "currentperiod";
	aliases = ["periodnow"];
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

		// returns "<day> hh:mm PM"
		let timeString = getCurrentTime(cfg.bot.timezone || "Asia/Kolkata");
		let timeParts = timeString.split(" ")

		let day = timeParts[0];
		let hhmm = timeParts[1].split(":")
		let hours = hhmm[0]
		let currentTimeInMinutes = timeStringToMinutes(timeParts[1]);

		let subjectsForDay = timetable.subjects[day];

		if(!subjectsForDay)
			return msg.reply("No classes scheduled for today.")

		// if(hour == 8 && minutes <= 25){
		// 	return msg.reply("The morning assembly is going on")
		// }
		// else if(hour ) {

		// }

		let subjectIndex

		for(let i = 0; i < timings.length; i++) {
			const timing = timings[i];
			const nextTiming = timings[i + 1];

			if (nextTiming) {
				//convert time from hh:mm format into minutes
				const minutes = timeStringToMinutes(timing);

				subjectIndex = i;

			} else {
				return msg.reply(new MessageEmbed().setTitle("No classes scheduled for now."))
			}
		}

        console.log(timeString);
		
    }
}

module.exports = CurrentPeriod;
