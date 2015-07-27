var path = require('path');
var util = require('util');

function __stack ()
{
	var orig = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack){ return stack; };
	var err = new Error;
	Error.captureStackTrace(err, arguments.callee);
	var stack = err.stack;
	Error.prepareStackTrace = orig;
	return stack;
};

function current_line ()
{
	var s = __stack()[3];
	return util.format('%s:%s', s.getFileName().split(path.sep).pop(), s.getLineNumber());
};

function current_file ()
{
	var f = __stack()[3].getFileName();
	return f;
}

function now ()
{
	var d = new Date();
	return util.format(
		'%s-%s-%s %s:%s:%s.%s',
		d.getFullYear(),
		('00'+(d.getMonth()+1).toString()).substr(-2),
		('00'+d.getDate().toString()).substr(-2),
		('00'+d.getHours().toString()).substr(-2),
		('00'+d.getMinutes().toString()).substr(-2),
		('00'+d.getSeconds().toString()).substr(-2),
		('000'+d.getMilliseconds().toString()).substr(-3)
	);
}

var levels = {
	'ALL':0,
	'TRACE':1,
	'DEBUG':2,
	'INFO':3,
	'WARN':4,
	'ERROR':5,
	'NONE':6,
	'OFF':6
};

var current_level = {};

function Logger () {
	current_level[current_file()] = levels['ALL'];
};
Logger.prototype.info = function ()
{
	this.do_out('INFO', arguments);
}
Logger.prototype.debug = function ()
{
	this.do_out('DEBUG', arguments);
}
Logger.prototype.trace = function ()
{
	this.do_out('TRACE', arguments);
}
Logger.prototype.error = function ()
{
	this.do_err('ERROR', arguments);
}
Logger.prototype.warn = function ()
{
	this.do_err('WARN', arguments);
}
Logger.prototype.do_err = function (level, args)
{
	if (levels[level] < this.current_level)
		return;
	var msg = util.format.apply(util, args);
	msg = util.format.apply(util, ['[%s] %s (%s) %s', now(), level, current_line()].concat(msg));
	console.error(msg);
}
Logger.prototype.do_out = function (level, args)
{
	if (levels[level] < this.current_level)
		return;
	var msg = util.format.apply(util, args);
	msg = util.format.apply(util, ['[%s] %s (%s) %s', now(), level, current_line()].concat(msg));
	console.info(msg);
}
Logger.prototype.set_level = function (new_level)
{
	current_level[current_file()] = levels[new_level.toUpperCase().trim()];
}

function createLogger () { return new Logger(arguments) };

module.exports = createLogger;