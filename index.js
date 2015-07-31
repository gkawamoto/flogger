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

function stack_step ()
{
	var s = __stack();
	var k = -1;
	while (s[++k])
	{
		if (s[k].getFileName() != module.filename)
			break;
	};
	return s[k];
}

function current_line ()
{
	var s = stack_step();	
	var function_name = s.getFunction().name;
	if (function_name.length === 0) function_name = '<anonymous>';
	return util.format('%s:%s/%s', s.getFileName().split(path.sep).pop(), s.getLineNumber(), function_name);
};

function current_file ()
{
	var f = stack_step().getFileName();
	//console.log(f);
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

function tick ()
{
	return new Date().getTime();
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

function Flogger () {
	current_level[current_file()] = levels['ALL'];
};
Flogger.prototype.info = function ()
{
	this.do_out('INFO', arguments);
}
Flogger.prototype.debug = function ()
{
	this.do_out('DEBUG', arguments);
}
Flogger.prototype.trace = function ()
{
	this.do_out('TRACE', arguments);
}
Flogger.prototype.error = function ()
{
	this.do_err('ERROR', arguments);
}
Flogger.prototype.warn = function ()
{
	this.do_err('WARN', arguments);
}
Flogger.prototype.do_err = function (level, args)
{
	var f = stack_step();
	if (levels[level] < current_level[f.getFileName()])
		return;
	var msg = util.format.apply(util, args);
	msg = util.format.apply(util, ['[%s] %s (%s) %s', now(), level, current_line()].concat(msg));
	console.error(msg);
}
Flogger.prototype.do_out = function (level, args)
{
	var f = stack_step();
	if (levels[level] < current_level[f.getFileName()])
		return;
	var msg = util.format.apply(util, args);
	msg = util.format.apply(util, ['[%s] %s (%s) %s', now(), level, current_line()].concat(msg));
	//console.log('do_out', f.toString());
	console.log(msg);
}
Flogger.prototype.set_level = function (new_level)
{
	current_level[current_file()] = levels[new_level.toUpperCase().trim()];
}
Flogger.prototype.profile = function ()
{
	if (arguments.length === 0)
		return {time:tick()};

	return tick() - arguments[0].time;
}

function createFlogger () { return new Flogger(arguments) };

module.exports = createFlogger();