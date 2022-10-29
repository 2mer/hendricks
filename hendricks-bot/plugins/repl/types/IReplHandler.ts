import { ChildProcessWithoutNullStreams } from 'node:child_process';

export default interface IReplHandler {
	id: string;
	name?: string;

	createProcess(): ChildProcessWithoutNullStreams;

	trimLine: RegExp;
}
