const electron = require('electron');
const { app, dialog, ipcMain: ipc, BrowserWindow } = electron;
const path = require('path');
const { readFile, writeFile, readdir, stat } = require('../lib.js/node/promisified');
//const { readFileIconv } = require('../lib.js/node/readFileIconv');
const { walkDir } = require('../lib.js/node/walkDir');

const data = {};

function readFiles(paths, encodings) {
    const promises = [];
    for (const [path, encoding] of paths.map((p, i) => [p, encodings[i]])) {
        promises.push(readFile(path, encoding).catch(error => { return error }));
    }

    //return 
    //Promise.all(promises).then(values => {
    //
    //});
}

ipc.on('walk-dir', async (event, requestId, { path: dirPath }) => {
    // check dir
    let pathStat;
    try {
        pathStat = await stat(dirPath);
    } catch (error) {
        if (error.code === "ENOENT") error = "invalid-path";
        else error = "unknown";
        event.sender.send(requestId, error);
        return;
    }
    if (!pathStat.isDirectory()) {
        event.sender.send(requestId, "not-dir-path");
        return;
    }

    let fpaths = [];
    for await (const fpath of walkDir(dirPath)) {
        fpaths.push(fpath);
    }
    event.sender.send(requestId, null, { fpaths });
});


ipc.on('list-dir', async (event, requestId, { path: dirPath }) => {
    // check dir
    let pathStat;
    try {
        pathStat = await stat(dirPath);
    } catch (error) {
        if (error.code === "ENOENT") error = "invalid-path";
        else error = "unknown";
        event.sender.send(requestId, error);
        return;
    }
    if (!pathStat.isDirectory()) {
        event.sender.send(requestId, "not-dir-path");
        return;
    }

    //let filter = filter ? new RegExp(filter) : null
    const files = [];
    const dirs = [];
    //for await(const filePath of walkDir(src.path)) {
    const dirContent = await readdir(dirPath, { withFileTypes: true });
    for (const dirItem of dirContent) {
        if (dirItem.isDirectory()) dirs.push(dirItem.name);
        else files.push(dirItem.name);
    }
    event.sender.send(requestId, null, { files, dirs });
});

ipc.on('write-file', async (event, requestId, { path, data, encoding }) => {
    try {
        await writeFile(path, data, encoding);
        event.sender.send(requestId, null);
    } catch (error) {
        error = 'write-error';
        event.sender.send(requestId, error);
    }
});

ipc.on('read-file', async (event, requestId, { path, encoding }) => {
    try {
        event.sender.send(requestId, null, await readFile(path, encoding));
    } catch (error) {
        if (error.code === "ENOENT") error = "invalid-path";
        else if (error.code === "ERR_INVALID_OPT_VALUE_ENCODING") error = "invalid-encoding";
        else error = "unknown";
        event.sender.send(requestId, error);
        return;
    }
});

ipc.on('read-files', async (event, requestId, { paths, encodings }) => {
    try {
        const data = await readFiles(paths, encodings);
        event.sender.send(requestId, null, data);
    } catch (error) {
        error = 'load-error';
        event.sender.send(requestId, error);
    }
});


ipc.on('show-open-dialog', (event, requestId, params) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    dialog.showOpenDialog(window, params.options, (filePaths) => {
        event.sender.send(requestId, null, filePaths);
    });
});

ipc.on('show-error-box', (event, params) => {
    //const window = BrowserWindow.fromWebContents(event.sender);
    dialog.showErrorBox(params.title, params.content);
});

ipc.on('client-ready', (event) => {
    console.log('Receiving client-ready')
    event.sender.send('server-ready');
});