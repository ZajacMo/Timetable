// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// 在渲染进程和主进程之间建立安全的通信桥梁
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口操作相关API
  setWindowTitle: (title) => ipcRenderer.send('set-window-title', title),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // 消息对话框相关API
  showMessage: (message, type = 'info') => ipcRenderer.send('show-message', message, type),
  
  // 文件操作相关API
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: (options) => ipcRenderer.invoke('open-file', options),
  
  // 打印相关API
  print: () => ipcRenderer.send('print'),
  
  // 主题相关API
  toggleTheme: () => ipcRenderer.send('toggle-theme'),
  
  // 数据导出导入相关API
  exportData: () => ipcRenderer.send('export-data'),
  importData: (filePath) => ipcRenderer.send('import-data', filePath),
  
  // 接收主进程发送的事件
  onDataExported: (callback) => ipcRenderer.on('data-exported', (event, ...args) => callback(...args)),
  onDataImported: (callback) => ipcRenderer.on('data-imported', (event, ...args) => callback(...args)),
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', (event, ...args) => callback(...args)),
  onCurrentWeekChanged: (callback) => ipcRenderer.on('current-week-changed', (event, ...args) => callback(...args)),
  
  // 系统相关API
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // 注册全局快捷键
  registerShortcut: (accelerator, callback) => {
    const id = `shortcut-${Date.now()}`;
    ipcRenderer.send('register-shortcut', { id, accelerator });
    ipcRenderer.on(`shortcut-${id}`, callback);
    return () => ipcRenderer.send('unregister-shortcut', id);
  },
  
  // 获取应用版本信息
  getAppVersion: () => {
    const { app } = require('electron');
    return app.getVersion();
  },
  
  // 退出应用
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // 检查更新
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // 监听更新事件
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
});

// 暴露Node.js API供渲染进程使用（需要谨慎使用）
contextBridge.exposeInMainWorld('nodeAPI', {
  // 文件系统操作
  fs: {
    readFile: (path, options) => ipcRenderer.invoke('fs-read-file', path, options),
    writeFile: (path, data, options) => ipcRenderer.invoke('fs-write-file', path, data, options),
    appendFile: (path, data, options) => ipcRenderer.invoke('fs-append-file', path, data, options),
    exists: (path) => ipcRenderer.invoke('fs-exists', path),
    mkdir: (path, options) => ipcRenderer.invoke('fs-mkdir', path, options),
    rmdir: (path, options) => ipcRenderer.invoke('fs-rmdir', path, options),
    unlink: (path) => ipcRenderer.invoke('fs-unlink', path),
    readdir: (path, options) => ipcRenderer.invoke('fs-readdir', path, options),
    stat: (path) => ipcRenderer.invoke('fs-stat', path),
  },
  
  // 路径操作
  path: {
    join: (...paths) => ipcRenderer.invoke('path-join', ...paths),
    resolve: (...paths) => ipcRenderer.invoke('path-resolve', ...paths),
    dirname: (path) => ipcRenderer.invoke('path-dirname', path),
    basename: (path, ext) => ipcRenderer.invoke('path-basename', path, ext),
    extname: (path) => ipcRenderer.invoke('path-extname', path),
  },
  
  // 操作系统相关信息
  os: {
    platform: () => ipcRenderer.invoke('os-platform'),
    homedir: () => ipcRenderer.invoke('os-homedir'),
    username: () => ipcRenderer.invoke('os-username'),
    release: () => ipcRenderer.invoke('os-release'),
  },
  
  // 网络相关操作
  net: {
    ping: (host) => ipcRenderer.invoke('net-ping', host),
    getNetworkInterfaces: () => ipcRenderer.invoke('net-get-network-interfaces'),
  },
  
  // 系统剪贴板操作
  clipboard: {
    writeText: (text) => ipcRenderer.send('clipboard-write-text', text),
    readText: () => ipcRenderer.invoke('clipboard-read-text'),
    writeImage: (image) => ipcRenderer.send('clipboard-write-image', image),
    readImage: () => ipcRenderer.invoke('clipboard-read-image'),
  },
  
  // 进程相关操作
  process: {
    getMemoryInfo: () => ipcRenderer.invoke('process-get-memory-info'),
    getCPUUsage: () => ipcRenderer.invoke('process-get-cpu-usage'),
    getVersion: () => ipcRenderer.invoke('process-get-version'),
    exit: (code) => ipcRenderer.send('process-exit', code),
  },
  
  // 实用工具函数
  utils: {
    generateId: () => ipcRenderer.invoke('utils-generate-id'),
    formatDate: (date, format) => ipcRenderer.invoke('utils-format-date', date, format),
    parseDate: (dateString) => ipcRenderer.invoke('utils-parse-date'),
    sleep: (ms) => ipcRenderer.invoke('utils-sleep', ms),
  },
});

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('渲染进程错误:', event.error);
  ipcRenderer.send('renderer-error', {
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  // 阻止默认行为，避免控制台重复输出
  event.preventDefault();
});

// 全局未捕获的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未捕获的Promise拒绝:', event.reason);
  ipcRenderer.send('renderer-unhandled-rejection', {
    reason: event.reason ? event.reason.message || String(event.reason) : 'Unknown reason',
    stack: event.reason ? event.reason.stack : '',
  });
  // 阻止默认行为
  event.preventDefault();
});

// 初始化时发送准备就绪信号
ipcRenderer.send('renderer-ready');

// 监听键盘快捷键
window.addEventListener('keydown', (event) => {
  // Ctrl/Cmd + S 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'save');
  }
  
  // Ctrl/Cmd + Z 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'undo');
  }
  
  // Ctrl/Cmd + Y 重做
  if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'redo');
  }
  
  // Ctrl/Cmd + F 查找
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'find');
  }
  
  // Esc 取消操作
  if (event.key === 'Escape') {
    ipcRenderer.send('keyboard-shortcut', 'cancel');
  }
  
  // F1 帮助
  if (event.key === 'F1') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'help');
  }
  
  // F5 刷新
  if (event.key === 'F5') {
    event.preventDefault();
    ipcRenderer.send('keyboard-shortcut', 'refresh');
  }
});

// 监听页面加载完成事件
window.addEventListener('load', () => {
  ipcRenderer.send('page-loaded');
});

// 监听页面关闭事件
window.addEventListener('beforeunload', () => {
  ipcRenderer.send('page-unloading');
});