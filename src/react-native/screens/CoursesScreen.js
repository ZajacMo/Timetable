import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  TextInput
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
  Select,
  MenuItem
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const CoursesScreen = ({ dataManager, navigation }) => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    location: '',
    dayOfWeek: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 18,
    weekType: 'all',
    color: '#3498db'
  });

  // 初始化和刷新课程数据
  useEffect(() => {
    loadCourses();
  }, [dataManager]);

  // 监听搜索变化
  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery]);

  // 加载课程数据
  const loadCourses = () => {
    try {
      if (dataManager) {
        const allCourses = dataManager.getAllCourses();
        setCourses(allCourses);
      }
    } catch (error) {
      console.error('加载课程数据失败:', error);
      Alert.alert('错误', '加载课程数据失败');
    }
  };

  // 过滤课程
  const filterCourses = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(course => 
      course.name.toLowerCase().includes(query) ||
      course.teacher.toLowerCase().includes(query) ||
      course.location.toLowerCase().includes(query)
    );

    setFilteredCourses(filtered);
  };

  // 显示添加课程模态框
  const showAddModal = () => {
    setFormData({
      name: '',
      teacher: '',
      location: '',
      dayOfWeek: 1,
      startSection: 1,
      endSection: 2,
      startWeek: 1,
      endWeek: 18,
      weekType: 'all',
      color: '#3498db'
    });
    setIsAddModalVisible(true);
  };

  // 显示编辑课程模态框
  const showEditModal = (course) => {
    setCurrentCourse(course);
    setFormData({
      name: course.name,
      teacher: course.teacher,
      location: course.location,
      dayOfWeek: course.dayOfWeek,
      startSection: course.startSection,
      endSection: course.endSection,
      startWeek: course.startWeek,
      endWeek: course.endWeek,
      weekType: course.weekType,
      color: course.color
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

  // 处理添加课程
  const handleAddCourse = () => {
    try {
      // 验证输入
      if (!formData.name.trim()) {
        Alert.alert('提示', '请输入课程名称');
        return;
      }

      if (formData.endSection < formData.startSection) {
        Alert.alert('提示', '结束节次不能小于开始节次');
        return;
      }

      if (formData.endWeek < formData.startWeek) {
        Alert.alert('提示', '结束周数不能小于开始周数');
        return;
      }

      // 添加课程
      dataManager.addCourse(formData);

      // 关闭模态框并刷新数据
      setIsAddModalVisible(false);
      loadCourses();

      Alert.alert('成功', `课程"${formData.name}"添加成功`);

    } catch (error) {
      console.error('添加课程失败:', error);
      Alert.alert('错误', '添加课程失败');
    }
  };

  // 处理编辑课程
  const handleEditCourse = () => {
    try {
      // 验证输入
      if (!formData.name.trim()) {
        Alert.alert('提示', '请输入课程名称');
        return;
      }

      if (formData.endSection < formData.startSection) {
        Alert.alert('提示', '结束节次不能小于开始节次');
        return;
      }

      if (formData.endWeek < formData.startWeek) {
        Alert.alert('提示', '结束周数不能小于开始周数');
        return;
      }

      // 更新课程
      if (currentCourse) {
        const updatedCourse = {
          ...currentCourse,
          ...formData,
          updateTime: new Date().toISOString()
        };
        
        dataManager.updateCourse(updatedCourse);

        // 关闭模态框并刷新数据
        setIsEditModalVisible(false);
        loadCourses();

        Alert.alert('成功', `课程"${formData.name}"更新成功`);
      }

    } catch (error) {
      console.error('更新课程失败:', error);
      Alert.alert('错误', '更新课程失败');
    }
  };

  // 处理删除课程
  const handleDeleteCourse = (courseId, courseName) => {
    Alert.alert(
      '确认删除',
      `确定要删除课程"${courseName}"吗？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            try {
              dataManager.deleteCourse(courseId);
              loadCourses();
              Alert.alert('成功', `课程"${courseName}"已删除`);
            } catch (error) {
              console.error('删除课程失败:', error);
              Alert.alert('错误', '删除课程失败');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // 渲染星期几文本
  const getDayOfWeekText = (dayOfWeek) => {
    const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days[dayOfWeek] || '';
  };

  // 渲染周类型文本
  const getWeekTypeText = (weekType) => {
    const types = {
      all: '每周',
      odd: '单周',
      even: '双周'
    };
    return types[weekType] || '每周';
  };

  // 生成随机颜色
  const generateRandomColor = () => {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 页面标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>课程管理</Text>
      </View>

      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索课程..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* 课程列表 */}
      <ScrollView style={styles.coursesContainer}>
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无课程数据</Text>
            <Text style={styles.emptyStateSubtext}>点击下方按钮添加课程</Text>
          </View>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} style={styles.courseCard}>
              <CardContent style={styles.courseCardContent}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseTeacher}>{course.teacher}</Text>
                  <Text style={styles.courseLocation}>{course.location}</Text>
                  <View style={styles.courseSchedule}>
                    <View style={[styles.courseTag, { backgroundColor: course.color }]}>
                      <Text style={styles.courseTagText}>
                        {getDayOfWeekText(course.dayOfWeek)} {course.startSection}-{course.endSection}节
                      </Text>
                    </View>
                    <View style={styles.courseScheduleText}>
                      {getWeekTypeText(course.weekType)} {course.startWeek}-{course.endWeek}周
                    </View>
                  </View>
                </View>
                <View style={styles.courseActions}>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => showEditModal(course)}
                  >
                    <Text style={styles.editButtonText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDeleteCourse(course.id, course.name)}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>

      {/* 添加课程按钮 */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={showAddModal}
          style={styles.addButton}
        >
          添加课程
        </Button>
      </View>

      {/* 添加课程模态框 */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加课程</Text>
            
            <PaperTextInput
              label="课程名称"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="教师姓名"
              value={formData.teacher}
              onChangeText={(text) => handleInputChange('teacher', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="上课地点"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              style={styles.input}
            />
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>星期几</Text>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(value) => handleInputChange('dayOfWeek', parseInt(value))}
                  style={styles.select}
                >
                  <MenuItem value="1">周一</MenuItem>
                  <MenuItem value="2">周二</MenuItem>
                  <MenuItem value="3">周三</MenuItem>
                  <MenuItem value="4">周四</MenuItem>
                  <MenuItem value="5">周五</MenuItem>
                  <MenuItem value="6">周六</MenuItem>
                  <MenuItem value="7">周日</MenuItem>
                </Select>
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>周类型</Text>
                <Select
                  value={formData.weekType}
                  onValueChange={(value) => handleInputChange('weekType', value)}
                  style={styles.select}
                >
                  <MenuItem value="all">每周</MenuItem>
                  <MenuItem value="odd">单周</MenuItem>
                  <MenuItem value="even">双周</MenuItem>
                </Select>
              </View>
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>开始节次</Text>
                <PaperTextInput
                  value={formData.startSection.toString()}
                  onChangeText={(text) => handleInputChange('startSection', parseInt(text) || 1)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>结束节次</Text>
                <PaperTextInput
                  value={formData.endSection.toString()}
                  onChangeText={(text) => handleInputChange('endSection', parseInt(text) || 2)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>开始周</Text>
                <PaperTextInput
                  value={formData.startWeek.toString()}
                  onChangeText={(text) => handleInputChange('startWeek', parseInt(text) || 1)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>结束周</Text>
                <PaperTextInput
                  value={formData.endWeek.toString()}
                  onChangeText={(text) => handleInputChange('endWeek', parseInt(text) || 18)}
                  keyboardType="numeric"
                  style={styles.input}
                />
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
                onPress={handleAddCourse}
                style={styles.modalConfirmButton}
              >
                确定
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* 编辑课程模态框 */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑课程</Text>
            
            <PaperTextInput
              label="课程名称"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="教师姓名"
              value={formData.teacher}
              onChangeText={(text) => handleInputChange('teacher', text)}
              style={styles.input}
            />
            
            <PaperTextInput
              label="上课地点"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              style={styles.input}
            />
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>星期几</Text>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(value) => handleInputChange('dayOfWeek', parseInt(value))}
                  style={styles.select}
                >
                  <MenuItem value="1">周一</MenuItem>
                  <MenuItem value="2">周二</MenuItem>
                  <MenuItem value="3">周三</MenuItem>
                  <MenuItem value="4">周四</MenuItem>
                  <MenuItem value="5">周五</MenuItem>
                  <MenuItem value="6">周六</MenuItem>
                  <MenuItem value="7">周日</MenuItem>
                </Select>
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>周类型</Text>
                <Select
                  value={formData.weekType}
                  onValueChange={(value) => handleInputChange('weekType', value)}
                  style={styles.select}
                >
                  <MenuItem value="all">每周</MenuItem>
                  <MenuItem value="odd">单周</MenuItem>
                  <MenuItem value="even">双周</MenuItem>
                </Select>
              </View>
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>开始节次</Text>
                <PaperTextInput
                  value={formData.startSection.toString()}
                  onChangeText={(text) => handleInputChange('startSection', parseInt(text) || 1)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>结束节次</Text>
                <PaperTextInput
                  value={formData.endSection.toString()}
                  onChangeText={(text) => handleInputChange('endSection', parseInt(text) || 2)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>开始周</Text>
                <PaperTextInput
                  value={formData.startWeek.toString()}
                  onChangeText={(text) => handleInputChange('startWeek', parseInt(text) || 1)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>结束周</Text>
                <PaperTextInput
                  value={formData.endWeek.toString()}
                  onChangeText={(text) => handleInputChange('endWeek', parseInt(text) || 18)}
                  keyboardType="numeric"
                  style={styles.input}
                />
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
                onPress={handleEditCourse}
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
    backgroundColor: '#1e90ff',
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
  coursesContainer: {
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
  courseCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  courseCardContent: {
    padding: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  courseLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  courseTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  courseScheduleText: {
    fontSize: 14,
    color: '#666',
  },
  courseActions: {
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
    backgroundColor: '#1e90ff',
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
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  select: {
    marginBottom: 8,
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
    backgroundColor: '#1e90ff',
  },
});

export default CoursesScreen;