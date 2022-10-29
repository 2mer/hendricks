import IReplHandler from '../types/IReplHandler';
import { spawn } from 'node:child_process';

export default {
	id: 'python',
	name: '🐍 Python',

	createProcess() {
		return spawn('python3', ['-i'], { shell: true });
	},
	trimLine: /^\s*?>>>\s*?$/,
} as IReplHandler;
