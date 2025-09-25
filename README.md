
# 课程表助手 (Timetable App)

一款跨平台的课程表管理应用，支持Windows桌面端和Android移动端。帮助学生和教师高效管理课程安排、查看课程表、设置日程提醒等功能。

## 🚀 特性

- **跨平台支持**：同时支持Windows桌面端和Android移动端
- **课程管理**：添加、编辑、删除和搜索课程
- **课程表视图**：直观的课程表展示，支持周切换
- **日程安排**：添加个人日程提醒
- **学期管理**：设置多个学期，支持切换当前学期
- **数据导入导出**：支持JSON格式数据备份和恢复
- **主题切换**：支持亮色、暗色和跟随系统主题
- **统计信息**：显示本周课程数量、学期进度等统计数据

## 🛠️ 技术栈

### 核心技术
- **TypeScript**：提供类型安全的开发体验
- **React Native**：用于Android移动端开发
- **Electron**：用于Windows桌面端开发
- **React Navigation**：实现移动应用导航
- **React Native Paper**：提供移动应用UI组件
- **Expo**：简化React Native开发流程

### 项目结构
```
Timetable/
├── src/
│   ├── core/          # 核心业务逻辑（共享模块）
│   │   ├── index.ts   # 核心模块导出
│   │   ├── types.ts   # 类型定义
│   │   └── ...        # 其他核心组件
│   ├── electron/      # Electron桌面端代码
│   │   ├── main.js    # 主进程代码
│   │   ├── renderer.js # 渲染进程代码
│   │   └── ...        # 其他Electron相关文件
│   └── react-native/  # React Native移动端代码
│       ├── screens/   # 页面组件
│       ├── App.js     # 应用入口组件
│       └── ...        # 其他React Native相关文件
├── .gitignore         # Git忽略文件配置
├── package.json       # 项目依赖和脚本
├── tsconfig.json      # TypeScript配置
└── README.md          # 项目说明文档
```

## 📱 安装和运行

### 前提条件
- 安装Node.js (v14.0.0或更高版本)
- 安装npm、yarn或pnpm包管理器

### 桌面端（Windows）

1. 克隆项目仓库
```bash
git clone https://your-repository-url.git
cd Timetable
```

2. 安装依赖
```bash
npm install
```

3. 运行开发模式
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### 移动端（Android）

1. 确保已安装React Native开发环境（详见[React Native官方文档](https://reactnative.dev/docs/environment-setup)）

2. 进入React Native项目目录
```bash
cd src/react-native
```

3. 安装依赖
```bash
npm install
```

4. 运行开发模式
```bash
# 使用Expo Go应用
npx expo start

# 或直接在模拟器/设备上运行
npx react-native run-android
```

## 🔧 开发指南

### 核心模块开发
核心模块位于`src/core/`目录，这部分代码是跨平台共享的，确保遵循以下原则：
- 不依赖任何特定平台的API
- 使用TypeScript确保类型安全
- 实现业务逻辑和数据处理功能

### 桌面端开发
Electron相关代码位于`src/electron/`目录：
- `main.js`：处理窗口创建、菜单配置等主进程逻辑
- `renderer.js`：处理UI渲染和用户交互
- `preload.js`：在主进程和渲染进程之间提供安全通信

### 移动端开发
React Native相关代码位于`src/react-native/`目录：
- `App.js`：应用入口组件
- `Navigation.js`：配置应用导航
- `screens/`：包含所有页面组件

## 📝 使用说明

### 添加学期
1. 在学期页面点击"添加学期"按钮
2. 填写学期名称、开始日期、总周数等信息
3. 点击"保存"完成添加
4. 可以设置某个学期为当前学期

### 添加课程
1. 在课程页面点击"添加课程"按钮
2. 填写课程名称、教师、地点、时间等信息
3. 选择课程颜色和周次设置
4. 点击"保存"完成添加

### 查看课程表
1. 在课程表页面可以查看当前学期的课程安排
2. 使用"上一周"和"下一周"按钮切换周次
3. 点击"显示日历"可以通过日历选择日期

### 添加日程
1. 在日程页面点击"添加日程"按钮
2. 填写日程标题、描述、时间等信息
3. 设置是否全天日程和提醒
4. 点击"保存"完成添加

### 数据导入导出
1. 在设置页面可以找到"数据管理"选项
2. 点击"导出数据"可以将所有数据导出为JSON文件
3. 点击"导入数据"可以从JSON文件恢复数据

## 🤝 贡献

欢迎贡献代码！请遵循以下流程：
1. Fork项目仓库
2. 创建新的分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 提交Pull Request

## 📄 许可证

本项目使用MIT许可证

## 📧 联系我们

如有问题或建议，请联系：trae.ai@example.com
