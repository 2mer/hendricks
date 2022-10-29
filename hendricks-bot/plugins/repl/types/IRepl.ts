import { ThreadChannel } from 'discord.js';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import MessageQueue from '../util/MessageQueue';

export default interface IRepl {
	thread: ThreadChannel;
	process: ChildProcessWithoutNullStreams;
	messageQueue: MessageQueue;
}
