import {listDir, readFile, showErrorBox} from '../requests.js';
const path = require('path');

window.listDir = listDir;


export default async function loadData(dirPath) {
    let contents = await listDir(dirPath);
    let dataGroups = [];

    let filePath;
    let data;
    for (const fileName of contents.files) {
        if (fileName.endsWith('.json')) {
            filePath = path.join(dirPath, fileName);
            try {
                data = await readFile(filePath, 'utf8');
                data = JSON.parse(data);
                let numW = data['n-spot-words'];
                let eer = Math.round(100 * data['eer'] / numW);
                let th = Math.round(data['eer-spot-threshold']);
                data.name = `${fileName.split('.')[0]} (#w=${numW}), EER=${eer}% at th=${th}`;
                dataGroups.push(data);
            } catch (error) {
                showErrorBox(`Data file load error ("${filePath}"): ${error.message}`);
            }
        }
    } 

    return dataGroups;

    //let fpath = 'http://localhost:5000/DIN-KWS-SDNN-tri.json';
    //let fname = fpath.split(/\\+|\/+/g).pop();
    //let d = await fetch(fpath);
    //d = await d.json();
    //d.name = fname.split('.')[0];
    //return [d];
}