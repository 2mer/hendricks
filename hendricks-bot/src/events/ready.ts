import { Client } from 'discord.js';
import Scope from '../types/Scope';
import Event from '../types/Event';

export default {
	name: 'ready',
	once: true,
	execute: async (scope: Scope, client: Client) => {
		console.log(`Ready! Logged in as ${client.user!.tag}`);
	},
} as Event;
