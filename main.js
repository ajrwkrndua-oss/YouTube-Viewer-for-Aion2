const { app, BrowserWindow, globalShortcut, ipcMain, Menu, session } = require("electron");
const path = require("path");

let mainWindow = null;
let clickThroughWindow = null;
let clickThroughEnabled = false;
let alwaysOnTopEnabled = true;
let alwaysOnTopRefreshTimer = null;
let syncingAlwaysOnTop = false;

app.commandLine.appendSwitch("disable-background-networking");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-breakpad");
app.commandLine.appendSwitch(
  "disable-features",
  "CalculateNativeWinOcclusion,BackForwardCache,MediaRouter,OptimizationHints,AutofillServerCommunication"
);

function syncAlwaysOnTopState() {
  if (syncingAlwaysOnTop) {
    return;
  }

  syncingAlwaysOnTop = true;
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(alwaysOnTopEnabled, alwaysOnTopEnabled ? "screen-saver" : "normal", 1);
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      if (alwaysOnTopEnabled) {
        mainWindow.moveTop();
      }
    }

    if (clickThroughWindow && !clickThroughWindow.isDestroyed()) {
      clickThroughWindow.setAlwaysOnTop(alwaysOnTopEnabled, alwaysOnTopEnabled ? "screen-saver" : "normal", 1);
      clickThroughWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      if (alwaysOnTopEnabled) {
        clickThroughWindow.moveTop();
      }
    }
  } finally {
    syncingAlwaysOnTop = false;
  }
}

function refreshAlwaysOnTop() {
  if (!alwaysOnTopEnabled) {
    return;
  }

  syncAlwaysOnTopState();

  setTimeout(() => {
    if (alwaysOnTopEnabled) {
      syncAlwaysOnTopState();
    }
  }, 120);
}

function startAlwaysOnTopRefresh() {
  stopAlwaysOnTopRefresh();
  alwaysOnTopRefreshTimer = setInterval(() => {
    refreshAlwaysOnTop();
  }, 1500);
}

function stopAlwaysOnTopRefresh() {
  if (alwaysOnTopRefreshTimer) {
    clearInterval(alwaysOnTopRefreshTimer);
    alwaysOnTopRefreshTimer = null;
  }
}

function repositionClickThroughWindow() {
  if (!mainWindow || !clickThroughWindow || clickThroughWindow.isDestroyed()) {
    return;
  }

  const [x, y] = mainWindow.getPosition();
  const [width] = mainWindow.getSize();
  clickThroughWindow.setPosition(x + width - 126, y + 84);
}

function ensureClickThroughWindow() {
  if (clickThroughWindow && !clickThroughWindow.isDestroyed()) {
    return;
  }

  clickThroughWindow = new BrowserWindow({
    width: 118,
    height: 52,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    focusable: true,
    backgroundColor: "#d68910",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  clickThroughWindow.loadURL(
    "data:text/html;charset=UTF-8," +
      encodeURIComponent(`
        <!doctype html>
        <html lang="ko">
          <head>
            <meta charset="UTF-8" />
            <title>통과 끄기</title>
            <style>
              html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                background: #d68910;
                overflow: hidden;
                font-family: "Segoe UI", sans-serif;
              }
              button {
                width: 100%;
                height: 100%;
                border: 0;
                background: #d68910;
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <button onclick="window.closeClickThrough()">통과 끄기</button>
            <script>
              const { ipcRenderer } = require("electron");
              window.closeClickThrough = () => ipcRenderer.send("disable-click-through");
            </script>
          </body>
        </html>
      `)
  );

  clickThroughWindow.on("closed", () => {
    clickThroughWindow = null;
  });

  syncAlwaysOnTopState();
}

function applyClickThrough(enabled) {
  clickThroughEnabled = Boolean(enabled);

  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.setIgnoreMouseEvents(clickThroughEnabled, { forward: true });

  if (clickThroughEnabled) {
    ensureClickThroughWindow();
    repositionClickThroughWindow();
    clickThroughWindow.show();
    refreshAlwaysOnTop();
    clickThroughWindow.focus();
  } else if (clickThroughWindow && !clickThroughWindow.isDestroyed()) {
    clickThroughWindow.close();
  }

  mainWindow.webContents.send("click-through-changed", clickThroughEnabled);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: false,
    fullscreenable: false,
    transparent: false,
    backgroundColor: "#101215",
    autoHideMenuBar: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      spellcheck: false,
      backgroundThrottling: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.removeMenu();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  mainWindow.setMinimumSize(0, 0);
  syncAlwaysOnTopState();

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Alt") {
      event.preventDefault();
    }
  });

  mainWindow.on("move", repositionClickThroughWindow);
  mainWindow.on("resize", repositionClickThroughWindow);

  ["blur", "focus", "show", "restore", "maximize", "unmaximize"].forEach((eventName) => {
    mainWindow.on(eventName, () => {
      refreshAlwaysOnTop();
    });
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    stopAlwaysOnTopRefresh();
    if (clickThroughWindow && !clickThroughWindow.isDestroyed()) {
      clickThroughWindow.close();
    }
  });

  startAlwaysOnTopRefresh();
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true);
  });

  createWindow();

  globalShortcut.register("CommandOrControl+Shift+X", () => {
    applyClickThrough(false);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  stopAlwaysOnTopRefresh();
  globalShortcut.unregisterAll();
});

ipcMain.on("window-minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("window-close", () => {
  mainWindow?.close();
});

ipcMain.on("window-drag", () => {
  refreshAlwaysOnTop();
});

ipcMain.on("set-always-on-top", (_event, enabled) => {
  alwaysOnTopEnabled = Boolean(enabled);
  syncAlwaysOnTopState();
});

ipcMain.on("set-opacity", (_event, value) => {
  if (!mainWindow) {
    return;
  }

  const opacity = Math.min(1, Math.max(0.25, Number(value) / 100));
  mainWindow.setOpacity(opacity);
});

ipcMain.on("set-ignore-mouse", (_event, enabled) => {
  applyClickThrough(enabled);
});

ipcMain.on("disable-click-through", () => {
  applyClickThrough(false);
});

ipcMain.on("resize-window", (_event, width, height) => {
  if (!mainWindow) {
    return;
  }

  mainWindow.setSize(Number(width), Number(height), true);
  repositionClickThroughWindow();
});
