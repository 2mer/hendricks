import { ThreadChannel } from 'discord.js';
import { ChildProcessWithoutNullStreams } from 'node:child_process';

export default interface IRepl {
	thread: ThreadChannel;
	process: ChildProcessWithoutNullStreams;
}
