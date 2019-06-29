require('./app/mainWindow');
require('./app/server');

global.DEBUG = process.argv.some(arg => arg === '--debug');
