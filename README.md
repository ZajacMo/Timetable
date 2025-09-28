
# 课程表应用

一款基于Vue 3和Cordova开发的课程表应用，支持课程管理、日程安排和设置提醒等功能，可在网页和移动设备上运行。

## 功能特性

- 📅 **课程管理** - 添加、编辑、删除课程信息
- 📝 **日程安排** - 管理个人日程和活动
- ⚙️ **个性化设置** - 主题切换、学期设置、显示选项等
- 🔔 **通知提醒** - 课程和日程的提前提醒功能
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🌙 **深色模式** - 护眼模式支持

## 技术栈

- **前端框架**: Vue 3
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
- **打包工具**: Cordova
- **开发语言**: TypeScript

## 项目结构

```
src/
├── components/        # 组件
│   ├── CourseDialog.vue      # 课程添加/编辑对话框
│   ├── ScheduleDialog.vue    # 日程添加/编辑对话框
│   └── TimetableView.vue     # 课程表视图组件
├── core/              # 核心功能
├── router/            # 路由配置
├── stores/            # 状态管理
│   ├── courses.ts     # 课程数据
│   ├── schedules.ts   # 日程数据
│   └── settings.ts    # 应用设置
├── types/             # 类型定义
├── utils/             # 工具函数
│   └── cordovaLoader.js      # Cordova环境加载器
├── views/             # 页面视图
│   ├── HomeView.vue       # 首页/课程表
│   ├── ScheduleView.vue   # 日程页面
│   └── SettingsView.vue   # 设置页面
├── App.vue            # 主组件
├── main.ts            # 应用入口
└── style.css          # 全局样式
```

## 安装与开发

### 前提条件

- Node.js (推荐 v16.0 或更高版本)
- npm (推荐 v7.0 或更高版本)
- Cordova CLI (可选，用于移动应用构建)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

此命令将启动本地开发服务器，通常运行在 http://localhost:5173/ 上。

### 构建Web应用

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录。

### Cordova相关命令

添加平台:

```bash
npm run cordova:add-android  # 添加Android平台
npm run cordova:add-ios      # 添加iOS平台
```

构建并运行在设备上:

```bash
npm run cordova:run-android  # 构建并运行到Android设备
npm run cordova:run-ios      # 构建并运行到iOS设备
```

## 🔧 开发指南

### 核心模块开发
核心模块位于`src/core/`目录，这部分代码是跨平台共享的，确保遵循以下原则：
- 不依赖任何特定平台的API
- 使用TypeScript确保类型安全
- 实现业务逻辑和数据处理功能

### 组件开发
- 组件位于`src/components/`目录
- 确保组件的可复用性和独立性
- 遵循Vue 3的组合式API风格

### 视图开发
- 页面视图位于`src/views/`目录
- 实现应用的主要页面和布局
- 使用Vue Router进行页面导航

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
