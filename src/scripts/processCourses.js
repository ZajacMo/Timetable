import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的__dirname（ES模块中没有__dirname全局变量）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 处理课程数据，将同一课程的不同时间段信息整合为该课程对象的一个数组属性
 */
async function processCourseData() {
    try {
        // 读取原始数据文件
        const filePath = path.join(__dirname, '../../courses.json');
        const rawData = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(rawData);
        
        console.log('成功读取courses.json文件');
        console.log('数据包含的主要部分:', Object.keys(data));
        
        // 确保kbList存在
        if (!data.kbList || !Array.isArray(data.kbList)) {
            console.error('kbList不存在或不是数组');
            return;
        }
        
        console.log(`共有${data.kbList.length}条课程安排记录`);
        
        // 创建一个Map用于存储按课程名称和教师分组的课程信息
        const coursesMap = new Map();
        
        // 遍历kbList中的每一条记录
        data.kbList.forEach((courseInfo, index) => {
            // 使用课程名称和教师姓名作为唯一标识符
            const key = `${courseInfo.kcmc || '未知课程'}-${courseInfo.xm || '未知教师'}`;
            
            if (!coursesMap.has(key)) {
                // 如果是新课程，创建一个新的课程对象
                const course = {
                    kcmc: courseInfo.kcmc || '未知课程',  // 课程名称
                    xm: courseInfo.xm || '未知教师',        // 教师姓名
                    kch: courseInfo.kch || '',             // 课程号
                    kclb: courseInfo.kclb || '',           // 课程类别
                    kcxz: courseInfo.kcxz || '',           // 课程性质
                    xf: courseInfo.xf || '',               // 学分
                    courseSchedules: []                    // 课程安排数组
                };
                coursesMap.set(key, course);
            }
            
            // 将当前的课程安排添加到对应的课程对象中
            const course = coursesMap.get(key);
            course.courseSchedules.push({
                jc: courseInfo.jc || '',                 // 节次
                xqj: courseInfo.xqj || '',               // 星期几
                xqjmc: courseInfo.xqjmc || '',           // 星期几名称
                cdmc: courseInfo.cdmc || '',             // 教室名称
                zcd: courseInfo.zcd || '',               // 周次
                skfsmc: courseInfo.skfsmc || '',         // 授课方式
                jxb_id: courseInfo.jxb_id || '',         // 教学班ID
                jxbmc: courseInfo.jxbmc || '',           // 教学班名称
                originalIndex: index                     // 原始索引，用于调试
            });
        });
        
        // 将Map转换为数组
        const processedCourses = Array.from(coursesMap.values());
        
        console.log(`处理后共有${processedCourses.length}门课程`);
        
        // 创建结果对象，包含元数据和处理后的课程数据
        const result = {
            qsxqj: data.qsxqj,
            xsxx: data.xsxx,
            totalCourses: processedCourses.length,
            courses: processedCourses
        };
        
        // 保存处理后的数据到新文件
        const outputFilePath = path.join(__dirname, '../../processedCourses.json');
        await fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), 'utf8');
        
        console.log(`课程数据处理完成，已保存到${outputFilePath}`);
        
        // 显示前几门课程的简要信息
        console.log('\n前5门课程的简要信息:');
        processedCourses.slice(0, 5).forEach((course, index) => {
            console.log(`${index + 1}. ${course.kcmc} - ${course.xm} (${course.courseSchedules.length}个时间段)`);
        });
        
    } catch (error) {
        console.error('处理课程数据时出错:', error);
    }
}

// 执行处理函数
processCourseData();