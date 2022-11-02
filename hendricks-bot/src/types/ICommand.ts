import { Awaitable, SlashCommandBuilder } from 'discord.js';
import Hendricks from '../Hendricks';

export default interface ICommand {
	slash: SlashCommandBuilder;
	execute: (hendricks: Hendricks, ...args: any[]) => Awaitable<void>;
}
