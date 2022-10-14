import { Client } from "discord.js";
import { ClientExtras } from "../extra";

export default interface Event {
	name: string;
	once: boolean;
	execute: (extras: ClientExtras, client: Client, ...args: any[]) => Promise<void>;
};
