import IReplHandler from '../types/IReplHandler';
import { spawn } from 'node:child_process';

export default {
	id: 'node',
	name: '🟨 JS',

	createProcess() {
		return spawn('node', ['-i'], { shell: true });
	},
	trimLine: /^\s*?>\s*?$/,
} as IReplHandler;
