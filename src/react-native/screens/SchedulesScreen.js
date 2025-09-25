import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  Platform
} from 'react-native';
import { 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  Searchbar,
  Modal,
  Portal,
  TextInput as PaperTextInput,
  DatePicker,
  TimePicker
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const SchedulesScreen = ({ dataManager, navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 默认1小时后结束
    isAllDay: false,
    color: '#e74c3c'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start'); // 'start' or 'end'

  // 初始化和刷新日程数据
  useEffect(() => {
    loadSchedules();
  }, [dataManager]);

  // 监听搜索变化
  useEffect(() => {
    filterSchedules();
  }, [schedules, searchQuery]);

  // 加载日程数据
  const loadSchedules = () => {
    try {
      if (dataManager) {
        const allSchedules = dataManager.getAllSchedules();
        // 按开始时间排序
        allSchedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setSchedules(allSchedules);
      }
    } catch (error) {
      console.error('加载日程数据失败:', error);
      Alert.alert('错误', '加载日程数据失败');
    }
  };

  // 过滤日程
  const filterSchedules = () => {
    if (!searchQuery.trim()) {
      setFilteredSchedules(schedules);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = schedules.filter(schedule => 
      schedule.title.toLowerCase().includes(query) ||
      schedule.description.toLowerCase().includes(query)
    );

    setFilteredSchedules(filtered);
  };

  // 显示添加日程模态框
  const showAddModal = () => {
    setFormData({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      isAllDay: false,
      color: '#e74c3c'
    });
    setIsAddModalVisible(true);
  };

  // 显示编辑日程模态框
  const showEditModal = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      startTime: new Date(schedule.startTime),
      endTime: new Date(schedule.endTime),
      isAllDay: schedule.isAllDay || false,
      color: schedule.color || '#e74c3c'
    });
    setIsEditModalVisible(true);
  };

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理日期选择
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (datePickerType === 'start') {
        setShowDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
    }

    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (datePickerType === 'start') {
        // 确保结束时间不早于开始时间
        let endTime = formData.endTime;
        if (newDate > endTime) {
          endTime = new Date(newDate.getTime() + 60 * 60 * 1000);
          handleInputChange('endTime', endTime);
        }
        handleInputChange('startTime', newDate);
      } else {
        // 确保结束时间不早于开始时间
        if (newDate < formData.startTime) {
          newDate.setTime(formData.startTime.getTime() + 60 * 60 * 1000);
        }
        handleInputChange('endTime', newDate);
      }
    }
  };

  // 处理时间选择
  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      if (datePickerType === 'start') {
        setShowTimePicker(false);
      } else {
        setShowEndTimePicker(false);
      }
    }

    if (selectedTime) {
      const date = datePickerType === 'start' ? new Date(formData.startTime) : new Date(formData.endTime);
      date.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      
      if (datePickerType === 'start') {
        // 确保结束时间不早于开始时间
        let endTime = new Date(formData.endTime);
        if (date > endTime) {
          endTime = new Date(date.getTime() + 60 * 60 * 1000);
          handleInputChange('endTime', endTime);
        }
        handleInputChange('startTime', date);
      } else {
        // 确保结束时间不早于开始时间
        if (date < formData.startTime) {
          date.setTime(formData.startTime.getTime() + 60 * 60 * 1000);
        }
        handleInputChange('endTime', date);
      }
    }
  };

  // 格式化日期显示
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 格式化时间显示
  const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 格式化日期时间显示
  const formatDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 处理添加日程
  const handleAddSchedule = () => {
    try {
      // 验证输入
      if (!formData.title.trim()) {
        Alert.alert('提示', '请输入日程标题');
        return;
      }

      if (formData.endTime <= formData.startTime) {
        Alert.alert('提示', '结束时间必须晚于开始时间');
        return;
      }

      // 检查与课程的重叠
      const overlappingCourses = dataManager.checkScheduleCourseOverlap(formData);
      if (overlappingCourses.length > 0) {
        const courseNames = overlappingCourses.map(course => course.name).join('、');
        Alert.alert(
          '日程重叠提醒',
          `该日程与以下课程时间冲突：\n${courseNames}\n\n是否继续添加？`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '继续', 
              onPress: () => {
                performAddSchedule();
              }
            }
          ]
        );
        return;
      }

      // 没有冲突，直接添加
      performAddSchedule();

    } catch (error) {
      console.error('添加日程失败:', error);
      Alert.alert('错误', '添加日程失败');
    }
  };

  // 执行添加日程的具体逻辑
  const performAddSchedule = () => {
    try {
      const scheduleData = {
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        createTime: new Date().toISOString()
      };

      dataManager.addSchedule(scheduleData);

      // 关闭模态框并刷新数据
      setIsAddModalVisible(false);
      loadSchedules();

      Alert.alert('成功', `日程"${formData.title}"添加成功`);

    } catch (error) {
      console.error('添加日程失败:', error);
      Alert.alert('错误', '添加日程失败');
    }
  };

  // 处理编辑日程
  const handleEditSchedule = () => {
    try {
      // 验证输入
      if (!formData.title.trim()) {
        Alert.alert('提示', '请输入日程标题');
        return;
      }

      if (formData.endTime <= formData.startTime) {
        Alert.alert('提示', '结束时间必须晚于开始时间');
        return;
      }

      // 检查与课程的重叠（排除当前日程可能关联的课程）
      const overlappingCourses = dataManager.checkScheduleCourseOverlap(formData);
      if (overlappingCourses.length > 0) {
        const courseNames = overlappingCourses.map(course => course.name).join('、');
        Alert.alert(
          '日程重叠提醒',
          `该日程与以下课程时间冲突：\n${courseNames}\n\n是否继续更新？`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '继续', 
              onPress: () => {
                performEditSchedule();
              }
            }
          ]
        );
        return;
      }

      // 没有冲突，直接更新
      performEditSchedule();

    } catch (error) {
      console.error('更新日程失败:', error);
      Alert.alert('错误', '更新日程失败');
    }
  };

  // 执行编辑日程的具体逻辑
  const performEditSchedule = () => {
    try {
      if (currentSchedule) {
        const updatedSchedule = {
          ...currentSchedule,
          ...formData,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          updateTime: new Date().toISOString()
        };
        
        dataManager.updateSchedule(updatedSchedule);

        // 关闭模态框并刷新数据
        setIsEditModalVisible(false);
        loadSchedules();

        Alert.alert('成功', `日程"${formData.title}"更新成功`);
      }

    } catch (error) {
      console.error('更新日程失败:', error);
      Alert.alert('错误', '更新日程失败');
    }
  };

  // 处理删除日程
  const handleDeleteSchedule = (scheduleId, scheduleTitle) => {
    Alert.alert(
      '确认删除',
      `确定要删除日程"${scheduleTitle}"吗？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            try {
              dataManager.deleteSchedule(scheduleId);
              loadSchedules();
              Alert.alert('成功', `日程"${scheduleTitle}"已删除`);
            } catch (error) {
              console.error('删除日程失败:', error);
              Alert.alert('错误', '删除日程失败');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // 生成随机颜色
  const generateRandomColor = () => {
    const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 页面标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>日程管理</Text>
      </View>

      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索日程..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* 日程列表 */}
      <ScrollView style={styles.schedulesContainer}>
        {filteredSchedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无日程数据</Text>
            <Text style={styles.emptyStateSubtext}>点击下方按钮添加日程</Text>
          </View>
        ) : (
          filteredSchedules.map((schedule) => {
            const isOverdue = new Date(schedule.endTime) < new Date();
            
            return (
              <Card 
                key={schedule.id} 
                style={[ 
                  styles.scheduleCard, 
                  isOverdue && styles.overdueCard 
                ]}
              >
                <CardContent style={styles.scheduleCardContent}>
                  <View style={styles.scheduleInfo}>
                    <Text style={[styles.scheduleTitle, isOverdue && styles.overdueText]}>
                      {schedule.title}
                    </Text>
                    
                    {schedule.description && (
                      <Text style={[styles.scheduleDescription, isOverdue && styles.overdueText]}>
                        {schedule.description}
                      </Text>
                    )}
                    
                    <View style={styles.scheduleTime}>
                      <Text style={[styles.scheduleTimeText, isOverdue && styles.overdueText]}>
                        {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                      </Text>
                      {schedule.isAllDay && (
                        <View style={styles.allDayTag}>
                          <Text style={styles.allDayTagText}>全天</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity 
                      style={styles.editButton} 
                      onPress={() => showEditModal(schedule)}
                      disabled={isOverdue}
                    >
                      <Text style={[ 
                        styles.editButtonText, 
                        isOverdue && styles.disabledButtonText 
                      ]}>
                        编辑
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => handleDeleteSchedule(schedule.id, schedule.title)}
                    >
                      <Text style={styles.deleteButtonText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* 添加日程按钮 */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={showAddModal}
          style={styles.addButton}
        >
          添加日程
        </Button>
      </View>

      {/* 添加日程模态框 */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加日程</Text>
            
            <PaperTextInput
              label="日程标题"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="日程描述（可选）"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>开始日期</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('start');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatDate(formData.startTime)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>开始时间</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('start');
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatTime(formData.startTime)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>结束日期</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('end');
                    setShowEndDatePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatDate(formData.endTime)}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>结束时间</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('end');
                    setShowEndTimePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatTime(formData.endTime)}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setIsAddModalVisible(false)}
                style={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddSchedule}
                style={styles.modalConfirmButton}
              >
                确定
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* 编辑日程模态框 */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑日程</Text>
            
            <PaperTextInput
              label="日程标题"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="日程描述（可选）"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>开始日期</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('start');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatDate(formData.startTime)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>开始时间</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('start');
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatTime(formData.startTime)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>结束日期</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('end');
                    setShowEndDatePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatDate(formData.endTime)}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                  />
                )}
              </View>
              
              <View style={styles.dateTimeInput}>
                <Text style={styles.inputLabel}>结束时间</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => {
                    setDatePickerType('end');
                    setShowEndTimePicker(true);
                  }}
                >
                  <Text style={styles.dateTimeText}>{formatTime(formData.endTime)}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={handleEditSchedule}
                style={styles.modalConfirmButton}
              >
                确定
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
    backgroundColor: '#e74c3c',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#fff',
  },
  schedulesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  scheduleCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  overdueCard: {
    opacity: 0.6,
  },
  scheduleCardContent: {
    padding: 16,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTimeText: {
    fontSize: 14,
    color: '#666',
  },
  allDayTag: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  allDayTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overdueText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  scheduleActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#e74c3c',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeInput: {
    marginBottom: 12,
  },
  dateTimeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#999',
  },
  modalConfirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#e74c3c',
  },
});

export default SchedulesScreen;