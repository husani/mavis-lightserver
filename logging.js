/**
 * Singleton-creating wrapper for Winston logging.
 * Original source: http://www.snyders.co.uk/2013/04/11/async-logging-in-node-js-just-chill-winston/
 * Modified by HSO
 */

var Config = require('./config');
var winston = require('winston');
var fs = require('fs');

//make sure log directory exists. create if it doesn't.
fs.exists(Config.logging.log_file_directory, function(exists) {
    if (!exists) {
    	console.log("LOGGING: Log directory does not exist, creating...");
		fs.mkdir(Config.logging.log_file_directory, function(err) {
		    if (err) throw err;
		    console.log("LOGGING: Log directory successfully created.");
		});    
    }
});

//define custom levels
var custom_levels = {
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3
	},
	colors: {
		debug: 'blue',
		info: 'green',
		warn: 'yellow',
		error: 'red'
	}
};

/**
 * Set up winston logging 
 */

//DataParser
var lightserver_logger = new(winston.Logger)({
	level: 'debug',
	levels: custom_levels.levels,
	transports: [
		//CONSOLE -- during dev, level=debug. during prod, level=error
		new(winston.transports.Console)({
			level: 'debug',
			levels: custom_levels.levels,
			colorize: true
		}),
		//FILE -- during dev, level=info. during prod, level=info
		new(winston.transports.File)({
			level: 'debug',
			levels: custom_levels.levels,			
			filename: Config.logging.log_file_directory + Config.logging.filename,
            maxsize: 1024 * 1024 * 10 // 10MB
		})
	]
});

//create singleton
var Logging = function(){
	var loggers = {};
    // always return the singleton instance, if it has been initialised once already.
	if(Logging.prototype._singletonInstance){
		return Logging.prototype._singletonInstance;
	}
	this.getLogger = function(name){
		return loggers[name];
	}
	this.get = this.getLogger;
	
    loggers[Config.logging.filename] = lightserver_logger;

	Logging.prototype._singletonInstance = this;
}

//instantiate and export module
new Logging();
exports.Logging = Logging;