import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  Platform,
  Linking,
  Share
} from 'react-native';
import { 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  Switch,
  List,
  Portal,
  Modal,
  TextInput as PaperTextInput,
  ActivityIndicator,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystemBrowser from 'expo-file-system';

const SettingsScreen = ({ dataManager, navigation }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notificationEnabled: true,
    autoBackup: false,
    showWeekend: true,
    startTime: '08:00',
    endTime: '21:00',
    sectionsPerDay: 12,
    backupFrequency: 'weekly'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');

  // 初始化和刷新设置数据
  useEffect(() => {
    loadSettings();
  }, [dataManager]);

  // 加载设置数据
  const loadSettings = async () => {
    try {
      if (dataManager) {
        const savedSettings = dataManager.getSettings();
        setSettings(savedSettings);
        setSelectedTheme(savedSettings.theme);
      }
    } catch (error) {
      console.error('加载设置数据失败:', error);
      Alert.alert('错误', '加载设置数据失败，使用默认设置');
    }
  };

  // 保存设置
  const saveSettings = async (newSettings) => {
    try {
      if (dataManager) {
        await dataManager.saveSettings(newSettings);
        setSettings(newSettings);
        // 根据主题设置更新UI（实际项目中可能需要使用Context或状态管理库）
        if (newSettings.theme !== settings.theme) {
          Alert.alert('提示', '主题已更新，需重启应用生效');
        }
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存设置失败');
    }
  };

  // 处理开关设置变化
  const handleSwitchChange = (settingName, value) => {
    const newSettings = {
      ...settings,
      [settingName]: value
    };
    saveSettings(newSettings);
  };

  // 处理主题选择
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
  };

  // 确认主题更改
  const confirmThemeChange = () => {
    const newSettings = {
      ...settings,
      theme: selectedTheme
    };
    saveSettings(newSettings);
    setThemeModalVisible(false);
  };

  // 导出数据
  const exportData = async () => {
    try {
      setIsLoading(true);
      
      if (dataManager) {
        // 获取所有数据
        const allData = {
          semesters: dataManager.getAllSemesters(),
          courses: dataManager.getAllCourses(),
          schedules: dataManager.getAllSchedules(),
          settings: dataManager.getSettings(),
          exportTime: new Date().toISOString(),
          version: '2.0.0'
        };

        // 转换为JSON字符串
        const jsonData = JSON.stringify(allData, null, 2);

        // 生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `TimetableBackup_${timestamp}.json`;
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;

        // 写入文件
        await FileSystem.writeAsStringAsync(filePath, jsonData, { encoding: FileSystem.EncodingType.UTF8 });

        // 检查是否可以共享
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          // 使用分享API
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/json',
            dialogTitle: '导出课程表数据',
            UTI: 'public.json',
            filename: fileName
          });
        } else {
          // 在Android上尝试使用Linking打开文件
          if (Platform.OS === 'android') {
            const fileUri = `file://${filePath}`;
            Linking.openURL(fileUri).catch(err => {
              console.error('无法打开文件:', err);
              Alert.alert('错误', '无法导出数据，请手动复制以下路径的文件：\n' + filePath);
            });
          } else {
            Alert.alert('错误', '不支持分享功能，请检查您的设备设置');
          }
        }

        setExportModalVisible(false);
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      Alert.alert('错误', '导出数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 导入数据
  const importData = async () => {
    try {
      setIsLoading(true);

      // 打开文件选择器
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        
        // 读取文件内容
        const jsonData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8
        });

        // 解析JSON数据
        const importedData = JSON.parse(jsonData);

        // 验证数据格式
        if (!importedData.semesters || !Array.isArray(importedData.semesters) ||
            !importedData.courses || !Array.isArray(importedData.courses)) {
          Alert.alert('错误', '数据格式不正确，无法导入');
          return;
        }

        // 确认导入（会覆盖现有数据）
        Alert.alert(
          '确认导入',
          '导入数据将覆盖现有所有课程表数据，确定继续吗？',
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '确定', 
              onPress: async () => {
                try {
                  if (dataManager) {
                    // 清除现有数据
                    await dataManager.clearAllData();
                    
                    // 导入学期数据
                    importedData.semesters.forEach(semester => {
                      dataManager.addSemester(semester);
                    });
                    
                    // 导入课程数据
                    importedData.courses.forEach(course => {
                      dataManager.addCourse(course);
                    });
                    
                    // 导入日程数据
                    if (importedData.schedules && Array.isArray(importedData.schedules)) {
                      importedData.schedules.forEach(schedule => {
                        dataManager.addSchedule(schedule);
                      });
                    }
                    
                    // 导入设置数据
                    if (importedData.settings) {
                      await dataManager.saveSettings(importedData.settings);
                      setSettings(importedData.settings);
                      setSelectedTheme(importedData.settings.theme || 'light');
                    }
                    
                    Alert.alert('成功', '数据导入成功，将返回课程表页面');
                    setImportModalVisible(false);
                    // 返回课程表页面
                    navigation.navigate('Timetable');
                  }
                } catch (error) {
                  console.error('导入数据失败:', error);
                  Alert.alert('错误', '导入数据失败');
                }
              },
              style: 'destructive'
            }
          ]
        );
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      Alert.alert('错误', '导入数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置所有数据
  const resetAllData = () => {
    Alert.alert(
      '确认重置',
      '确定要清空所有数据吗？此操作不可恢复！',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: async () => {
            try {
              if (dataManager) {
                await dataManager.clearAllData();
                Alert.alert('成功', '所有数据已清空');
                // 返回课程表页面
                navigation.navigate('Timetable');
              }
            } catch (error) {
              console.error('重置数据失败:', error);
              Alert.alert('错误', '重置数据失败');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // 关于应用
  const showAbout = () => {
    Alert.alert(
      '关于课程表助手',
      '课程表助手 v2.0.0\n\n一款跨平台的课程表管理应用，支持Windows、Android等平台。\n\n开发者：Trae AI\n\n© 2023 版权所有',
      [
        { text: '确定', style: 'default' }
      ]
    );
  };

  // 打开使用帮助
  const openHelp = () => {
    Alert.alert(
      '使用帮助',
      '课程表助手使用指南：\n\n1. 首先添加学期信息\n2. 然后添加您的课程\n3. 在课程表页面查看和管理您的课程\n4. 您还可以添加个人日程提醒\n\n如有其他问题，请联系开发者。',
      [
        { text: '确定', style: 'default' }
      ]
    );
  };

  // 打开隐私政策
  const openPrivacyPolicy = () => {
    Alert.alert(
      '隐私政策',
      '课程表助手隐私政策\n\n我们尊重并保护您的隐私。您的所有数据仅存储在您的设备上，我们不会收集、存储或共享您的任何个人信息。\n\n您可以随时导出或删除您的数据。\n\n如有任何疑问，请联系我们。',
      [
        { text: '确定', style: 'default' }
      ]
    );
  };

  // 评分和反馈
  const rateAndFeedback = () => {
    Alert.alert(
      '评分和反馈',
      '感谢您使用课程表助手！\n\n如果您对应用满意，请给我们一个好评。\n\n如有任何建议或问题，请联系我们。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '前往评分', 
          onPress: () => {
            // 在实际应用中，这里应该跳转到应用商店的评分页面
            Alert.alert('提示', '将在实际版本中跳转到应用商店');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 页面标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      {/* 设置列表 */}
      <ScrollView style={styles.settingsContainer}>
        {/* 基础设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基础设置</Text>
          
          <Card style={styles.settingCard}>
            <CardContent>
              <View style={styles.settingItem}> 
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>通知提醒</Text>
                  <Text style={styles.settingDescription}>开启后，课程开始前将收到提醒</Text>
                </View>
                <Switch
                  value={settings.notificationEnabled}
                  onValueChange={(value) => handleSwitchChange('notificationEnabled', value)}
                  color="#3498db"
                />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.settingCard}>
            <CardContent>
              <View style={styles.settingItem}> 
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>显示周末</Text>
                  <Text style={styles.settingDescription}>在课程表中显示周六和周日</Text>
                </View>
                <Switch
                  value={settings.showWeekend}
                  onValueChange={(value) => handleSwitchChange('showWeekend', value)}
                  color="#3498db"
                />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={() => setThemeModalVisible(true)}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>主题设置</Text>
                    <Text style={styles.settingDescription}>当前：{settings.theme === 'light' ? '亮色' : settings.theme === 'dark' ? '暗色' : '跟随系统'}</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={() => setExportModalVisible(true)}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>导出数据</Text>
                    <Text style={styles.settingDescription}>将所有课程表数据导出为JSON文件</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={() => setImportModalVisible(true)}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>导入数据</Text>
                    <Text style={styles.settingDescription}>从JSON文件导入课程表数据</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCardDanger}>
            <TouchableOpacity 
              onPress={resetAllData}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitleDanger}>清空所有数据</Text>
                    <Text style={styles.settingDescriptionDanger}>此操作不可恢复！</Text>
                  </View>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 关于与帮助 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于与帮助</Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={openHelp}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>使用帮助</Text>
                    <Text style={styles.settingDescription}>查看应用的使用指南</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={openPrivacyPolicy}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>隐私政策</Text>
                    <Text style={styles.settingDescription}>查看我们的隐私保护政策</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={rateAndFeedback}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>评分和反馈</Text>
                    <Text style={styles.settingDescription}>给我们评分或提供宝贵意见</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity 
              onPress={showAbout}
              activeOpacity={0.7}
            >
              <CardContent>
                <View style={styles.settingItem}> 
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>关于</Text>
                    <Text style={styles.settingDescription}>课程表助手 v2.0.0</Text>
                  </View>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </CardContent>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* 加载指示器 */}
      {isLoading && (
        <Portal>
          <Modal visible={isLoading} transparent={true}>
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>处理中...</Text>
              </View>
            </View>
          </Modal>
        </Portal>
      )}

      {/* 导入数据模态框 */}
      <Portal>
        <Modal
          visible={importModalVisible}
          onDismiss={() => setImportModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>导入数据</Text>
            <Text style={styles.modalDescription}>
              请选择要导入的课程表数据文件（JSON格式）。导入将覆盖现有所有数据。
            </Text>
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setImportModalVisible(false)}
                style={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={importData}
                style={styles.modalConfirmButton}
              >
                选择文件
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* 导出数据模态框 */}
      <Portal>
        <Modal
          visible={exportModalVisible}
          onDismiss={() => setExportModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>导出数据</Text>
            <Text style={styles.modalDescription}>
              导出的文件包含所有学期、课程和日程数据，请妥善保存。
            </Text>
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setExportModalVisible(false)}
                style={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={exportData}
                style={styles.modalConfirmButton}
              >
                导出
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* 主题设置模态框 */}
      <Portal>
        <Modal
          visible={themeModalVisible}
          onDismiss={() => setThemeModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择主题</Text>
            
            <View style={styles.themeOption}>
              <RadioButton
                value="light"
                status={selectedTheme === 'light' ? 'checked' : 'unchecked'}
                onPress={() => handleThemeSelect('light')}
                color="#3498db"
              />
              <Text style={styles.themeOptionText}>亮色主题</Text>
            </View>
            
            <View style={styles.themeOption}>
              <RadioButton
                value="dark"
                status={selectedTheme === 'dark' ? 'checked' : 'unchecked'}
                onPress={() => handleThemeSelect('dark')}
                color="#3498db"
              />
              <Text style={styles.themeOptionText}>暗色主题</Text>
            </View>
            
            <View style={styles.themeOption}>
              <RadioButton
                value="system"
                status={selectedTheme === 'system' ? 'checked' : 'unchecked'}
                onPress={() => handleThemeSelect('system')}
                color="#3498db"
              />
              <Text style={styles.themeOptionText}>跟随系统</Text>
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setThemeModalVisible(false)}
                style={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button 
                mode="contained" 
                onPress={confirmThemeChange}
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
    backgroundColor: '#3498db',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsContainer: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  settingCardDanger: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingTitleDanger: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e74c3c',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingDescriptionDanger: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 2,
  },
  arrowText: {
    fontSize: 18,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#999',
  },
  modalConfirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#3498db',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});

export default SettingsScreen;