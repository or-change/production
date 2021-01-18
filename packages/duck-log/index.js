'use strict';

const normalizeLoggerOptions = require('./src/normalizeLoggerOptions');

DuckLog.Appender = {
	File: require('./src/Appenders/File'),
	Stdout: require('./src/Appenders/Stdout'),
	Stderr: require('./src/Appenders/Stderr'),
	Console: require('./src/Appenders/Console')
};

DuckLog.Format = {
	ApacheCLF: require('./src/Formats/ApacheCLF'),
	ApacheCLFWithVhost: require('./src/Formats/ApacheCLFWithVhost'),
	ApacheECLF: require('./src/Formats/ApacheECLF'),
	// NginxCombined: require('./src/Formats/NginxCombined'),
	InternalError: require('./src/Formats/InternalError'),
	General: require('./src/Formats/General')
};

DuckLog.Adapter = {
	HttpServer: require('./src/Adapters/HttpServer')
};

module.exports = DuckLog;

/**
 * @returns {import('@produck/duck').Component}
 */
function DuckLog(loggersOptions) {
	const finalLoggersOptions = normalizeLoggerOptions(loggersOptions);

	let injection = null;

	const manager = function bootstrap() {
		for (const categoryName in finalLoggersOptions) {
			const options = finalLoggersOptions[categoryName];

			manager[categoryName] = Logger(options, injection);
		}
	};

	return {
		id: 'org.produck.log',
		name: 'DuckLogger',
		install(injection) {
			injection.Log = manager;
		},
		created({ injection: installedInjection }) {
			injection = installedInjection.$create('DuckLog');
		}
	};
}

function Logger(options, injection) {
	const log = { list: [], map: {} };
	const finalOptions = typeof options === 'function' ? options(injection) : options;
	const appenders = finalOptions.AppenderList.map(Appender => Appender());

	function append(message) {
		appenders.forEach(appender => appender.write(message));
	}

	finalOptions.levels.forEach(function (levelName, index) {
		const notPrevented = finalOptions.preventLevels.indexOf(levelName) === -1;

		this.push(log.map[levelName] = notPrevented ? function log(message) {
			return append(finalOptions.format({
				level: {
					name: levelName,
					number: index
				},
				time: new Date(),
				category: finalOptions.label
			}, message));
		} : () => {});
	}, log.list);

	const { defaultLevel } = finalOptions;
	const defaultLog = defaultLevel ? log.map[defaultLevel] : log.list[0];

	function logger(message) {
		return defaultLog(message);
	}

	Object.assign(logger, log.map);

	return logger;
}