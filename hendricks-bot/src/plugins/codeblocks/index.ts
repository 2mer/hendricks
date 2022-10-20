import Plugin from '@hendricks/types/Plugin';
import codeblockReactions from './codeblockReactions';
import codeblockRunner from './codeblockRunner';
import commands from './commands';

export default {
	id: 'codeblock-reactions',
	start() {
		codeblockReactions();
		codeblockRunner();
	},
	commands,
} as Plugin;
