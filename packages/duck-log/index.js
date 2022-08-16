'use strict';

const normalize = require('./src/normalize');
const CategoryLogger = require('./src/CategoryLogger');

module.exports = Object.assign(function DuckLog(options) {
	const finalOptions = normalize(options);

	return {
		id: 'org.produck.log',
		name: 'DuckLogger',
		install(injection) {
			const categoryLoggerRegistry = {};

			function register(options, categoryName) {
				const existed = categoryLoggerRegistry[categoryName];

				if (existed) {
					throw new Error(`The category named ${categoryName} is existed.`);
				}

				categoryLoggerRegistry[categoryName] = CategoryLogger(options, categoryName);
			}

			for (const categoryName in finalOptions) {
				register(finalOptions[categoryName], categoryName);
			}

			function appendCategoryLogger(categoryName, options = true) {
				register(options, categoryName);
			}

			injection.Log = new Proxy(appendCategoryLogger, {
				get(_target, categoryName) {
					const categoryLogger = categoryLoggerRegistry[categoryName];

					if (categoryLogger === undefined) {
						throw new Error(`A category logger named ${categoryName} is NOT found.`);
					}

					return categoryLogger;
				},
				set() {
					throw new Error('Illegal setting.');
				}
			});
		}
	};
}, {
	Appender: Object.freeze({
		File: require('./src/CategoryLogger/Appenders/File'),
		Stdout: require('./src/CategoryLogger/Appenders/Stdout'),
		Stderr: require('./src/CategoryLogger/Appenders/Stderr'),
		Console: require('./src/CategoryLogger/Appenders/Console')
	}),
	Format: Object.freeze({
		ApacheCLF: require('./src/CategoryLogger/Formats/ApacheCLF'),
		ApacheCLFWithVhost: require('./src/CategoryLogger/Formats/ApacheCLFWithVhost'),
		ApacheECLF: require('./src/CategoryLogger/Formats/ApacheECLF'),
		InternalError: require('./src/CategoryLogger/Formats/InternalError'),
		General: require('./src/CategoryLogger/Formats/General')
	}),
	Adapter: Object.freeze({
		HttpServer: require('./src/Adapters/HttpServer')
	})
});
