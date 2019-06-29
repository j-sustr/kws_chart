import { readFile, showErrorBox } from '../requests.js';

const SETTINGS_PATH = `./settings.json`

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