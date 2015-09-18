var fs = require('fs');
var os = require('os');
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
	return util.format('%s:%s', s.getFileName().split(path.sep).pop(), s.getLineNumber());
};

function current_file ()
{
	return stack_step().getFileName();
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
var streams = {'ALL':[process.stdout]};

function Flogger () {
	current_level[current_file()] = levels[(process.env['GLOBAL_LOG_LEVEL'] || 'all').toUpperCase()];
};
Flogger.prototype.info = function ()
{
	this.write_stream('INFO', arguments);
}
Flogger.prototype.debug = function ()
{
	this.write_stream('DEBUG', arguments);
}
Flogger.prototype.trace = function ()
{
	this.write_stream('TRACE', arguments);
}
Flogger.prototype.error = function ()
{
	this.write_stream('ERROR', arguments);
}
Flogger.prototype.warn = function ()
{
	this.write_stream('WARN', arguments);
}
Flogger.prototype.write_stream = function (level, args)
{
	var f = stack_step();
	if (levels[level] < current_level[f.getFileName()])
		return;
	var msg = util.format.apply(util, args);
	msg = util.format.apply(util, ['[%s] #%s %s (%s) %s', now(), process.pid, level, current_line()].concat(msg));
	msg += os.EOL;
	var outputs = [level, 'ALL'];
	for (var j = 0; j < outputs.length; j++)
	{
		if (streams[outputs[j]])
			for (var k = 0; k < streams[outputs[j]].length; k++)
				streams[outputs[j]][k].write(msg);
	}
	//streams['ALL'].write(msg);
}
Flogger.prototype.set_level = function (new_level)
{
	current_level[current_file()] = levels[new_level.toUpperCase().trim()];
}
Flogger.prototype.add_log_output = function (level, target)
{
	level = level.trim().toUpperCase();

	if (levels[level] === undefined)
		throw new Error("Invalid level '" + level + "'");
	if (target instanceof Array)
		return streams[level] = target;

	if (target === null || target === undefined)
		target = levels[level] > levels['INFO'] ? process.stderr : process.stdout;
	if (typeof target.valueOf() == 'string')
		target = fs.openSync(target, 'a');
	if (typeof target.valueOf() == 'number')
		target = fs.createWriteStream('/dev/null', {'flags':'a', 'fd':target});
	if (!streams[level])
		streams[level] = [];

	streams[level].push(target);
}
Flogger.prototype.profile = function ()
{
	if (arguments.length === 0)
		return {time:tick()};

	return tick() - arguments[0].time;
}

function createFlogger () { return new Flogger(arguments) };

module.exports = createFlogger();
