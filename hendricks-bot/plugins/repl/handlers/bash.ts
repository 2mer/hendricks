import IReplHandler from '../types/IReplHandler';
import { spawn } from 'node:child_process';
import path from 'path';

export default {
	id: 'bash',
	name: '💲 Bash',

	createProcess() {
		return spawn('bash', ['--rcfile', path.join(__dirname, '.bashrc')], {
			shell: true,
		});
	},
	trimLine: /^\s+?\$\s+?$/,
} as IReplHandler;
