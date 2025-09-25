import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

// 导入核心模块
import { DataManager, MemoryStorage, TimetableRenderer, utils } from '../core/index';

// 导入导航组件
import AppNavigator from './Navigation';

// 主应用组件
const App = () => {
  // 初始化核心模块
  const [dataManager, setDataManager] = useState(null);
  const [timetableRenderer, setTimetableRenderer] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 组件挂载时初始化
  useEffect(() => {
    initializeApp();
  }, []);

  // 初始化应用
  const initializeApp = async () => {
    try {
      // 初始化存储和数据管理器
      const storage = new MemoryStorage();
      const manager = new DataManager(storage);
      const renderer = new TimetableRenderer(manager);

      setDataManager(manager);
      setTimetableRenderer(renderer);

      // 加载存储的数据
      await loadStoredData(manager);

    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  };

  // 加载存储的数据
  const loadStoredData = async (manager) => {
    try {
      // 加载学期设置
      const semester = manager.getSemester();
      console.log('加载学期设置:', semester);

      // 计算当前周
      if (semester?.startDate) {
        const startDate = new Date(semester.startDate);
        const weekNumber = utils.calculateWeekNumber(startDate, new Date());
        setCurrentWeek(Math.max(1, Math.min(weekNumber, semester.totalWeeks || 24)));
      }

      // 如果没有学期设置，创建默认设置
      if (!semester) {
        createDefaultSemester(manager);
      }

    } catch (error) {
      console.error('加载数据失败:', error);
      // 创建默认学期
      createDefaultSemester(manager);
    }
  };

  // 创建默认学期
  const createDefaultSemester = (manager) => {
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

      manager.saveSemester(defaultSemester);
      
      // 添加示例课程
      addSampleCourses(manager);

    } catch (error) {
      console.error('创建默认学期失败:', error);
    }
  };

  // 添加示例课程
  const addSampleCourses = (manager) => {
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
        manager.addCourse(course);
      });

      console.log('添加了示例课程');

    } catch (error) {
      console.error('添加示例课程失败:', error);
    }
  };

  // 等待核心模块初始化完成
  if (!dataManager || !timetableRenderer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <AppNavigator dataManager={dataManager} />
    </PaperProvider>
  );
};

// 样式
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});

export default App;