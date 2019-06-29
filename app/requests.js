const { ipcRenderer } = require('electron');

class RequestError extends Error {
    constructor(message, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }

        this.name = 'RequestError';
        // Custom debugging information
        this.foo = foo;
        this.date = new Date();
    }
}

const ids = new Proxy({}, { get: (obj, prop) => prop in obj ? obj[prop] : 0 });
const maxId = 20;

function nextId(name) {
    ids[name]++;
    if (ids[name] > maxId) ids[name] = 0;
    return `${name}#${ids[name]}`;
    //return new Date().toISOString();
}

export function makeRequest(name, args) {
    return new Promise((resolve, reject) => {
        const requestId = nextId(name);
        ipcRenderer.once(requestId, (event, err, data) => {
            if (err) reject(new Error(err));
            else resolve(data);
        });
        ipcRenderer.send(name, requestId, args);
    });
}

export function showOpenDialog(options) {
    const requestName = 'show-open-dialog';
    return makeRequest(requestName, options)
}

export function showErrorBox(title, content = '') {
    ipcRenderer.send('show-error-box', { title, content });
}

export function walkDir(path) {
    const requestName = 'walk-dir';
    return makeRequest(requestName, { path });
}

export function listDir(path) {
    const requestName = 'list-dir';
    return makeRequest(requestName, { path });
}

export function writeFile(path, data, encoding) {
    const requestName = 'write-file';
    return makeRequest(requestName, { path, data, encoding })
}

export function readFile(path, encoding) {
    const requestName = 'read-file';
    return makeRequest(requestName, { path, encoding })
}

export function loadAudioDataset(name, paths, encodings) {
    const requestName = 'load-audio-dataset';
    return makeRequest(requestName, { name, paths, encodings })
}

export function getAudioDatasetSlice(datasetName, itemKey, sampleFrom, sampleTo) {
    const requestName = 'audio-slice';
    return makeRequest(requestName, {
        datasetName, itemKey, sampleFrom, sampleTo
    });
}

export function ready() {
    return new Promise((resolve, reject) => {
        //const requestId = `ready#${timestamp()}`;
        ipcRenderer.once('server-ready', (event) => {
            resolve();
        });
        ipcRenderer.send('client-ready');
    });
}