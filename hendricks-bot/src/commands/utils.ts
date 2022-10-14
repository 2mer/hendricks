import { SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";

export function stringOption(name: string, description: string, required: boolean) {
	return (option: SlashCommandStringOption) => option
		.setName(name)
		.setDescription(description)
		.setRequired(required);
}

export function intOption(name: string, description: string, required: boolean) {
	return (option: SlashCommandIntegerOption) => option
		.setName(name)
		.setDescription(description)
		.setRequired(required);
}

export function boolOption(name: string, description: string, required: boolean) {
	return (option: SlashCommandBooleanOption) => option
		.setName(name)
		.setDescription(description)
		.setRequired(required);
}
