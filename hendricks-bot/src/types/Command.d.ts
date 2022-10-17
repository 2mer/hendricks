import { Awaitable, Client, SlashCommandBuilder } from 'discord.js';

export default interface Command {
	slash: SlashCommandBuilder;
	execute: (client: Client, ...args: any[]) => Awaitable<void>;
}
