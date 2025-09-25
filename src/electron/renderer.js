// 渲染进程脚本

// 导入核心模块
try {
    // 尝试从预加载的API获取核心模块
    const coreModule = window.electronAPI?.getCoreModule?.();
    
    // 如果没有获取到，尝试直接导入（用于开发环境）
    const { DataManager, MemoryStorage, TimetableRenderer, utils } = coreModule || require('../core/index');

    // 初始化数据管理器
    const storage = new MemoryStorage();
    const dataManager = new DataManager(storage);
    const timetableRenderer = new TimetableRenderer(dataManager);

    // 当前应用状态
    const appState = {
        currentPage: 'timetable',
        currentWeek: 1,
        currentDate: new Date(),
        isDarkMode: false
    };

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', () => {
        console.log('渲染进程初始化中...');
        
        // 初始化应用
        initApp();
    });

    // 初始化应用
    function initApp() {
        // 加载存储的数据
        loadStoredData();
        
        // 初始化UI状态
        initUIState();
        
        // 绑定事件监听
        bindEventListeners();
        
        // 渲染课程表
        renderCurrentTimetable();
        
        console.log('渲染进程初始化完成');
    }

    // 加载存储的数据
    function loadStoredData() {
        try {
            // 加载课程数据
            const courses = dataManager.getCourses();
            console.log('加载课程数据:', courses.length, '门课程');
            
            // 加载学期设置
            const semester = dataManager.getSemester();
            console.log('加载学期设置:', semester);
            
            // 加载日程数据
            const schedules = dataManager.getSchedules();
            console.log('加载日程数据:', schedules.length, '个日程');
            
            // 计算当前周
            if (semester?.startDate) {
                const startDate = new Date(semester.startDate);
                const currentWeek = utils.calculateWeekNumber(startDate, new Date());
                appState.currentWeek = Math.max(1, Math.min(currentWeek, semester.totalWeeks || 24));
            }
            
        } catch (error) {
            console.error('加载数据失败:', error);
            showToast('数据加载失败，使用默认配置', 'error');
            
            // 如果加载失败，创建默认学期
            createDefaultSemester();
        }
    }

    // 创建默认学期
    function createDefaultSemester() {
        try {
            const now = new Date();
            const startDate = new Date(now.getFullYear(), 8, 1); // 9月1日
            
            const defaultSemester = {
                id: 'default',
                name: `${now.getFullYear()}-${now.getFullYear() + 1}学年第一学期`,
                startDate: startDate.toISOString().split('T')[0],
                totalWeeks: 20,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            };
            
            dataManager.setSemester(defaultSemester);
            
            // 添加一些示例课程
            addSampleCourses();
            
        } catch (error) {
            console.error('创建默认学期失败:', error);
        }
    }

    // 添加示例课程
    function addSampleCourses() {
        try {
            const sampleCourses = [
                {
                    name: '高等数学',
                    teacher: '张老师',
                    location: 'A101',
                    dayOfWeek: 1,
                    startSection: 1,
                    endSection: 2,
                    startWeek: 1,
                    endWeek: 18,
                    weekType: 'all',
                    color: '#3498db'
                },
                {
                    name: '大学物理',
                    teacher: '李老师',
                    location: 'B202',
                    dayOfWeek: 2,
                    startSection: 3,
                    endSection: 4,
                    startWeek: 1,
                    endWeek: 18,
                    weekType: 'all',
                    color: '#2ecc71'
                },
                {
                    name: '程序设计基础',
                    teacher: '王老师',
                    location: 'C303',
                    dayOfWeek: 3,
                    startSection: 5,
                    endSection: 6,
                    startWeek: 1,
                    endWeek: 18,
                    weekType: 'all',
                    color: '#e74c3c'
                },
                {
                    name: '大学英语',
                    teacher: '刘老师',
                    location: 'D404',
                    dayOfWeek: 4,
                    startSection: 7,
                    endSection: 8,
                    startWeek: 1,
                    endWeek: 18,
                    weekType: 'all',
                    color: '#f39c12'
                },
                {
                    name: '线性代数',
                    teacher: '赵老师',
                    location: 'E505',
                    dayOfWeek: 5,
                    startSection: 9,
                    endSection: 10,
                    startWeek: 1,
                    endWeek: 18,
                    weekType: 'all',
                    color: '#9b59b6'
                }
            ];
            
            sampleCourses.forEach(course => {
                dataManager.addCourse(course);
            });
            
            console.log('添加了示例课程');
            
        } catch (error) {
            console.error('添加示例课程失败:', error);
        }
    }

    // 初始化UI状态
    function initUIState() {
        // 设置当前周数显示
        const currentWeekNumber = document.getElementById('current-week-number');
        if (currentWeekNumber) {
            currentWeekNumber.textContent = appState.currentWeek;
        }
        
        // 检查暗黑模式设置
        const savedTheme = localStorage.getItem('theme') || 'light';
        appState.isDarkMode = savedTheme === 'dark';
        if (appState.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // 设置应用版本
        const appVersion = document.getElementById('app-version');
        if (appVersion && window.electronAPI?.getAppVersion) {
            try {
                const version = window.electronAPI.getAppVersion();
                appVersion.textContent = `v${version}`;
            } catch (error) {
                console.error('获取版本信息失败:', error);
            }
        }
    }

    // 绑定事件监听器
    function bindEventListeners() {
        // 导航事件
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navigateToPage(item.dataset.page);
            });
        });
        
        // 周切换事件
        document.getElementById('prev-week-btn')?.addEventListener('click', goToPrevWeek);
        document.getElementById('today-btn')?.addEventListener('click', goToToday);
        document.getElementById('next-week-btn')?.addEventListener('click', goToNextWeek);
        
        // 主题切换事件
        document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
        
        // 课程操作事件
        document.getElementById('add-course-btn')?.addEventListener('click', showAddCourseModal);
        document.getElementById('close-course-modal')?.addEventListener('click', hideAddCourseModal);
        document.getElementById('cancel-add-course')?.addEventListener('click', hideAddCourseModal);
        document.getElementById('confirm-add-course')?.addEventListener('click', handleAddCourse);
        
        // 导入导出事件
        document.getElementById('import-btn')?.addEventListener('click', handleImport);
        document.getElementById('export-btn')?.addEventListener('click', handleExport);
        
        // 模态框点击外部关闭
        document.getElementById('add-course-modal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('add-course-modal')) {
                hideAddCourseModal();
            }
        });
    }

    // 导航到指定页面
    function navigateToPage(pageType) {
        if (appState.currentPage === pageType) return;
        
        appState.currentPage = pageType;
        
        // 更新导航状态
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageType);
        });
        
        // 更新页面标题
        const pageTitle = document.getElementById('page-title');
        const titleIcon = document.getElementById('title-icon');
        
        if (pageTitle && titleIcon) {
            switch (pageType) {
                case 'timetable':
                case 'courses':
                    // 合并课程表和课程管理页面
                    pageTitle.querySelector('span:last-child').textContent = '课程中心';
                    titleIcon.textContent = '📚';
                    renderCombinedCoursePage();
                    break;
                case 'schedules':
                    pageTitle.querySelector('span:last-child').textContent = '日程管理';
                    titleIcon.textContent = '🗓️';
                    renderSchedulesList();
                    break;
                case 'semester':
                    pageTitle.querySelector('span:last-child').textContent = '学期设置';
                    titleIcon.textContent = '📋';
                    renderSemesterSettings();
                    break;
            }
        }
    }

    // 渲染组合的课程中心页面（合并课程表和课程管理）
    function renderCombinedCoursePage() {
        try {
            // 获取主内容区域
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;
            
            // 清空主内容
            mainContent.innerHTML = '';
            
            // 创建合并的课程中心页面
            mainContent.innerHTML = `
                <!-- 页面标题 -->
                <h1 class="page-title" id="page-title">
                    <span id="title-icon">📚</span>
                    <span>课程中心</span>
                </h1>

                <!-- 工具栏（统一的工具栏，避免冗余） -->
                <div class="toolbar">
                    <input type="text" class="search-box" id="course-search" placeholder="搜索课程...">
                    <button class="btn btn-primary" id="add-course-btn">添加课程</button>
                    <button class="btn btn-secondary" id="import-btn">导入</button>
                    <button class="btn btn-secondary" id="export-btn">导出</button>
                </div>

                <!-- 当前周信息和控制 -->
                <div class="week-info">
                    <div class="current-week">第<span id="current-week-number">${appState.currentWeek}</span>周</div>
                    <div class="week-controls">
                        <button class="week-control-btn" id="prev-week-btn">上一周</button>
                        <button class="week-control-btn" id="today-btn">今天</button>
                        <button class="week-control-btn" id="next-week-btn">下一周</button>
                    </div>
                </div>

                <!-- 课程表和课程列表容器 -->
                <div class="combined-content">
                    <!-- 课程表区域 -->
                    <div class="timetable-section">
                        <h3 class="section-title">课程表</h3>
                        <div class="timetable-container" id="timetable-container">
                            <table class="timetable">
                                <thead>
                                    <tr>
                                        <th class="time-slot">时间</th>
                                        <th class="day-header">周一</th>
                                        <th class="day-header">周二</th>
                                        <th class="day-header">周三</th>
                                        <th class="day-header">周四</th>
                                        <th class="day-header">周五</th>
                                        <th class="day-header">周六</th>
                                        <th class="day-header">周日</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="time-slot">第1-2节<br>08:00-09:40</td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                    </tr>
                                    <tr>
                                        <td class="time-slot">第3-4节<br>10:00-11:40</td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                    </tr>
                                    <tr>
                                        <td class="time-slot">第5-6节<br>13:30-15:10</td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                    </tr>
                                    <tr>
                                        <td class="time-slot">第7-8节<br>15:30-17:10</td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                    </tr>
                                    <tr>
                                        <td class="time-slot">第9-10节<br>18:30-20:10</td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                        <td class="cell"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 课程列表区域 -->
                    <div class="courses-section">
                        <h3 class="section-title">课程列表</h3>
                        <div id="courses-list-container" class="courses-list-container">
                            <!-- 课程列表内容将通过JavaScript动态生成 -->
                        </div>
                    </div>
                </div>

                <!-- 卡片统计区域 -->
                <div class="card-grid">
                    <div class="card">
                        <div class="card-header">本周课程</div>
                        <div class="card-body">
                            <div id="week-courses-count" class="count">0</div>
                            <div class="label">门课程</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">本月日程</div>
                        <div class="card-body">
                            <div id="month-schedules-count" class="count">0</div>
                            <div class="label">个日程</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">学期进度</div>
                        <div class="card-body">
                            <div id="semester-progress" class="count">0%</div>
                            <div class="label">已完成</div>
                        </div>
                    </div>
                </div>
            `;
            
            // 重新绑定事件
            bindEventListeners();
            
            // 获取所有课程（同时用于课程表和课程列表）
            const allCourses = dataManager.getCourses();
            
            // 获取当前周的课程（用于课程表）
            const currentWeekCourses = dataManager.getCurrentWeekCourses();
            
            // 渲染课程表
            timetableRenderer.renderWebTimetable('#timetable-container table.timetable', currentWeekCourses, appState.currentWeek);
            
            // 渲染课程列表
            const coursesListContainer = document.getElementById('courses-list-container');
            if (coursesListContainer) {
                if (allCourses.length === 0) {
                    coursesListContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="icon">📚</div>
                            <div class="message">暂无课程数据</div>
                            <div class="sub-message">点击"添加课程"按钮开始创建你的第一门课程</div>
                        </div>
                    `;
                } else {
                    coursesListContainer.innerHTML = '';
                    
                    allCourses.forEach(course => {
                        const listItem = document.createElement('div');
                        listItem.className = 'list-item';
                        listItem.dataset.courseId = course.id;
                        
                        const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                        const weekTypes = {
                            all: '每周',
                            odd: '单周',
                            even: '双周'
                        };
                        
                        listItem.innerHTML = `
                            <div class="item-info">
                                <div class="item-title">${course.name}</div>
                                <div class="item-meta">${course.teacher} | ${course.location} | ${days[course.dayOfWeek]} ${course.startSection}-${course.endSection}节 | ${weekTypes[course.weekType]} ${course.startWeek}-${course.endWeek}周</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editCourse('${course.id}')">编辑</button>
                                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteCourse('${course.id}')">删除</button>
                            </div>
                        `;
                        
                        coursesListContainer.appendChild(listItem);
                    });
                }
            }
            
            // 添加搜索功能
            document.getElementById('course-search').addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const filteredCourses = allCourses.filter(course => 
                    course.name.toLowerCase().includes(searchTerm) ||
                    course.teacher.toLowerCase().includes(searchTerm) ||
                    course.location.toLowerCase().includes(searchTerm)
                );
                
                // 重新渲染课程列表
                if (coursesListContainer) {
                    if (filteredCourses.length === 0) {
                        coursesListContainer.innerHTML = `
                            <div class="empty-state">
                                <div class="icon">🔍</div>
                                <div class="message">未找到匹配的课程</div>
                                <div class="sub-message">请尝试其他搜索关键词</div>
                            </div>
                        `;
                    } else {
                        coursesListContainer.innerHTML = '';
                        
                        filteredCourses.forEach(course => {
                            const listItem = document.createElement('div');
                            listItem.className = 'list-item';
                            listItem.dataset.courseId = course.id;
                            
                            const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                            const weekTypes = {
                                all: '每周',
                                odd: '单周',
                                even: '双周'
                            };
                            
                            listItem.innerHTML = `
                                <div class="item-info">
                                    <div class="item-title">${course.name}</div>
                                    <div class="item-meta">${course.teacher} | ${course.location} | ${days[course.dayOfWeek]} ${course.startSection}-${course.endSection}节 | ${weekTypes[course.weekType]} ${course.startWeek}-${course.endWeek}周</div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editCourse('${course.id}')">编辑</button>
                                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteCourse('${course.id}')">删除</button>
                                </div>
                            `;
                            
                            coursesListContainer.appendChild(listItem);
                        });
                    }
                }
            });
            
            // 更新统计信息
            updateStatistics();
            
        } catch (error) {
            console.error('渲染课程中心失败:', error);
            showToast('课程中心渲染失败', 'error');
        }
    }

    // 原渲染课程列表函数（为了兼容现有调用保留，但内部重定向到组合页面）
    function renderCoursesList() {
        navigateToPage('timetable');
    }
    
    // 原渲染课程表函数（为了兼容现有调用保留，但内部重定向到组合页面）
    function renderCurrentTimetable() {
        navigateToPage('timetable');
    }

    // 渲染日程列表
    function renderSchedulesList() {
        try {
            // 获取主内容区域
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;
            
            // 清空主内容
            mainContent.innerHTML = '';
            
            // 创建日程列表页面
            mainContent.innerHTML = `
                <!-- 页面标题 -->
                <h1 class="page-title" id="page-title">
                    <span id="title-icon">🗓️</span>
                    <span>日程管理</span>
                </h1>

                <!-- 工具栏 -->
                <div class="toolbar">
                    <input type="text" class="search-box" placeholder="搜索日程...">
                    <button class="btn btn-primary" id="add-schedule-btn">添加日程</button>
                    <button class="btn btn-secondary" id="import-btn">导入</button>
                    <button class="btn btn-secondary" id="export-btn">导出</button>
                </div>

                <!-- 日程列表 -->
                <div class="list">
                    <div class="list-header">日程列表</div>
                    <div id="schedules-list-container">
                        <!-- 日程列表内容将通过JavaScript动态生成 -->
                    </div>
                </div>
            `;
            
            // 重新绑定事件
            document.getElementById('add-schedule-btn')?.addEventListener('click', showAddScheduleModal);
            document.getElementById('import-btn')?.addEventListener('click', handleImport);
            document.getElementById('export-btn')?.addEventListener('click', handleExport);
            
            // 获取所有日程
            const schedules = dataManager.getSchedules();
            
            // 渲染日程列表
            const schedulesListContainer = document.getElementById('schedules-list-container');
            if (schedulesListContainer) {
                if (schedules.length === 0) {
                    schedulesListContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="icon">🗓️</div>
                            <div class="message">暂无日程数据</div>
                            <div class="sub-message">点击"添加日程"按钮开始创建你的第一个日程</div>
                        </div>
                    `;
                } else {
                    schedulesListContainer.innerHTML = '';
                    
                    schedules.forEach(schedule => {
                        const listItem = document.createElement('div');
                        listItem.className = 'list-item';
                        listItem.dataset.scheduleId = schedule.id;
                        
                        const date = new Date(schedule.date);
                        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        
                        listItem.innerHTML = `
                            <div class="item-info">
                                <div class="item-title">${schedule.title}</div>
                                <div class="item-meta">${formattedDate} ${schedule.startTime} - ${schedule.endTime} | ${schedule.location || '无地点'}</div>
                                <div class="item-meta">${schedule.description || '无描述'}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editSchedule('${schedule.id}')">编辑</button>
                                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="deleteSchedule('${schedule.id}')">删除</button>
                            </div>
                        `;
                        
                        schedulesListContainer.appendChild(listItem);
                    });
                }
            }
            
        } catch (error) {
            console.error('渲染日程列表失败:', error);
            showToast('日程列表渲染失败', 'error');
        }
    }

    // 渲染学期设置页面
    function renderSemesterSettings() {
        try {
            // 获取主内容区域
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;
            
            // 清空主内容
            mainContent.innerHTML = '';
            
            // 获取学期设置
            const semester = dataManager.getSemester();
            
            // 创建学期设置页面
            mainContent.innerHTML = `
                <!-- 页面标题 -->
                <h1 class="page-title" id="page-title">
                    <span id="title-icon">📋</span>
                    <span>学期设置</span>
                </h1>

                <!-- 学期设置表单 -->
                <div class="card">
                    <div class="card-header">学期信息</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="semester-name">学期名称</label>
                            <input type="text" class="form-control" id="semester-name" value="${semester?.name || ''}" placeholder="例如：2023-2024学年第一学期">
                        </div>
                        <div class="form-group">
                            <label for="semester-start-date">开学日期</label>
                            <input type="date" class="form-control" id="semester-start-date" value="${semester?.startDate || ''}">
                        </div>
                        <div class="form-group">
                            <label for="semester-total-weeks">总周数</label>
                            <input type="number" class="form-control" id="semester-total-weeks" min="1" max="52" value="${semester?.totalWeeks || 20}">
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" id="save-semester-btn">保存设置</button>
                    </div>
                </div>
            `;
            
            // 绑定保存按钮事件
            document.getElementById('save-semester-btn')?.addEventListener('click', saveSemesterSettings);
            
        } catch (error) {
            console.error('渲染学期设置失败:', error);
            showToast('学期设置渲染失败', 'error');
        }
    }

    // 保存学期设置
    function saveSemesterSettings() {
        try {
            const semesterName = document.getElementById('semester-name')?.value;
            const semesterStartDate = document.getElementById('semester-start-date')?.value;
            const semesterTotalWeeks = parseInt(document.getElementById('semester-total-weeks')?.value || '20');
            
            // 验证输入
            if (!semesterName || !semesterStartDate) {
                showToast('请填写学期名称和开学日期', 'error');
                return;
            }
            
            if (isNaN(semesterTotalWeeks) || semesterTotalWeeks < 1 || semesterTotalWeeks > 52) {
                showToast('请输入有效的周数（1-52）', 'error');
                return;
            }
            
            // 保存学期设置
            const semester = {
                id: 'default',
                name: semesterName,
                startDate: semesterStartDate,
                totalWeeks: semesterTotalWeeks,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            };
            
            dataManager.setSemester(semester);
            
            // 重新计算当前周
            const startDate = new Date(semesterStartDate);
            const currentWeek = utils.calculateWeekNumber(startDate, new Date());
            appState.currentWeek = Math.max(1, Math.min(currentWeek, semesterTotalWeeks));
            
            showToast('学期设置保存成功', 'success');
            
        } catch (error) {
            console.error('保存学期设置失败:', error);
            showToast('保存学期设置失败', 'error');
        }
    }

    // 上一周
    function goToPrevWeek() {
        if (appState.currentWeek > 1) {
            appState.currentWeek--;
            updateWeekDisplay();
            renderCurrentTimetable();
        }
    }

    // 下一周
    function goToNextWeek() {
        const semester = dataManager.getSemester();
        const maxWeek = semester?.totalWeeks || 24;
        
        if (appState.currentWeek < maxWeek) {
            appState.currentWeek++;
            updateWeekDisplay();
            renderCurrentTimetable();
        }
    }

    // 回到今天
    function goToToday() {
        try {
            const semester = dataManager.getSemester();
            if (semester?.startDate) {
                const startDate = new Date(semester.startDate);
                const currentWeek = utils.calculateWeekNumber(startDate, new Date());
                appState.currentWeek = Math.max(1, Math.min(currentWeek, semester.totalWeeks || 24));
                updateWeekDisplay();
                renderCurrentTimetable();
            } else {
                showToast('请先设置学期开学日期', 'warning');
            }
        } catch (error) {
            console.error('计算当前周失败:', error);
            showToast('计算当前周失败', 'error');
        }
    }

    // 更新周数显示
    function updateWeekDisplay() {
        const currentWeekNumber = document.getElementById('current-week-number');
        if (currentWeekNumber) {
            currentWeekNumber.textContent = appState.currentWeek;
        }
    }

    // 切换主题
    function toggleTheme() {
        appState.isDarkMode = !appState.isDarkMode;
        document.body.classList.toggle('dark-mode', appState.isDarkMode);
        localStorage.setItem('theme', appState.isDarkMode ? 'dark' : 'light');
        showToast(`已切换到${appState.isDarkMode ? '暗黑' : '明亮'}模式`, 'success');
    }

    // 显示添加课程模态框
    function showAddCourseModal() {
        // 确保模态框存在
        let addCourseModal = document.getElementById('add-course-modal');
        
        if (!addCourseModal) {
            // 创建模态框
            addCourseModal = document.createElement('div');
            addCourseModal.className = 'modal';
            addCourseModal.id = 'add-course-modal';
            addCourseModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <span>添加课程</span>
                        <button class="modal-close" id="close-course-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="course-name">课程名称</label>
                            <input type="text" class="form-control" id="course-name" placeholder="请输入课程名称">
                        </div>
                        <div class="form-group">
                            <label for="course-teacher">教师</label>
                            <input type="text" class="form-control" id="course-teacher" placeholder="请输入教师姓名">
                        </div>
                        <div class="form-group">
                            <label for="course-location">地点</label>
                            <input type="text" class="form-control" id="course-location" placeholder="请输入上课地点">
                        </div>
                        <div class="form-group">
                            <label for="course-day">星期几</label>
                            <select class="form-control" id="course-day">
                                <option value="1">周一</option>
                                <option value="2">周二</option>
                                <option value="3">周三</option>
                                <option value="4">周四</option>
                                <option value="5">周五</option>
                                <option value="6">周六</option>
                                <option value="7">周日</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="course-start-section">开始节次</label>
                            <input type="number" class="form-control" id="course-start-section" min="1" max="10" value="1">
                        </div>
                        <div class="form-group">
                            <label for="course-end-section">结束节次</label>
                            <input type="number" class="form-control" id="course-end-section" min="1" max="10" value="2">
                        </div>
                        <div class="form-group">
                            <label for="course-start-week">开始周</label>
                            <input type="number" class="form-control" id="course-start-week" min="1" max="24" value="1">
                        </div>
                        <div class="form-group">
                            <label for="course-end-week">结束周</label>
                            <input type="number" class="form-control" id="course-end-week" min="1" max="24" value="18">
                        </div>
                        <div class="form-group">
                            <label for="course-week-type">周类型</label>
                            <select class="form-control" id="course-week-type">
                                <option value="all">每周</option>
                                <option value="odd">单周</option>
                                <option value="even">双周</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-add-course">取消</button>
                        <button class="btn btn-primary" id="confirm-add-course">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(addCourseModal);
            
            // 绑定事件
            document.getElementById('close-course-modal')?.addEventListener('click', hideAddCourseModal);
            document.getElementById('cancel-add-course')?.addEventListener('click', hideAddCourseModal);
            document.getElementById('confirm-add-course')?.addEventListener('click', handleAddCourse);
            
            // 点击模态框外部关闭
            addCourseModal.addEventListener('click', (e) => {
                if (e.target === addCourseModal) {
                    hideAddCourseModal();
                }
            });
        }
        
        // 显示模态框
        addCourseModal.classList.add('show');
    }

    // 隐藏添加课程模态框
    function hideAddCourseModal() {
        const addCourseModal = document.getElementById('add-course-modal');
        if (addCourseModal) {
            addCourseModal.classList.remove('show');
        }
    }

    // 处理添加课程
    async function handleAddCourse() {
        try {
            console.log('开始处理添加课程');
            // 获取表单数据
            const courseName = document.getElementById('course-name')?.value;
            const courseTeacher = document.getElementById('course-teacher')?.value;
            const courseLocation = document.getElementById('course-location')?.value;
            const courseDay = parseInt(document.getElementById('course-day')?.value || '1');
            const courseStartSection = parseInt(document.getElementById('course-start-section')?.value || '1');
            const courseEndSection = parseInt(document.getElementById('course-end-section')?.value || '2');
            const courseStartWeek = parseInt(document.getElementById('course-start-week')?.value || '1');
            const courseEndWeek = parseInt(document.getElementById('course-end-week')?.value || '18');
            const courseWeekType = document.getElementById('course-week-type')?.value || 'all';
            
            console.log('表单数据:', {courseName, courseTeacher, courseLocation, courseDay, courseStartSection, courseEndSection, courseStartWeek, courseEndWeek, courseWeekType});
            
            // 验证输入
            if (!courseName) {
                console.log('验证失败: 课程名称为空');
                showToast('请输入课程名称', 'error');
                return;
            }
            
            if (courseEndSection < courseStartSection) {
                console.log('验证失败: 结束节次小于开始节次');
                showToast('结束节次不能小于开始节次', 'error');
                return;
            }
            
            if (courseEndWeek < courseStartWeek) {
                console.log('验证失败: 结束周数小于开始周数');
                showToast('结束周数不能小于开始周数', 'error');
                return;
            }
            
            // 生成随机颜色
            const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            // 创建课程对象
            const course = {
                name: courseName,
                teacher: courseTeacher,
                location: courseLocation,
                dayOfWeek: courseDay,
                startSection: courseStartSection,
                endSection: courseEndSection,
                startWeek: courseStartWeek,
                endWeek: courseEndWeek,
                weekType: courseWeekType,
                color: randomColor
            };
            
            console.log('创建课程对象:', course);
            
            // 检查dataManager是否可用
            console.log('dataManager是否存在:', !!dataManager);
            console.log('dataManager.addCourse是否存在:', typeof dataManager.addCourse);
            
            // 添加课程（使用await等待异步操作完成）
            console.log('开始添加课程到dataManager');
            try {
                const result = await dataManager.addCourse(course);
                console.log('课程添加成功，结果:', result);
                
                // 关闭模态框
                hideAddCourseModal();
                
                // 重新渲染视图 - 修复点：无论当前页面是什么，都重新渲染组合课程页面
                // 因为现在应用主要使用组合页面布局
                console.log('重新渲染组合课程页面');
                renderCombinedCoursePage();
                
                showToast(`课程"${courseName}"添加成功`, 'success');
            } catch (addError) {
                console.error('调用dataManager.addCourse失败:', addError);
                console.error('错误详情:', {message: addError.message, stack: addError.stack});
                showToast(`添加课程失败: ${addError.message || '未知错误'}`, 'error');
            }
            
        } catch (error) {
            console.error('添加课程主函数异常:', error);
            console.error('错误详情:', {message: error.message, stack: error.stack});
            showToast('添加课程过程中发生异常', 'error');
        }
    }

    // 显示添加日程模态框
    function showAddScheduleModal() {
        // 创建模态框
        const addScheduleModal = document.createElement('div');
        addScheduleModal.className = 'modal';
        addScheduleModal.id = 'add-schedule-modal';
        addScheduleModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span>添加日程</span>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="schedule-title">日程标题</label>
                        <input type="text" class="form-control" id="schedule-title" placeholder="请输入日程标题">
                    </div>
                    <div class="form-group">
                        <label for="schedule-date">日期</label>
                        <input type="date" class="form-control" id="schedule-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="schedule-start-time">开始时间</label>
                        <input type="time" class="form-control" id="schedule-start-time" value="09:00">
                    </div>
                    <div class="form-group">
                        <label for="schedule-end-time">结束时间</label>
                        <input type="time" class="form-control" id="schedule-end-time" value="10:00">
                    </div>
                    <div class="form-group">
                        <label for="schedule-location">地点</label>
                        <input type="text" class="form-control" id="schedule-location" placeholder="请输入地点">
                    </div>
                    <div class="form-group">
                        <label for="schedule-description">描述</label>
                        <textarea class="form-control" id="schedule-description" rows="3" placeholder="请输入描述"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">取消</button>
                    <button class="btn btn-primary confirm-btn">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(addScheduleModal);
        
        // 显示模态框
        addScheduleModal.classList.add('show');
        
        // 绑定事件
        addScheduleModal.querySelector('.modal-close')?.addEventListener('click', () => {
            document.body.removeChild(addScheduleModal);
        });
        
        addScheduleModal.querySelector('.cancel-btn')?.addEventListener('click', () => {
            document.body.removeChild(addScheduleModal);
        });
        
        addScheduleModal.querySelector('.confirm-btn')?.addEventListener('click', () => {
            handleAddSchedule(addScheduleModal);
        });
        
        // 点击模态框外部关闭
        addScheduleModal.addEventListener('click', (e) => {
            if (e.target === addScheduleModal) {
                document.body.removeChild(addScheduleModal);
            }
        });
    }

    // 处理添加日程
    function handleAddSchedule(modalElement) {
        try {
            // 获取表单数据
            const scheduleTitle = modalElement.querySelector('#schedule-title')?.value;
            const scheduleDate = modalElement.querySelector('#schedule-date')?.value;
            const scheduleStartTime = modalElement.querySelector('#schedule-start-time')?.value;
            const scheduleEndTime = modalElement.querySelector('#schedule-end-time')?.value;
            const scheduleLocation = modalElement.querySelector('#schedule-location')?.value;
            const scheduleDescription = modalElement.querySelector('#schedule-description')?.value;
            
            // 验证输入
            if (!scheduleTitle || !scheduleDate || !scheduleStartTime || !scheduleEndTime) {
                showToast('请填写所有必填项', 'error');
                return;
            }
            
            // 创建日程对象
            const schedule = {
                title: scheduleTitle,
                date: scheduleDate,
                startTime: scheduleStartTime,
                endTime: scheduleEndTime,
                location: scheduleLocation,
                description: scheduleDescription
            };
            
            // 添加日程
            dataManager.addSchedule(schedule);
            
            // 移除模态框
            document.body.removeChild(modalElement);
            
            // 重新渲染日程列表
            if (appState.currentPage === 'schedules') {
                renderSchedulesList();
            }
            
            showToast(`日程"${scheduleTitle}"添加成功`, 'success');
            
        } catch (error) {
            console.error('添加日程失败:', error);
            showToast('添加日程失败', 'error');
        }
    }

    // 处理导入
    function handleImport() {
        try {
            if (window.electronAPI?.showOpenDialog) {
                window.electronAPI.showOpenDialog().then(result => {
                    if (result.canceled || result.filePaths.length === 0) {
                        return;
                    }
                    
                    const filePath = result.filePaths[0];
                    console.log('导入文件路径:', filePath);
                    
                    // 这里可以根据文件类型进行不同的导入处理
                    const fileExtension = filePath.split('.').pop().toLowerCase();
                    
                    if (fileExtension === 'json') {
                        // 读取文件内容
                        window.electronAPI.readFile(filePath).then(content => {
                            try {
                                const data = JSON.parse(content);
                                
                                // 根据数据结构判断导入类型
                                if (data.courses) {
                                    // 导入课程
                                    data.courses.forEach(course => {
                                        dataManager.addCourse(course);
                                    });
                                    showToast(`成功导入${data.courses.length}门课程`, 'success');
                                } else if (data.schedules) {
                                    // 导入日程
                                    data.schedules.forEach(schedule => {
                                        dataManager.addSchedule(schedule);
                                    });
                                    showToast(`成功导入${data.schedules.length}个日程`, 'success');
                                } else if (data.semester) {
                                    // 导入学期设置
                                    dataManager.saveSemester(data.semester);
                                    showToast('成功导入学期设置', 'success');
                                } else {
                                    showToast('文件格式不正确', 'error');
                                }
                                
                                // 重新渲染当前页面
                                if (appState.currentPage === 'timetable') {
                                    renderCurrentTimetable();
                                } else if (appState.currentPage === 'courses') {
                                    renderCoursesList();
                                } else if (appState.currentPage === 'schedules') {
                                    renderSchedulesList();
                                } else if (appState.currentPage === 'semester') {
                                    renderSemesterSettings();
                                }
                                
                            } catch (error) {
                                console.error('解析导入文件失败:', error);
                                showToast('文件格式不正确', 'error');
                            }
                        }).catch(error => {
                            console.error('读取文件失败:', error);
                            showToast('读取文件失败', 'error');
                        });
                    } else {
                        showToast('不支持的文件格式', 'error');
                    }
                }).catch(error => {
                    console.error('打开文件对话框失败:', error);
                    showToast('打开文件对话框失败', 'error');
                });
            } else {
                showToast('导入功能不可用', 'error');
            }
        } catch (error) {
            console.error('导入失败:', error);
            showToast('导入失败', 'error');
        }
    }

    // 处理导出
    function handleExport() {
        try {
            if (window.electronAPI?.showSaveDialog) {
                // 根据当前页面决定导出内容
                let exportData = {};
                let defaultFileName = '';
                
                if (appState.currentPage === 'timetable' || appState.currentPage === 'courses') {
                    // 导出课程
                    exportData = { courses: dataManager.getCourses() };
                    defaultFileName = 'courses.json';
                } else if (appState.currentPage === 'schedules') {
                    // 导出日程
                    exportData = { schedules: dataManager.getSchedules() };
                    defaultFileName = 'schedules.json';
                } else if (appState.currentPage === 'semester') {
                    // 导出学期设置
                    exportData = { semester: dataManager.getSemester() };
                    defaultFileName = 'semester.json';
                } else {
                    // 导出所有数据
                    exportData = {
                        courses: dataManager.getCourses(),
                        schedules: dataManager.getSchedules(),
                        semester: dataManager.getSemester()
                    };
                    defaultFileName = 'timetable_backup.json';
                }
                
                // 转换为JSON字符串
                const jsonContent = JSON.stringify(exportData, null, 2);
                
                window.electronAPI.showSaveDialog(defaultFileName).then(result => {
                    if (result.canceled || !result.filePath) {
                        return;
                    }
                    
                    const filePath = result.filePath;
                    
                    // 写入文件
                    window.electronAPI.writeFile(filePath, jsonContent).then(() => {
                        showToast(`数据已导出到${filePath}`, 'success');
                    }).catch(error => {
                        console.error('写入文件失败:', error);
                        showToast('导出文件失败', 'error');
                    });
                }).catch(error => {
                    console.error('打开保存对话框失败:', error);
                    showToast('打开保存对话框失败', 'error');
                });
            } else {
                showToast('导出功能不可用', 'error');
            }
        } catch (error) {
            console.error('导出失败:', error);
            showToast('导出失败', 'error');
        }
    }

    // 更新统计信息
    function updateStatistics() {
        try {
            // 更新本周课程数
            const weekCoursesCount = document.getElementById('week-courses-count');
            if (weekCoursesCount) {
                const courses = dataManager.getCurrentWeekCourses();
                weekCoursesCount.textContent = courses.length;
            }
            
            // 更新本月日程数
            const monthSchedulesCount = document.getElementById('month-schedules-count');
            if (monthSchedulesCount) {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                
                const schedules = dataManager.getSchedules().filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month;
                });
                
                monthSchedulesCount.textContent = schedules.length;
            }
            
            // 更新学期进度
            const semesterProgress = document.getElementById('semester-progress');
            if (semesterProgress) {
                const semester = dataManager.getSemester();
                if (semester?.startDate && semester.totalWeeks) {
                    const startDate = new Date(semester.startDate);
                    const currentWeek = utils.calculateWeekNumber(startDate, new Date());
                    const progress = Math.min((currentWeek / semester.totalWeeks) * 100, 100);
                    semesterProgress.textContent = `${Math.round(progress)}%`;
                } else {
                    semesterProgress.textContent = '0%';
                }
            }
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }

    // 显示提示消息
    function showToast(message, type = 'info') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 3秒后移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 全局函数，用于处理课程编辑和删除
    window.editCourse = function(courseId) {
        console.log('编辑课程:', courseId);
        // 这里可以实现编辑课程的逻辑
        showToast('编辑功能即将实现', 'info');
    };
    
    window.deleteCourse = function(courseId) {
        if (confirm('确定要删除这门课程吗？')) {
            try {
                dataManager.deleteCourse(courseId);
                renderCoursesList();
                showToast('课程删除成功', 'success');
            } catch (error) {
                console.error('删除课程失败:', error);
                showToast('删除课程失败', 'error');
            }
        }
    };
    
    window.editSchedule = function(scheduleId) {
        console.log('编辑日程:', scheduleId);
        // 这里可以实现编辑日程的逻辑
        showToast('编辑功能即将实现', 'info');
    };
    
    window.deleteSchedule = function(scheduleId) {
        if (confirm('确定要删除这个日程吗？')) {
            try {
                dataManager.deleteSchedule(scheduleId);
                renderSchedulesList();
                showToast('日程删除成功', 'success');
            } catch (error) {
                console.error('删除日程失败:', error);
                showToast('删除日程失败', 'error');
            }
        }
    };

    // 导出核心模块，便于调试和扩展
    window.app = {
        dataManager,
        timetableRenderer,
        utils,
        appState,
        renderCurrentTimetable
    };

} catch (error) {
    console.error('核心模块加载失败:', error);
    
    // 如果加载核心模块失败，显示错误提示并使用模拟数据
    document.addEventListener('DOMContentLoaded', () => {
        showToast('核心模块加载失败，使用离线模式', 'error');
        
        // 初始化基本UI
        initBasicUI();
    });

    // 初始化基本UI
    function initBasicUI() {
        // 这里可以实现一个简单的UI，使用模拟数据
        console.log('使用离线模式初始化UI');
        
        // 绑定所有事件监听器
        bindAllEventListeners();
        
        // 显示模拟的课程表数据
        renderMockTimetable();
    }

    // 绑定所有事件监听器
    function bindAllEventListeners() {
        // 导航事件
        document.querySelectorAll('.nav-item')?.forEach(item => {
            item.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page-id');
                if (pageId) {
                    navigateToPageOffline(pageId);
                }
            });
        });

        // 周切换按钮
        document.getElementById('prev-week-btn')?.addEventListener('click', goToPrevWeekOffline);
        document.getElementById('next-week-btn')?.addEventListener('click', goToNextWeekOffline);
        document.getElementById('today-btn')?.addEventListener('click', goToTodayOffline);

        // 主题切换
        document.querySelector('.theme-toggle')?.addEventListener('click', toggleThemeOffline);

        // 添加课程按钮
        document.getElementById('add-course-btn')?.addEventListener('click', () => {
            showAddCourseModalOffline();
        });

        // 添加日程按钮
        document.getElementById('add-schedule-btn')?.addEventListener('click', () => {
            showToast('添加日程功能在离线模式下可用', 'success');
        });

        // 导入导出按钮
        document.getElementById('import-btn')?.addEventListener('click', () => {
            showToast('导入功能在离线模式下暂不可用', 'info');
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            showToast('导出功能在离线模式下暂不可用', 'info');
        });
    }

    // 离线模式下的页面导航
    function navigateToPageOffline(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            
            // 高亮当前导航项
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-page-id') === pageId) {
                    item.classList.add('active');
                }
            });
            
            // 根据页面类型渲染内容
            if (pageId === 'timetable' || pageId === 'courses') {
                // 对于课程表和课程管理页面，渲染合并的课程中心
                renderCombinedCoursePageOffline(pageId);
            } else if (pageId === 'schedules') {
                renderSchedulesListOffline();
            } else if (pageId === 'semester-settings') {
                renderSemesterSettingsOffline();
            }
        }
    }
    
    // 离线模式下渲染合并的课程中心页面
    function renderCombinedCoursePageOffline(pageId) {
        // 隐藏所有独立页面的内容容器
        document.getElementById('timetable-content')?.classList.add('hidden');
        document.getElementById('courses-list')?.classList.add('hidden');
        document.getElementById('schedules-list')?.classList.add('hidden');
        document.getElementById('semester-settings-content')?.classList.add('hidden');
        
        // 创建合并的内容区域（如果不存在）
        let combinedContent = document.getElementById('combined-course-content');
        if (!combinedContent) {
            combinedContent = document.createElement('div');
            combinedContent.id = 'combined-course-content';
            combinedContent.className = 'combined-course-content';
            document.querySelector('.page-content').appendChild(combinedContent);
        }
        
        // 显示合并的内容区域
        combinedContent.classList.remove('hidden');
        
        // 渲染合并的课程中心内容
        combinedContent.innerHTML = `
            <div class="week-info">
                <div class="current-week">第<span id="current-week-number">${currentWeek}</span>周</div>
                <div class="week-controls">
                    <button class="week-control-btn" id="prev-week-btn">上一周</button>
                    <button class="week-control-btn" id="today-btn">今天</button>
                    <button class="week-control-btn" id="next-week-btn">下一周</button>
                </div>
            </div>
            
            <div class="combined-content">
                <!-- 课程表区域 -->
                <div class="timetable-section">
                    <h3 class="section-title">课程表</h3>
                    <div id="mock-timetable-container"></div>
                </div>
                
                <!-- 课程列表区域 -->
                <div class="courses-section">
                    <h3 class="section-title">课程列表</h3>
                    <div class="courses-grid">
                        <div class="course-item">
                            <div class="course-item-header">高等数学</div>
                            <div class="course-item-info">张老师 | A101</div>
                            <div class="course-item-time">周一 1-2节 | 1-18周</div>
                            <div class="course-item-actions">
                                <button class="btn-edit">编辑</button>
                                <button class="btn-delete">删除</button>
                            </div>
                        </div>
                        <div class="course-item">
                            <div class="course-item-header">大学物理</div>
                            <div class="course-item-info">李老师 | B202</div>
                            <div class="course-item-time">周二 3-4节 | 1-18周</div>
                            <div class="course-item-actions">
                                <button class="btn-edit">编辑</button>
                                <button class="btn-delete">删除</button>
                            </div>
                        </div>
                        <div class="course-item">
                            <div class="course-item-header">程序设计基础</div>
                            <div class="course-item-info">王老师 | C303</div>
                            <div class="course-item-time">周三 5-6节 | 1-18周</div>
                            <div class="course-item-actions">
                                <button class="btn-edit">编辑</button>
                                <button class="btn-delete">删除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 渲染模拟课程表
        renderMockTimetable();
        
        // 为编辑和删除按钮绑定事件
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseName = this.closest('.course-item').querySelector('.course-item-header').textContent;
                showToast(`编辑课程：${courseName}`, 'info');
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseName = this.closest('.course-item').querySelector('.course-item-header').textContent;
                if (confirm(`确定要删除课程：${courseName}吗？`)) {
                    showToast(`已删除课程：${courseName}`, 'success');
                    this.closest('.course-item').remove();
                }
            });
        });
    }

    // 离线模式下的周切换功能
    let currentWeek = 1;
    
    function goToPrevWeekOffline() {
        if (currentWeek > 1) {
            currentWeek--;
            updateWeekDisplayOffline();
            showToast(`已切换到第${currentWeek}周`, 'info');
        }
    }
    
    function goToNextWeekOffline() {
        if (currentWeek < 20) {
            currentWeek++;
            updateWeekDisplayOffline();
            showToast(`已切换到第${currentWeek}周`, 'info');
        }
    }
    
    function goToTodayOffline() {
        currentWeek = 1;
        updateWeekDisplayOffline();
        showToast('已切换到第1周', 'info');
    }
    
    function updateWeekDisplayOffline() {
        const weekNumberElement = document.getElementById('current-week-number');
        if (weekNumberElement) {
            weekNumberElement.textContent = currentWeek;
        }
    }

    // 离线模式下的主题切换
    function toggleThemeOffline() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        showToast(`已切换到${isDarkMode ? '暗黑' : '明亮'}模式`, 'success');
    }

    // 离线模式下的课程列表渲染
    function renderCoursesListOffline() {
        const coursesListContainer = document.getElementById('courses-list');
        if (coursesListContainer) {
            coursesListContainer.innerHTML = `
                <h3>课程列表</h3>
                <div class="courses-grid">
                    <div class="course-item">
                        <div class="course-item-header">高等数学</div>
                        <div class="course-item-info">张老师 | A101</div>
                        <div class="course-item-time">周一 1-2节 | 1-18周</div>
                        <div class="course-item-actions">
                            <button class="btn-edit">编辑</button>
                            <button class="btn-delete">删除</button>
                        </div>
                    </div>
                    <div class="course-item">
                        <div class="course-item-header">大学物理</div>
                        <div class="course-item-info">李老师 | B202</div>
                        <div class="course-item-time">周二 3-4节 | 1-18周</div>
                        <div class="course-item-actions">
                            <button class="btn-edit">编辑</button>
                            <button class="btn-delete">删除</button>
                        </div>
                    </div>
                    <div class="course-item">
                        <div class="course-item-header">程序设计基础</div>
                        <div class="course-item-info">王老师 | C303</div>
                        <div class="course-item-time">周三 5-6节 | 1-18周</div>
                        <div class="course-item-actions">
                            <button class="btn-edit">编辑</button>
                            <button class="btn-delete">删除</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 为编辑和删除按钮绑定事件
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const courseName = this.closest('.course-item').querySelector('.course-item-header').textContent;
                    showToast(`编辑课程：${courseName}`, 'info');
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const courseName = this.closest('.course-item').querySelector('.course-item-header').textContent;
                    if (confirm(`确定要删除课程：${courseName}吗？`)) {
                        showToast(`已删除课程：${courseName}`, 'success');
                        this.closest('.course-item').remove();
                    }
                });
            });
        }
    }

    // 离线模式下的日程列表渲染
    function renderSchedulesListOffline() {
        const schedulesListContainer = document.getElementById('schedules-list');
        if (schedulesListContainer) {
            schedulesListContainer.innerHTML = `
                <h3>日程列表</h3>
                <div class="schedules-list">
                    <div class="schedule-item">
                        <div class="schedule-item-header">班级会议</div>
                        <div class="schedule-item-info">今天 14:00-15:30 | 教学楼A201</div>
                        <div class="schedule-item-actions">
                            <button class="btn-edit">编辑</button>
                            <button class="btn-delete">删除</button>
                        </div>
                    </div>
                    <div class="schedule-item">
                        <div class="schedule-item-header">实验课</div>
                        <div class="schedule-item-info">明天 09:00-11:30 | 实验楼B102</div>
                        <div class="schedule-item-actions">
                            <button class="btn-edit">编辑</button>
                            <button class="btn-delete">删除</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 为编辑和删除按钮绑定事件
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scheduleName = this.closest('.schedule-item').querySelector('.schedule-item-header').textContent;
                    showToast(`编辑日程：${scheduleName}`, 'info');
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const scheduleName = this.closest('.schedule-item').querySelector('.schedule-item-header').textContent;
                    if (confirm(`确定要删除日程：${scheduleName}吗？`)) {
                        showToast(`已删除日程：${scheduleName}`, 'success');
                        this.closest('.schedule-item').remove();
                    }
                });
            });
        }
    }

    // 离线模式下的学期设置渲染
    function renderSemesterSettingsOffline() {
        const settingsContainer = document.getElementById('semester-settings-content');
        if (settingsContainer) {
            settingsContainer.innerHTML = `
                <h3>学期设置</h3>
                <div class="settings-form">
                    <div class="form-group">
                        <label for="semester-name">学期名称</label>
                        <input type="text" id="semester-name" value="2024-2025学年第一学期">
                    </div>
                    <div class="form-group">
                        <label for="semester-start">开学日期</label>
                        <input type="date" id="semester-start" value="2024-09-01">
                    </div>
                    <div class="form-group">
                        <label for="total-weeks">总周数</label>
                        <input type="number" id="total-weeks" value="20" min="1" max="30">
                    </div>
                    <button id="save-settings-btn" class="btn-primary">保存设置</button>
                </div>
            `;
            
            // 为保存按钮绑定事件
            document.getElementById('save-settings-btn')?.addEventListener('click', function() {
                showToast('学期设置已保存', 'success');
            });
        }
    }

    // 离线模式下的添加课程模态框
    function showAddCourseModalOffline() {
        showToast('添加课程功能在离线模式下可用', 'success');
        
        // 创建一个简单的添加课程表单
        const modalHtml = `
            <div class="modal-overlay" id="add-course-modal-offline">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>添加课程</h3>
                        <button class="close-btn" id="close-modal-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>课程名称</label>
                            <input type="text" id="new-course-name" placeholder="请输入课程名称">
                        </div>
                        <div class="form-group">
                            <label>教师</label>
                            <input type="text" id="new-course-teacher" placeholder="请输入教师姓名">
                        </div>
                        <div class="form-group">
                            <label>地点</label>
                            <input type="text" id="new-course-location" placeholder="请输入上课地点">
                        </div>
                        <div class="form-group">
                            <label>星期</label>
                            <select id="new-course-day">
                                <option value="1">周一</option>
                                <option value="2">周二</option>
                                <option value="3">周三</option>
                                <option value="4">周四</option>
                                <option value="5">周五</option>
                                <option value="6">周六</option>
                                <option value="7">周日</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-add-course-btn" class="btn-secondary">取消</button>
                        <button id="confirm-add-course-btn" class="btn-primary">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalHtml;
        const modalElement = tempContainer.firstElementChild;
        document.body.appendChild(modalElement);
        
        // 显示模态框
        modalElement.classList.add('show');
        
        // 绑定事件
        document.getElementById('close-modal-btn')?.addEventListener('click', hideAddCourseModalOffline);
        document.getElementById('cancel-add-course-btn')?.addEventListener('click', hideAddCourseModalOffline);
        document.getElementById('confirm-add-course-btn')?.addEventListener('click', function() {
            const courseName = document.getElementById('new-course-name').value;
            if (courseName) {
                showToast(`课程"${courseName}"添加成功`, 'success');
                hideAddCourseModalOffline();
            } else {
                showToast('请输入课程名称', 'error');
            }
        });
        
        // 点击外部关闭
        modalElement.addEventListener('click', function(e) {
            if (e.target === modalElement) {
                hideAddCourseModalOffline();
            }
        });
    }

    // 隐藏添加课程模态框
    function hideAddCourseModalOffline() {
        const modalElement = document.getElementById('add-course-modal-offline');
        if (modalElement) {
            modalElement.remove();
        }
    }

    // 渲染模拟课程表
    function renderMockTimetable() {
        // 模拟数据
        const mockCourses = [
            {
                id: '1',
                name: '高等数学',
                teacher: '张老师',
                location: 'A101',
                dayOfWeek: 1,
                startSection: 1,
                endSection: 2,
                color: '#3498db'
            },
            {
                id: '2',
                name: '大学物理',
                teacher: '李老师',
                location: 'B202',
                dayOfWeek: 2,
                startSection: 3,
                endSection: 4,
                color: '#2ecc71'
            },
            {
                id: '3',
                name: '程序设计基础',
                teacher: '王老师',
                location: 'C303',
                dayOfWeek: 3,
                startSection: 5,
                endSection: 6,
                color: '#e74c3c'
            },
            {
                id: '4',
                name: '大学英语',
                teacher: '刘老师',
                location: 'D404',
                dayOfWeek: 4,
                startSection: 7,
                endSection: 8,
                color: '#f39c12'
            },
            {
                id: '5',
                name: '线性代数',
                teacher: '赵老师',
                location: 'E505',
                dayOfWeek: 5,
                startSection: 9,
                endSection: 10,
                color: '#9b59b6'
            }
        ];
        
        // 渲染课程
        mockCourses.forEach(course => {
            const rowIndex = Math.floor((course.startSection - 1) / 2);
            const colIndex = course.dayOfWeek;
            
            const row = document.querySelector(`.timetable tbody tr:nth-child(${rowIndex + 1})`);
            if (row) {
                const cell = row.querySelector(`td:nth-child(${colIndex + 1})`);
                if (cell) {
                    const courseElement = document.createElement('div');
                    courseElement.className = 'course';
                    courseElement.style.backgroundColor = course.color;
                    courseElement.style.height = `${(course.endSection - course.startSection + 1) * 40}px`;
                    
                    courseElement.innerHTML = `
                        <div class="course-name">${course.name}</div>
                        <div class="course-info">${course.teacher} ${course.location}</div>
                    `;
                    
                    cell.appendChild(courseElement);
                }
            }
        });
        
        // 更新统计信息
        document.getElementById('week-courses-count')?.textContent = '5';
        document.getElementById('month-schedules-count')?.textContent = '3';
        document.getElementById('semester-progress')?.textContent = '25%';
    }

    // 显示提示消息
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}