import { Client } from 'discord.js';
import Command from '../commands/command';
import { ClientExtras } from '../extra';
import Event from './event';

export default {
	name: 'ready',
	once: true,
	execute: async (extras: ClientExtras, client: Client, ...args: any) => {
		console.log(`Ready! Logged in as ${client.user!.tag}`);
	},
} as Event;
