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
  Switch,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const SemesterScreen = ({ dataManager, navigation }) => {
  const [semesters, setSemesters] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentEditingSemester, setCurrentEditingSemester] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 16 * 7 * 24 * 60 * 60 * 1000), // 默认16周后结束
    totalWeeks: 16,
    startWeek: 1
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化和刷新学期数据
  useEffect(() => {
    loadSemesters();
  }, [dataManager]);

  // 加载学期数据
  const loadSemesters = async () => {
    try {
      setIsLoading(true);
      if (dataManager) {
        const allSemesters = dataManager.getAllSemesters();
        // 按开始时间排序
        allSemesters.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setSemesters(allSemesters);

        // 获取当前学期
        const current = dataManager.getCurrentSemester();
        setCurrentSemester(current);
      }
    } catch (error) {
      console.error('加载学期数据失败:', error);
      Alert.alert('错误', '加载学期数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 显示添加学期模态框
  const showAddModal = () => {
    const now = new Date();
    setFormData({
      name: `第${now.getFullYear() - (now.getMonth() < 6 ? 1 : 0)}-${now.getFullYear() % 100}${now.getMonth() < 6 ? '1' : '2'}学期`,
      startDate: new Date(now.getFullYear(), 8, 1), // 默认9月1日开始
      endDate: new Date(now.getFullYear() + (now.getMonth() >= 8 ? 1 : 0), 1, 15), // 默认次年1月15日结束
      totalWeeks: 16,
      startWeek: 1
    });
    setIsAddModalVisible(true);
  };

  // 显示编辑学期模态框
  const showEditModal = (semester) => {
    setCurrentEditingSemester(semester);
    setFormData({
      name: semester.name,
      startDate: new Date(semester.startDate),
      endDate: new Date(semester.endDate),
      totalWeeks: semester.totalWeeks,
      startWeek: semester.startWeek
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
  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }

    if (selectedDate) {
      const newStartDate = new Date(selectedDate);
      // 确保结束时间不早于开始时间
      let endDate = new Date(formData.endDate);
      if (newStartDate > endDate) {
        endDate = new Date(newStartDate.getTime() + 16 * 7 * 24 * 60 * 60 * 1000);
        handleInputChange('endDate', endDate);
      }
      handleInputChange('startDate', newStartDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      const newEndDate = new Date(selectedDate);
      // 确保结束时间不早于开始时间
      if (newEndDate < formData.startDate) {
        newEndDate.setTime(formData.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      handleInputChange('endDate', newEndDate);
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

  // 处理添加学期
  const handleAddSemester = () => {
    try {
      // 验证输入
      if (!formData.name.trim()) {
        Alert.alert('提示', '请输入学期名称');
        return;
      }

      if (formData.endDate <= formData.startDate) {
        Alert.alert('提示', '结束日期必须晚于开始日期');
        return;
      }

      if (formData.totalWeeks < 1) {
        Alert.alert('提示', '总周数必须大于0');
        return;
      }

      if (formData.startWeek < 1) {
        Alert.alert('提示', '开始周次必须大于0');
        return;
      }

      // 添加学期
      const semesterData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        createTime: new Date().toISOString()
      };

      dataManager.addSemester(semesterData);

      // 关闭模态框并刷新数据
      setIsAddModalVisible(false);
      loadSemesters();

      Alert.alert('成功', `学期"${formData.name}"添加成功`);

    } catch (error) {
      console.error('添加学期失败:', error);
      Alert.alert('错误', '添加学期失败');
    }
  };

  // 处理编辑学期
  const handleEditSemester = () => {
    try {
      // 验证输入
      if (!formData.name.trim()) {
        Alert.alert('提示', '请输入学期名称');
        return;
      }

      if (formData.endDate <= formData.startDate) {
        Alert.alert('提示', '结束日期必须晚于开始日期');
        return;
      }

      if (formData.totalWeeks < 1) {
        Alert.alert('提示', '总周数必须大于0');
        return;
      }

      if (formData.startWeek < 1) {
        Alert.alert('提示', '开始周次必须大于0');
        return;
      }

      // 更新学期
      if (currentEditingSemester) {
        const updatedSemester = {
          ...currentEditingSemester,
          ...formData,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          updateTime: new Date().toISOString()
        };
        
        dataManager.updateSemester(updatedSemester);

        // 关闭模态框并刷新数据
        setIsEditModalVisible(false);
        loadSemesters();

        Alert.alert('成功', `学期"${formData.name}"更新成功`);
      }

    } catch (error) {
      console.error('更新学期失败:', error);
      Alert.alert('错误', '更新学期失败');
    }
  };

  // 处理删除学期
  const handleDeleteSemester = (semesterId, semesterName) => {
    Alert.alert(
      '确认删除',
      `确定要删除学期"${semesterName}"吗？删除后，该学期的所有课程数据也将被删除。`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: async () => {
            try {
              // 先检查是否为当前学期
              if (currentSemester && currentSemester.id === semesterId) {
                // 如果是当前学期，需要选择一个新的当前学期
                const otherSemesters = semesters.filter(s => s.id !== semesterId);
                if (otherSemesters.length > 0) {
                  // 选择最新的学期作为当前学期
                  const latestSemester = otherSemesters.reduce((latest, current) => {
                    return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
                  });
                  dataManager.setCurrentSemester(latestSemester.id);
                }
              }

              await dataManager.deleteSemester(semesterId);
              loadSemesters();
              Alert.alert('成功', `学期"${semesterName}"已删除`);
            } catch (error) {
              console.error('删除学期失败:', error);
              Alert.alert('错误', '删除学期失败');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // 设置当前学期
  const setAsCurrentSemester = (semesterId, semesterName) => {
    if (currentSemester && currentSemester.id === semesterId) {
      Alert.alert('提示', `"${semesterName}"已经是当前学期`);
      return;
    }

    Alert.alert(
      '设置当前学期',
      `确定要将"${semesterName}"设置为当前学期吗？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            try {
              dataManager.setCurrentSemester(semesterId);
              loadSemesters();
              Alert.alert('成功', `"${semesterName}"已设置为当前学期`);
            } catch (error) {
              console.error('设置当前学期失败:', error);
              Alert.alert('错误', '设置当前学期失败');
            }
          }
        }
      ]
    );
  };

  // 计算学期持续时间
  const calculateSemesterDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}天`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 页面标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>学期管理</Text>
      </View>

      {/* 学期列表 */}
      <ScrollView style={styles.semestersContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : semesters.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无学期数据</Text>
            <Text style={styles.emptyStateSubtext}>点击下方按钮添加学期</Text>
          </View>
        ) : (
          semesters.map((semester) => {
            const isCurrent = currentSemester && currentSemester.id === semester.id;
            
            return (
              <Card 
                key={semester.id} 
                style={[ 
                  styles.semesterCard, 
                  isCurrent && styles.currentSemesterCard 
                ]}
              >
                <CardContent style={styles.semesterCardContent}>
                  <View style={styles.semesterInfo}>
                    <View style={styles.semesterHeader}>
                      <Text style={[styles.semesterName, isCurrent && styles.currentSemesterText]}>
                        {semester.name}
                      </Text>
                      {isCurrent && (
                        <View style={styles.currentSemesterTag}>
                          <Text style={styles.currentSemesterTagText}>当前学期</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.semesterDateInfo}>
                      <Text style={styles.semesterDateText}>
                        {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                      </Text>
                      <Text style={styles.semesterDurationText}>
                        ({calculateSemesterDuration(semester.startDate, semester.endDate)})
                      </Text>
                    </View>
                    
                    <View style={styles.semesterDetails}>
                      <View style={styles.semesterDetailItem}>
                        <Text style={styles.semesterDetailLabel}>总周数：</Text>
                        <Text style={styles.semesterDetailValue}>{semester.totalWeeks}周</Text>
                      </View>
                      <View style={styles.semesterDetailItem}>
                        <Text style={styles.semesterDetailLabel}>开始周次：</Text>
                        <Text style={styles.semesterDetailValue}>第{semester.startWeek}周</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.semesterActions}>
                    {!isCurrent && (
                      <TouchableOpacity 
                        style={styles.setCurrentButton} 
                        onPress={() => setAsCurrentSemester(semester.id, semester.name)}
                      >
                        <Text style={styles.setCurrentButtonText}>设为当前</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.editButton} 
                      onPress={() => showEditModal(semester)}
                    >
                      <Text style={styles.editButtonText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => handleDeleteSemester(semester.id, semester.name)}
                      disabled={isCurrent && semesters.length === 1}
                    >
                      <Text 
                        style={[ 
                          styles.deleteButtonText, 
                          (isCurrent && semesters.length === 1) && styles.disabledButtonText 
                        ]}
                      >
                        删除
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* 添加学期按钮 */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={showAddModal}
          style={styles.addButton}
        >
          添加学期
        </Button>
      </View>

      {/* 添加学期模态框 */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加学期</Text>
            
            <PaperTextInput
              label="学期名称"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>开始日期</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                />
              )}
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>结束日期</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              )}
            </View>
            
            <View style={styles.numberInputContainer}>
              <PaperTextInput
                label="总周数"
                value={formData.totalWeeks.toString()}
                onChangeText={(text) => handleInputChange('totalWeeks', parseInt(text) || 1)}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <PaperTextInput
                label="开始周次"
                value={formData.startWeek.toString()}
                onChangeText={(text) => handleInputChange('startWeek', parseInt(text) || 1)}
                keyboardType="numeric"
                style={styles.input}
              />
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
                onPress={handleAddSemester}
                style={styles.modalConfirmButton}
              >
                确定
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* 编辑学期模态框 */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑学期</Text>
            
            <PaperTextInput
              label="学期名称"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>开始日期</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                />
              )}
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.inputLabel}>结束日期</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              )}
            </View>
            
            <View style={styles.numberInputContainer}>
              <PaperTextInput
                label="总周数"
                value={formData.totalWeeks.toString()}
                onChangeText={(text) => handleInputChange('totalWeeks', parseInt(text) || 1)}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <PaperTextInput
                label="开始周次"
                value={formData.startWeek.toString()}
                onChangeText={(text) => handleInputChange('startWeek', parseInt(text) || 1)}
                keyboardType="numeric"
                style={styles.input}
              />
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
                onPress={handleEditSemester}
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
    backgroundColor: '#2ecc71',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  semestersContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  semesterCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  currentSemesterCard: {
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  semesterCardContent: {
    padding: 16,
  },
  semesterInfo: {
    flex: 1,
  },
  semesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  semesterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currentSemesterText: {
    color: '#2ecc71',
  },
  currentSemesterTag: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentSemesterTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  semesterDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  semesterDateText: {
    fontSize: 14,
    color: '#666',
  },
  semesterDurationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  semesterDetails: {
    marginTop: 8,
  },
  semesterDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  semesterDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  semesterDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  semesterActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  setCurrentButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  setCurrentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  disabledButtonText: {
    color: '#ccc',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#2ecc71',
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
  dateInputContainer: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  numberInputContainer: {
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
    backgroundColor: '#2ecc71',
  },
});

export default SemesterScreen;