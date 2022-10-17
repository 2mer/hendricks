import { Client } from 'discord.js';
import Event from '../types/Event';

export default {
	name: 'ready',
	once: true,
	execute: async (client: Client) => {
		console.log(`Ready! Logged in as ${client.user!.tag}`);
	},
} as Event;
