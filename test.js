var flogger = require('./index.js');

function main ()
{
	console.log("flogger.set_level('all');");
	flogger.set_level('all');
	
	flogger.info('All');
	flogger.debug('of');
	flogger.trace('these');
	flogger.warn('should');
	flogger.error('appear');

	console.log('----');

	console.log("flogger.set_level('trace');");
	flogger.set_level('trace');
	
	flogger.info('All');
	flogger.debug('of');
	flogger.trace('these');
	flogger.warn('should');
	flogger.error('appear too');

	console.log('----');

	console.log("flogger.set_level('debug');");
	flogger.set_level('debug');

	flogger.trace('This should not appear.');
	flogger.debug('But');
	flogger.info('these');
	flogger.warn('should');
	flogger.error('appear');

	console.log('----');

	console.log("flogger.set_level('info');");
	flogger.set_level('info');

	flogger.trace('This should not appear.');
	flogger.debug('This too.');
	flogger.info('these');
	flogger.warn('should');
	flogger.error('appear');

	console.log('----');

	console.log("flogger.set_level('warn');");
	flogger.set_level('warn');

	flogger.trace('This should not appear.');
	flogger.debug('This too.');
	flogger.info('And this');
	flogger.warn('This');
	flogger.error('appear');

	console.log('----');

	console.log("flogger.set_level('error');");
	flogger.set_level('error');

	flogger.trace('This should not appear.');
	flogger.debug('This too.');
	flogger.info('And this');
	flogger.warn('This');
	flogger.error('but this should appear');

	console.log('----');

	console.log("flogger.set_level('off');");
	flogger.set_level('off');
	
	flogger.info('None');
	flogger.debug('of');
	flogger.trace('these');
	flogger.warn('should');
	flogger.error('appear');
}
main();