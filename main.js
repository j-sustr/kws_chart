
//parser.addArgument(['-d', '--datadir'], { help: 'data dir path' });
//parser.addArgument(['--debug'], { help: 'enable debug mode', action: 'storeTrue' });
let datadirArgIdx = process.argv.findIndex(x => x.trim() === '-d');
let settingsArgIdx = process.argv.findIndex(x => x.trim() === '-s');

let error = false;
if (datadirArgIdx === -1) {
    console.log(`argument [-d datadir] is required`);
    error = true;
}
if (settingsArgIdx === -1) {
    console.log(`argument [-s settings] is required`);
    error = true;
}
if (error) {
    process.exit();
}

global.DEBUG = process.argv.some(arg => arg === '--debug');
global.DATA_DIR = process.argv[datadirArgIdx + 1];
global.SETTINGS_PATH = process.argv[settingsArgIdx + 1];

global.CWD = process.cwd();

require('./app/server');
require('./app/mainWindow');