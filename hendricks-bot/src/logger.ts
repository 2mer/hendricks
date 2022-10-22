import { createLogger, format, transports } from 'winston';
const { LOG_LEVEL = 'error' } = process.env;

const enumerateErrorFormat = format((info) => {
	if (info.message instanceof Error) {
		info.message = Object.assign(
			{
				message: info.message.message,
				stack: info.message.stack,
			},
			info.message
		);
	}

	if (info instanceof Error) {
		return Object.assign(
			{
				message: info.message,
				stack: info.stack,
			},
			info
		);
	}

	return info;
});

const colors = {
	error: '\x1b[41m',
	warn: '\x1b[43m',
	info: '\x1b[44m',
	debug: '\x1b[45m',
};

const labelData = {
	maxSize: 0,
};

export function createLabeledLogger(label: string) {
	labelData.maxSize = Math.max(labelData.maxSize, label.length);

	function getPadding() {
		const amt = labelData.maxSize - label.length;
		return ' '.repeat(amt);
	}

	const logger = createLogger({
		level: LOG_LEVEL,
		format: format.combine(enumerateErrorFormat(), format.json()),
		transports: [
			new transports.Console({
				format: format.combine(
					format.label({ label }),
					format.timestamp({
						format: 'HH-MM:ss',
					}),
					format.prettyPrint(),
					format.printf((info) => {
						return `${
							(colors as any)[info.level] || ''
						} ${info.level.toUpperCase()} \x1b[0m \x1b[90m${
							info.timestamp
						}\x1b[0m \x1b[90m@\x1b[0m ${
							info.label
						}${getPadding()} - ${info.message}${
							info.stack ? `\n\x1b[31m${info.stack}\x1b[0m` : ''
						}`;
					})
				),
			}),
		],
	});

	return logger;
}

const logger = createLabeledLogger('hendricks');

export default logger;
