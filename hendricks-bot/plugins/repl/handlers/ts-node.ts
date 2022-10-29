import IReplHandler from '../types/IReplHandler';
import { spawn } from 'node:child_process';

export default {
	id: 'ts-node',
	name: '🟦 TS',

	createProcess() {
		return spawn('ts-node', ['-i'], { shell: true });
	},
	trimLine: /^\s*?>\s*?$/,
} as IReplHandler;
