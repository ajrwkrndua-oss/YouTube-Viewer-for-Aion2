const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlayApi", {
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  drag: () => ipcRenderer.send("window-drag"),
  setAlwaysOnTop: (enabled) => ipcRenderer.send("set-always-on-top", enabled),
  setOpacity: (value) => ipcRenderer.send("set-opacity", value),
  setIgnoreMouse: (enabled) => ipcRenderer.send("set-ignore-mouse", enabled),
  disableClickThrough: () => ipcRenderer.send("disable-click-through"),
  resizeWindow: (width, height) => ipcRenderer.send("resize-window", width, height),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send("move-window", deltaX, deltaY),
  onClickThroughChanged: (callback) => {
    ipcRenderer.on("click-through-changed", (_event, enabled) => callback(enabled));
  }
});
