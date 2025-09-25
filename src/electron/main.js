const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const { format } = require('date-fns');

// 由于我们修改了代码使其在所有情况下都加载本地index.html，不再需要isDev

// 保持对window对象的全局引用，如果不这样做，
// 当JavaScript对象被垃圾回收时，window将自动关闭
let mainWindow;

// 创建Electron主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: '课程表管理系统',
    show: false,
  });

  // 设置应用菜单
  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '导出数据',
          click: () => {
            mainWindow.webContents.send('export-data');
          },
        },
        {
          label: '导入数据',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'JSON Files', extensions: ['json'] }],
              properties: ['openFile'],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('import-data', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Ctrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: '查看',
      submenu: [
        {
          label: '切换主题',
          click: () => {
            mainWindow.webContents.send('toggle-theme');
          },
        },
        { type: 'separator' },
        {
          label: '重新加载',
          accelerator: 'Ctrl+R',
          click: () => mainWindow.webContents.reload(),
        },
        {          
          label: '切换开发者工具',
          accelerator: 'F12', // 使用通用的快捷键F12
          click: () => mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: '关于课程表管理系统',
              message: '课程表管理系统 v2.0.0\n\n跨平台课程、日程管理系统\n支持Windows和Android平台',
              buttons: ['确定'],
              icon: path.join(__dirname, '../../build/icon.ico'),
            });
          },
        },
        {
          label: '使用帮助',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: '使用帮助',
              message: '1. 在课程管理页面添加、编辑、删除课程\n2. 在日程管理页面添加、编辑、删除日程\n3. 在学期设置页面配置学期信息\n4. 在课程表页面查看当前课程安排',
              buttons: ['确定'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 加载应用的index.html
  const startUrl = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  // 当窗口准备好显示时再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 当窗口关闭时，清空引用
  mainWindow.on('closed', () => {
    // 取消引用window对象，如果应用支持多窗口，
    // 通常会把所有window对象存放在一个数组中，
    // 与此同时，你应该删除相应的元素
    mainWindow = null;
  });
}

// 当Electron完成初始化并且准备好创建浏览器窗口时，将调用此方法
// 部分API只能在此事件发生后使用
app.on('ready', createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序及其菜单栏通常保持活动状态，直到用户使用Cmd+Q显式退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，
  // 通常会在应用程序中重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 处理IPC消息
ipcMain.on('set-window-title', (event, title) => {
  if (mainWindow) {
    mainWindow.setTitle(`课程表管理系统 - ${title}`);
  }
});

ipcMain.on('show-message', (event, message, type = 'info') => {
  dialog.showMessageBox(mainWindow, {
    title: type === 'error' ? '错误' : type === 'warning' ? '警告' : '信息',
    message: message,
    buttons: ['确定'],
  });
});

// 处理打印请求
ipcMain.on('print', (event) => {
  if (mainWindow) {
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      color: true,
      margins: {
        marginType: 'default',
      },
      landscape: false,
      scaleFactor: 1.0,
    });
  }
});

// 在这个文件中，你可以继续编写应用程序主进程的所有代码
// 也可以拆分成几个文件，然后用require导入