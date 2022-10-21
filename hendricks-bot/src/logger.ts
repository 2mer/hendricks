import { createLogger, format, transports } from 'winston';
const { LOG_LEVEL = 'error' } = process.env;

export function createLabeledLogger(label: string) {
	const logger = createLogger({
		level: LOG_LEVEL,
		transports: [
			new transports.Console({
				format: format.combine(
					format.label({ label }),
					format.timestamp({
						format: 'HH-MM:ss',
					}),
					format.prettyPrint(),
					format.colorize(),
					format.printf((info) => {
						return `[${info.level}@${info.label}] ${info.timestamp} - ${info.message}`;
					})
				),
			}),
		],
	});

	return logger;
}

const logger = createLabeledLogger('hendricks🤖');

export default logger;
