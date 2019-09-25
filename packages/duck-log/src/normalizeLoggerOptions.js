'use strict';

const { Normalizer, Validator } = require('@or-change/duck');
const AppenderConsole = require('./Appenders/Console');
const GeneralFormat = require('./formats/General');
const schema = require('./LoggerOptionsSchema.json');

const DEFAULT_LEVELS = schema.definitions.defaultLevels.enum = [
	'trace', 'debug', 'info', 'warn', 'error', 'fatal'
];

module.exports = Normalizer({
	defaults: () => {
		return {
			default: {
				label: 'default',
				format: GeneralFormat(),
				levels: DEFAULT_LEVELS.slice(0),
				appenders: [AppenderConsole()],
				preventLevels: [],
				defaultLevel: 'info',
			}
		};
	},
	handler: loggersOptions => {
		const finalLoggersOptions = {};

		for (const categoryName in loggersOptions) {
			const options = loggersOptions[categoryName];

			const finalOptions = {
				label: 'default',
				format: GeneralFormat(),
				levels: DEFAULT_LEVELS.slice(0),
				appenders: [AppenderConsole()],
				preventLevels: [],
				defaultLevel: 'info',
			};

			const {
				label: _label = finalOptions.label,
				format:  _format = finalOptions.format,
				levels: _levels = finalOptions.levels,
				appenders: _appenders = finalOptions.appenders,
				preventLevels: _preventLevels = finalOptions.preventLevels,
				defaultLevel: _defaultLevel = finalOptions.defaultLevel
			} = options;

			finalOptions.label = _label;
			finalOptions.format = _format;
			finalOptions.levels = _levels;
			finalOptions.appenders = _appenders;
			finalOptions.preventLevels = _preventLevels;
			finalOptions.defaultLevel = _defaultLevel;

			finalLoggersOptions[categoryName] = finalOptions;
		}

		return finalLoggersOptions;
	},
	validate: Validator(schema)
});