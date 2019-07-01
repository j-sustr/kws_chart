const url = require('url');
const path = require('path');
const electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = electron;
const remote = electron.remote;
//const controller = require('./tableController');

const DEBUG = global.DEBUG;

let mainWindow;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 400,
        minHeight: 400,
        //acceptFirstMouse: true,
        titleBarStyle: 'hidden',
        darkTheme: true,
        show: false, // Don't show the window until it ready, this prevents any white flickering
        webPreferences: {
            nodeIntegration: true
        }
    });
    if (!DEBUG) {
        mainWindow.setMenu(null); // ODSTRANENI MENU
    }
    // Show window when page is ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './mainWindow.html'),
        protocol: 'file',
        slashes: true,
    }));

    mainWindow.on('closed', function () {
        //controller.saveContext(); // UKLADANI NASTAVENI -> AWAIT ASYNC OP
        app.quit();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        ipcMain.emit('main-window-loaded', mainWindow);
    });
});