import { MessageEmbed } from "discord.js";

const EMBED_COLORS = {
  Default: "#2f3136",
  Error: "#ba2d2d",
  Success: "#048c6c"
};

const EMOJIS : {[key: string]: string} = {
    AnimCross : "<a:animcross:858923152456024064>",
    AnimCheck : "<a:animcheck:858923103500894248>"
}

export function simpleEmbed(title: string, description?: string): MessageEmbed {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(description || "")
    .setColor(EMBED_COLORS.Default);
}

export function successEmbed(title: string, description?: string): MessageEmbed {
    return new MessageEmbed()
      .setTitle(title)
      .setDescription(`${EMOJIS.AnimCheck} ${description || ""}`)
      .setColor(EMBED_COLORS.Success);
}
  
export function errorEmbed(title: string, description?: string): MessageEmbed {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(`${EMOJIS.AnimCross} ${description || ""}`)
    .setColor(EMBED_COLORS.Error);
}
