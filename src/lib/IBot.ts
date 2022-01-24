import { Client, Collection } from "discord.js";
import { ICommand } from "./ICommand";

export default interface IBot {
    client : Client,
    commands : Collection<string, ICommand>,
    aliases : Collection<string, ICommand>,
}