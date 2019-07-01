
import { readFile, showErrorBox } from '../requests.js';
import { remote } from 'electron';
import path from 'path';

//const CWD = remote.getGlobal('CWD');
const SETTINGS_PATH = remote.getGlobal('SETTINGS_PATH') //path.join(CWD, `settings.json`);

export default async function loadSettings() {
    let settings;
    try {
        settings = await readFile(SETTINGS_PATH);
    } catch (error) {
        showErrorBox(`Settings file read error: ${error.message}`);
        return
    }
    try {
        settings = JSON.parse(settings);
    } catch (error) {
        showErrorBox(`Settings file parse error: ${error.message}`);
        return
    }
    return settings;
}