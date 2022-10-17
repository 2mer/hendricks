import { Client } from 'discord.js';
import logger from '../logger';
import Event from '../types/Event';

export default {
	name: 'ready',
	once: true,
	execute: async (client: Client) => {
		logger.info(`Ready! Logged in as ${client.user!.tag}`);
	},
} as Event;
