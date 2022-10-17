import { Client } from 'discord.js';
import Scope from './Scope';

export default interface Event {
	name: string;
	once: boolean;
	execute: (scope: Scope, client: Client, ...args: any[]) => Promise<void>;
}
