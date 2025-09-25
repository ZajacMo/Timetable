import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, CardContent, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { utils } from '../../core/index';

const { width, height } = Dimensions.get('window');

const TimetableScreen = ({ dataManager }) => {
  // 内部管理当前周状态
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [statistics, setStatistics] = useState({
    weekCoursesCount: 0,
    monthSchedulesCount: 0,
    semesterProgress: 0
  });

  // 初始化和刷新课程数据
  useEffect(() => {
    if (dataManager) {
      // 初始化当前周
      initializeCurrentWeek();
    }
  }, [dataManager]);

  // 当周数变化时刷新数据
  useEffect(() => {
    loadCoursesData();
    updateStatistics();
  }, [currentWeek, dataManager]);

  // 初始化当前周数
  const initializeCurrentWeek = () => {
    try {
      const semester = dataManager.getSemester();
      if (semester?.startDate) {
        const startDate = new Date(semester.startDate);
        const weekNumber = utils.calculateWeekNumber(startDate, new Date());
        setCurrentWeek(Math.max(1, Math.min(weekNumber, semester.totalWeeks || 24)));
      }
    } catch (error) {
      console.error('初始化当前周失败:', error);
      setCurrentWeek(1);
    }
  }

  // 加载课程数据
  const loadCoursesData = () => {
    try {
      if (dataManager) {
        const weekCourses = dataManager.getCoursesByWeek(currentWeek);
        setCourses(weekCourses);
      }
    } catch (error) {
      console.error('加载课程数据失败:', error);
    }
  };

  // 更新统计信息
  const updateStatistics = () => {
    try {
      if (dataManager) {
        // 本周课程数
        const weekCoursesCount = dataManager.getCoursesByWeek(currentWeek).length;
        
        // 本月日程数
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const schedules = dataManager.getAllSchedules().filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month;
        });
        const monthSchedulesCount = schedules.length;
        
        // 学期进度
        const semester = dataManager.getSemester();
        let semesterProgress = 0;
        if (semester?.startDate && semester.totalWeeks) {
          const startDate = new Date(semester.startDate);
          const currentWeekNum = Math.max(1, Math.min(currentWeek, semester.totalWeeks));
          semesterProgress = Math.round((currentWeekNum / semester.totalWeeks) * 100);
        }
        
        setStatistics({
          weekCoursesCount,
          monthSchedulesCount,
          semesterProgress
        });
      }
    } catch (error) {
      console.error('更新统计信息失败:', error);
    }
  };

  // 切换到上一周
  const goToPrevWeek = () => {
    const semester = dataManager.getSemester();
    const maxWeek = semester?.totalWeeks || 24;
    
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  // 切换到下一周
  const goToNextWeek = () => {
    const semester = dataManager.getSemester();
    const maxWeek = semester?.totalWeeks || 24;
    
    if (currentWeek < maxWeek) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  // 回到今天
  const goToToday = () => {
    try {
      const semester = dataManager.getSemester();
      if (semester?.startDate) {
        const startDate = new Date(semester.startDate);
        const weekNumber = utils.calculateWeekNumber(startDate, new Date());
        setCurrentWeek(Math.max(1, Math.min(weekNumber, semester.totalWeeks || 24)));
      }
    } catch (error) {
      console.error('计算当前周失败:', error);
    }
  };

  // 渲染课程表单元格
  const renderTimetableCell = (dayOfWeek, section) => {
    // 查找当前单元格对应的课程
    const cellCourses = courses.filter(course => {
      return course.dayOfWeek === dayOfWeek && 
             course.startSection <= section && 
             course.endSection >= section;
    });

    // 检查课程是否在单周或双周
    const displayCourses = cellCourses.filter(course => {
      if (course.weekType === 'all') return true;
      if (course.weekType === 'odd' && currentWeek % 2 === 1) return true;
      if (course.weekType === 'even' && currentWeek % 2 === 0) return true;
      return false;
    });

    // 如果没有课程，返回空单元格
    if (displayCourses.length === 0) {
      return <View style={styles.timetableCell} />;
    }

    // 处理重叠课程
    if (displayCourses.length === 1) {
      const course = displayCourses[0];
      // 计算课程跨度
      const spanHeight = course.endSection - course.startSection + 1;
      
      return (
        <View 
          style={[
            styles.timetableCell,
            { height: spanHeight * 80 },
            { backgroundColor: course.color + '20' }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.courseItem,
              { backgroundColor: course.color }
            ]}
          >
            <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
            <Text style={styles.courseTeacher} numberOfLines={1}>{course.teacher}</Text>
            <Text style={styles.courseLocation} numberOfLines={1}>{course.location}</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // 处理重叠课程的逻辑
      return (
        <View style={styles.timetableCell}>
          {displayCourses.map((course, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.courseItem,
                styles.overlappingCourse,
                { backgroundColor: course.color }
              ]}
            >
              <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
              <Text style={styles.courseTeacher} numberOfLines={1}>{course.teacher}</Text>
              <Text style={styles.courseLocation} numberOfLines={1}>{course.location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };

  // 生成月份日期
  const generateMarkedDates = () => {
    const markedDates = {};
    const semester = dataManager.getSemester();
    
    if (semester?.startDate) {
      const startDate = new Date(semester.startDate);
      const totalDays = (semester.totalWeeks || 20) * 7;
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        const weekNumber = require('../core/utils').calculateWeekNumber(startDate, date);
        
        markedDates[formattedDate] = {
          marked: true,
          dotColor: weekNumber === currentWeek ? '#1e90ff' : '#888',
          selected: date.toDateString() === new Date().toDateString(),
          selectedColor: '#1e90ff'
        };
      }
    }
    
    return markedDates;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 页面标题和周数控制 */}
      <View style={styles.header}>
        <Text style={styles.title}>课程表</Text>
        <View style={styles.weekControls}>
          <TouchableOpacity style={styles.controlButton} onPress={goToPrevWeek}>
            <Text style={styles.controlButtonText}>上一周</Text>
          </TouchableOpacity>
          <Text style={styles.weekText}>第{currentWeek}周</Text>
          <TouchableOpacity style={styles.controlButton} onPress={goToNextWeek}>
            <Text style={styles.controlButtonText}>下一周</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>今天</Text>
        </TouchableOpacity>
      </View>

      {/* 统计卡片 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
        <Card style={styles.statsCard}>
          <CardContent>
            <Text style={styles.statsLabel}>本周课程</Text>
            <Text style={styles.statsValue}>{statistics.weekCoursesCount}</Text>
            <Text style={styles.statsUnit}>门课程</Text>
          </CardContent>
        </Card>
        <Card style={styles.statsCard}>
          <CardContent>
            <Text style={styles.statsLabel}>本月日程</Text>
            <Text style={styles.statsValue}>{statistics.monthSchedulesCount}</Text>
            <Text style={styles.statsUnit}>个日程</Text>
          </CardContent>
        </Card>
        <Card style={styles.statsCard}>
          <CardContent>
            <Text style={styles.statsLabel}>学期进度</Text>
            <Text style={styles.statsValue}>{statistics.semesterProgress}%</Text>
            <Text style={styles.statsUnit}>已完成</Text>
          </CardContent>
        </Card>
      </ScrollView>

      {/* 切换日历显示 */}
      <TouchableOpacity 
        style={styles.calendarToggleButton} 
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={styles.calendarToggleText}>
          {showCalendar ? '隐藏日历' : '显示日历'}
        </Text>
      </TouchableOpacity>

      {/* 日历视图 */}
      {showCalendar && (
        <Calendar
          style={styles.calendar}
          markedDates={generateMarkedDates()}
          onDayPress={(day) => {
            const semester = dataManager.getSemester();
            if (semester?.startDate) {
              const startDate = new Date(semester.startDate);
              const selectedDate = new Date(day.dateString);
              const weekNumber = utils.calculateWeekNumber(startDate, selectedDate);
              setCurrentWeek(Math.max(1, Math.min(weekNumber, semester.totalWeeks || 24)));
            }
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            textSectionTitleDisabledColor: '#d9e1e8',
            selectedDayBackgroundColor: '#1e90ff',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#1e90ff',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#1e90ff',
            selectedDotColor: '#ffffff',
            arrowColor: '#1e90ff',
            monthTextColor: '#1e90ff',
          }}
        />
      )}

      {/* 课程表 */}
      <ScrollView 
        style={styles.timetableContainer} 
        contentContainerStyle={styles.timetableContent}
      >
        <View style={styles.timetableWrapper}>
          {/* 星期标题行 */}
          <View style={styles.weekdaysHeader}>
            <View style={[styles.weekdayCell, styles.timeSlotHeader]}>
              <Text style={styles.weekdayText}>时间</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周一</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周二</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周三</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周四</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周五</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周六</Text>
            </View>
            <View style={[styles.weekdayCell, styles.weekdayHeaderCell]}>
              <Text style={styles.weekdayText}>周日</Text>
            </View>
          </View>

          {/* 课程表主体 */}
          {[1, 3, 5, 7, 9].map((section, index) => (
            <View key={index} style={styles.timetableRow}>
              {/* 时间槽 */}
              <View style={[styles.timetableCell, styles.timeSlot]}>
                <Text style={styles.timeSlotText}>第{section}-{section + 1}节</Text>
              </View>
              
              {/* 星期几的单元格 */}
              {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek, dayIndex) => (
                <View key={dayIndex} style={styles.timetableCellContainer}>
                  {renderTimetableCell(dayOfWeek, section)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={() => {
            // 添加课程按钮点击事件
            navigation.navigate('Courses');
          }}
          style={styles.addButton}
        >
          添加课程
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => {
            // 导出按钮点击事件
            handleExport();
          }}
          style={styles.exportButton}
        >
          导出
        </Button>
      </View>
    </SafeAreaView>
  );
};

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e90ff',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  weekControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weekText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8, 
    borderRadius: 4,
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsScrollView: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  statsCard: {
    width: 100,
    marginHorizontal: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
  },
  statsUnit: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  calendarToggleButton: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  calendarToggleText: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  calendar: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  timetableContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timetableContent: {
    paddingBottom: 24,
  },
  timetableWrapper: {
    paddingHorizontal: 8,
  },
  weekdaysHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  weekdayCell: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotHeader: {
    width: 80,
    flex: 0,
    backgroundColor: '#eee',
  },
  weekdayHeaderCell: {
    backgroundColor: '#f8f8f8',
  },
  weekdayText: {
    fontWeight: 'bold',
    color: '#333',
  },
  timetableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timetableCellContainer: {
    flex: 1,
    height: 160,
  },
  timetableCell: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  timeSlot: {
    width: 80,
    flex: 0,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  courseItem: {
    padding: 8,
    borderRadius: 4,
    margin: 2,
    flex: 1,
  },
  overlappingCourse: {
    margin: 2,
    borderRadius: 4,
    padding: 4,
  },
  courseName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  courseTeacher: {
    color: '#fff',
    fontSize: 10,
    marginBottom: 1,
  },
  courseLocation: {
    color: '#fff',
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#1e90ff',
  },
  exportButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#1e90ff',
  },
});

export default TimetableScreen;