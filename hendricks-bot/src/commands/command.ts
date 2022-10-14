import { Awaitable, Client, SlashCommandBuilder } from "discord.js";
import { ClientExtras } from "../extra";

export default interface Command {
	slash: SlashCommandBuilder;
	execute: (extras: ClientExtras, client: Client, ...args: any[]) => Awaitable<void>;
};
