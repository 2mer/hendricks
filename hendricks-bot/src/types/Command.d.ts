import { Awaitable, Client, SlashCommandBuilder } from 'discord.js';
import Scope from './Scope';

export default interface Command {
	slash: SlashCommandBuilder;
	execute: (scope: Scope, client: Client, ...args: any[]) => Awaitable<void>;
}
