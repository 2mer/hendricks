const fs = require('fs');

const hendricksBotDependencies = require('../hendricks-bot/package.json');
const packageOverrides = require('./package.json');

const packageJson = { ...hendricksBotDependencies, ...packageOverrides };

delete packageJson.scripts;

if (!fs.existsSync('./publish')) {
	fs.mkdirSync('./publish');
}

fs.writeFileSync(
	'./publish/package.json',
	JSON.stringify(packageJson, undefined, 4)
);
