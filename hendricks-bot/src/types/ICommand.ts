import { Awaitable, Client, SlashCommandBuilder } from 'discord.js';

export default interface ICommand {
	slash: SlashCommandBuilder;
	execute: (client: Client, ...args: any[]) => Awaitable<void>;
}
