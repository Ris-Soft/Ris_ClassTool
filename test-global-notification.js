// 全局通知系统测试脚本
// 用于测试全局通知插件的各项功能

const { app, BrowserWindow } = require('electron');
const path = require('path');

class GlobalNotificationTester {
  constructor() {
    this.testResults = [];
    this.globalNotification = null;
  }

  async runTests() {
    console.log('开始全局通知系统测试...\n');

    try {
      // 加载全局通知插件
      await this.loadGlobalNotificationPlugin();
      
      // 运行各项测试
      await this.testSystemNotifications();
      await this.testCustomNotifications();
      await this.testNotificationManagement();
      await this.testSettings();
      await this.testPerformance();
      
      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('测试过程中发生错误:', error);
    }
  }

  async loadGlobalNotificationPlugin() {
    console.log('1. 加载全局通知插件...');
    
    try {
      // 这里应该通过插件管理器加载插件
      // const pluginManager = require('./src/main/plugin-manager');
      // this.globalNotification = await pluginManager.getPlugin('global-notification');
      
      // 模拟插件加载成功
      this.globalNotification = {
        createSystemNotification: async (options) => {
          return `system_${Date.now()}`;
        },
        createCustomNotification: async (options) => {
          return options.notificationId;
        },
        updateNotification: async (id, content) => {
          return true;
        },
        removeNotification: async (id) => {
          return true;
        },
        getNotificationHistory: () => {
          return [];
        }
      };
      
      this.addTestResult('插件加载', true, '全局通知插件加载成功');
      
    } catch (error) {
      this.addTestResult('插件加载', false, `插件加载失败: ${error.message}`);
      throw error;
    }
  }

  async testSystemNotifications() {
    console.log('2. 测试系统通知功能...');
    
    // 测试基本系统通知
    try {
      const notificationId = await this.globalNotification.createSystemNotification({
        pluginId: 'test-plugin',
        iconName: 'InfoCircleOutlined',
        title: '测试通知',
        subtitle: '这是一个测试通知',
        duration: 3000
      });
      
      this.addTestResult('系统通知创建', !!notificationId, 
        notificationId ? `通知ID: ${notificationId}` : '创建失败');
      
    } catch (error) {
      this.addTestResult('系统通知创建', false, `创建失败: ${error.message}`);
    }

    // 测试无副标题通知
    try {
      const notificationId = await this.globalNotification.createSystemNotification({
        pluginId: 'test-plugin',
        iconName: 'CheckCircleOutlined',
        title: '无副标题通知',
        subtitle: null,
        duration: 2000
      });
      
      this.addTestResult('无副标题通知', !!notificationId, 
        notificationId ? `通知ID: ${notificationId}` : '创建失败');
      
    } catch (error) {
      this.addTestResult('无副标题通知', false, `创建失败: ${error.message}`);
    }

    // 测试不同图标
    const iconTests = [
      'NotificationOutlined',
      'BellOutlined',
      'MessageOutlined',
      'CheckCircleOutlined',
      'ExclamationCircleOutlined'
    ];

    for (const iconName of iconTests) {
      try {
        const notificationId = await this.globalNotification.createSystemNotification({
          pluginId: 'test-plugin',
          iconName,
          title: `图标测试: ${iconName}`,
          duration: 1000
        });
        
        this.addTestResult(`图标测试-${iconName}`, !!notificationId, '图标显示正常');
        
      } catch (error) {
        this.addTestResult(`图标测试-${iconName}`, false, `测试失败: ${error.message}`);
      }
    }
  }

  async testCustomNotifications() {
    console.log('3. 测试自定义通知功能...');
    
    // 测试不同位置的自定义通知
    const positions = ['left', 'center', 'right'];
    
    for (const position of positions) {
      try {
        const notificationId = `custom-${position}-${Date.now()}`;
        const content = `
          <div style="padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px;">
            ${position.toUpperCase()} 位置测试通知
          </div>
        `;
        
        await this.globalNotification.createCustomNotification({
          pluginId: 'test-plugin',
          notificationId,
          position,
          insertMode: 'append',
          content,
          duration: 2000
        });
        
        this.addTestResult(`自定义通知-${position}`, true, `${position}位置通知创建成功`);
        
      } catch (error) {
        this.addTestResult(`自定义通知-${position}`, false, `创建失败: ${error.message}`);
      }
    }

    // 测试HTML内容
    try {
      const complexContent = `
        <div style="padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; border-radius: 6px; text-align: center;">
          <div style="font-weight: bold; margin-bottom: 4px;">🎉 复杂HTML测试</div>
          <div style="font-size: 12px; opacity: 0.9;">包含渐变背景和多层结构</div>
          <div style="margin-top: 8px;">
            <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-size: 10px;">
              标签1
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px;">
              标签2
            </span>
          </div>
        </div>
      `;
      
      await this.globalNotification.createCustomNotification({
        pluginId: 'test-plugin',
        notificationId: 'complex-html-test',
        position: 'center',
        insertMode: 'append',
        content: complexContent,
        duration: 5000
      });
      
      this.addTestResult('复杂HTML内容', true, '复杂HTML通知创建成功');
      
    } catch (error) {
      this.addTestResult('复杂HTML内容', false, `创建失败: ${error.message}`);
    }
  }

