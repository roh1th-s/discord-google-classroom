import { Client, Message } from "discord.js";
import { IConfig } from "../config";

export interface CommandContext {
    msg : Message,
    cfg : IConfig,
    prefix : string,
    args : Array<string>
}

export interface ICommand {
    client : Client;
    name : string;
    aliases : Array<string>;
    description : string;
    usage : string;
    execute(ctx : CommandContext) : any;
}