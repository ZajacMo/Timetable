import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// 导入屏幕组件
import TimetableScreen from './screens/TimetableScreen';
import CoursesScreen from './screens/CoursesScreen';
import SchedulesScreen from './screens/SchedulesScreen';
import SemesterScreen from './screens/SemesterScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 创建主标签导航
const MainTabNavigator = ({ dataManager }) => {
  return (
    <Tab.Navigator
      initialRouteName="Timetable"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          ...Platform.select({
            ios: {
              paddingBottom: 10,
              paddingTop: 10,
            },
            android: {
              paddingBottom: 8,
              paddingTop: 8,
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Timetable"
        component={() => <TimetableScreen dataManager={dataManager} />}
        options={{
          title: '课程表',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={() => <CoursesScreen dataManager={dataManager} />}
        options={{
          title: '课程',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedules"
        component={() => <SchedulesScreen dataManager={dataManager} />}
        options={{
          title: '日程',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Semester"
        component={() => <SemesterScreen dataManager={dataManager} />}
        options={{
          title: '学期',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={() => <SettingsScreen dataManager={dataManager} />}
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 创建嵌套导航堆栈
const AppNavigator = ({ dataManager }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerMode: 'none',
          animationEnabled: true,
        }}
      >
        <Stack.Screen
          name="Main"
          component={() => <MainTabNavigator dataManager={dataManager} />}
          options={{
            animationEnabled: false,
          }}
        />
        {/* 这里可以添加更多的堆栈屏幕，用于非标签页导航 */}
        {/* 例如详情页、编辑页等 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;