const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let nextProcess;

app.on('ready', () => {
  const env = {
    ...process.env,
    PORT: 3000,
    ELECTRON_RUN_AS_NODE: '1'
  };

  const nextCli = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

  nextProcess = fork(nextCli, ['start'], {
    cwd: __dirname,
    env: env
  });

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "CYBER-LINK Master Terminal",
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a',
  });

  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 3000);
});

app.on('quit', () => {
  if (nextProcess) nextProcess.kill();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});