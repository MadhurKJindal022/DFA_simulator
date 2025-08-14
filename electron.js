const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load React build (index.html)
  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Open DevTools (optional, for debugging)
  // win.webContents.openDevTools();
}

app.on('ready', createWindow);