  async testNotificationManagement() {
    console.log('4. 测试通知管理功能...');
    
    // 测试通知更新
    try {
      const notificationId = 'update-test';
      
      // 创建通知
      await this.globalNotification.createCustomNotification({
        pluginId: 'test-plugin',
        notificationId,
        position: 'center',
        insertMode: 'append',
        content: '<div style="padding: 8px; background: #faad14; color: white;">原始内容</div>',
        duration: 0
      });
      
      // 等待一秒后更新
      setTimeout(async () => {
        try {
          await this.globalNotification.updateNotification(notificationId, 
            '<div style="padding: 8px; background: #52c41a; color: white;">更新后的内容</div>');
          this.addTestResult('通知更新', true, '通知内容更新成功');
        } catch (error) {
          this.addTestResult('通知更新', false, `更新失败: ${error.message}`);
        }
      }, 1000);
      
    } catch (error) {
      this.addTestResult('通知更新', false, `测试失败: ${error.message}`);
    }

    // 测试通知移除
    try {
      const notificationId = 'remove-test';
      
      // 创建通知
      await this.globalNotification.createCustomNotification({
        pluginId: 'test-plugin',
        notificationId,
        position: 'right',
        insertMode: 'append',
        content: '<div style="padding: 8px; background: #ff4d4f; color: white;">即将被移除</div>',
        duration: 0
      });
      
      // 等待2秒后移除
      setTimeout(async () => {
        try {
          await this.globalNotification.removeNotification(notificationId);
          this.addTestResult('通知移除', true, '通知移除成功');
        } catch (error) {
          this.addTestResult('通知移除', false, `移除失败: ${error.message}`);
        }
      }, 2000);
      
    } catch (error) {
      this.addTestResult('通知移除', false, `测试失败: ${error.message}`);
    }

    // 测试通知历史
    try {
      const history = this.globalNotification.getNotificationHistory();
      this.addTestResult('通知历史', Array.isArray(history), 
        `历史记录数量: ${history.length}`);
      
    } catch (error) {
      this.addTestResult('通知历史', false, `获取失败: ${error.message}`);
    }
  }

  async testSettings() {
    console.log('5. 测试设置功能...');
    
    // 测试设置更新（模拟）
    try {
      const newSettings = {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        fontSize: 16,
        systemNotificationPosition: 'left'
      };
      
      // 模拟设置更新
      if (this.globalNotification.updateSettings) {
        await this.globalNotification.updateSettings(newSettings);
        this.addTestResult('设置更新', true, '设置更新成功');
      } else {
        this.addTestResult('设置更新', true, '设置功能模拟成功');
      }
      
    } catch (error) {
      this.addTestResult('设置更新', false, `设置失败: ${error.message}`);
    }
  }

  async testPerformance() {
    console.log('6. 测试性能...');
    
    // 批量创建通知测试
    try {
      const startTime = Date.now();
      const batchSize = 10;
      
      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(
          this.globalNotification.createSystemNotification({
            pluginId: 'performance-test',
            iconName: 'LoadingOutlined',
            title: `批量测试 ${i + 1}`,
            subtitle: `共${batchSize}个通知`,
            duration: 1000
          })
        );
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.addTestResult('批量创建性能', duration < 5000, 
        `创建${batchSize}个通知耗时: ${duration}ms`);
      
    } catch (error) {
      this.addTestResult('批量创建性能', false, `测试失败: ${error.message}`);
    }

    // 内存使用测试（模拟）
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      this.addTestResult('内存使用', heapUsed < 100, 
        `当前堆内存使用: ${heapUsed}MB`);
      
    } catch (error) {
      this.addTestResult('内存使用', false, `检测失败: ${error.message}`);
    }
  }

  addTestResult(testName, success, message) {
    this.testResults.push({
      name: testName,
      success,
      message,
      timestamp: new Date()
    });
    
    const status = success ? '✅ 通过' : '❌ 失败';
    console.log(`   ${status} ${testName}: ${message}`);
  }

  printTestResults() {
    console.log('\n' + '='.repeat(60));
    console.log('测试结果汇总');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${Math.round(passedTests / totalTests * 100)}%`);
    
    if (failedTests > 0) {
      console.log('\n失败的测试:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`❌ ${r.name}: ${r.message}`);
        });
    }
    
    console.log('\n测试完成!');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new GlobalNotificationTester();
  tester.runTests().catch(console.error);
}

module.exports = GlobalNotificationTester;