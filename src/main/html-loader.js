const fs = require('fs-extra');
const path = require('path');
const AntDesignProvider = require('./antd-provider');

/**
 * HTML文件加载器
 * 支持从插件目录加载HTML文件，并支持外部HTML文件引用
 */
class HtmlLoader {
  /**
   * 从插件目录加载HTML文件
   * @param {string} pluginPath - 插件根目录路径
   * @param {string} htmlFile - HTML文件相对路径
   * @returns {Promise<string>} - HTML内容
   */
  static async loadHtmlFile(pluginPath, htmlFile) {
    try {
      const htmlPath = path.join(pluginPath, htmlFile);
      
      if (!await fs.pathExists(htmlPath)) {
        throw new Error(`HTML文件不存在: ${htmlPath}`);
      }
      
      let htmlContent = await fs.readFile(htmlPath, 'utf-8');
      
      // 处理外部资源引用
      htmlContent = await this.processExternalReferences(htmlContent, pluginPath, path.dirname(htmlPath));
      
      return htmlContent;
    } catch (error) {
      console.error('加载HTML文件失败:', error);
      throw error;
    }
  }
  
  /**
   * 处理HTML中的外部资源引用
   * @param {string} htmlContent - HTML内容
   * @param {string} pluginPath - 插件根目录路径
   * @param {string} basePath - HTML文件所在目录路径
   * @returns {Promise<string>} - 处理后的HTML内容
   */
  static async processExternalReferences(htmlContent, pluginPath, basePath) {
    // 处理外部脚本引用
    htmlContent = await this.processScriptTags(htmlContent, pluginPath, basePath);
    
    // 处理外部样式引用
    htmlContent = await this.processStyleTags(htmlContent, pluginPath, basePath);
    
    // 注入Ant Design资源
    htmlContent = this.injectAntDesignResources(htmlContent);
    
    return htmlContent;
  }
  
  /**
   * 注入Ant Design资源到HTML中
   * @param {string} htmlContent - HTML内容
   * @returns {string} - 注入后的HTML内容
   */
  static injectAntDesignResources(htmlContent) {
    // 获取Ant Design样式
    const antdStyle = AntDesignProvider.generateStyleLink();
    
    // 构建脚本标签
    const scriptTags = `
      <script src="/plugin-resources/react-loader.js"></script>
      <script src="/plugin-resources/antd-loader.js"></script>
    `;
    
    // 在head标签中注入Ant Design样式
    let processedHtml = htmlContent.replace(/<head([^>]*)>/i, `<head$1>${antdStyle}`);
    
    // 在body结束标签前注入脚本
    processedHtml = processedHtml.replace(/<\/body>/i, `${scriptTags}</body>`);
    
    return processedHtml;
  }
  
  /**
   * 处理HTML中的脚本标签
   * @param {string} htmlContent - HTML内容
   * @param {string} pluginPath - 插件根目录路径
   * @param {string} basePath - HTML文件所在目录路径
   * @returns {Promise<string>} - 处理后的HTML内容
   */
  static async processScriptTags(htmlContent, pluginPath, basePath) {
    // 正则表达式匹配脚本标签
    const scriptRegex = /<script\s+src=["']([^"']+)["'][^>]*><\/script>/g;
    let match;
    let processedHtml = htmlContent;
    
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      const scriptTag = match[0];
      const scriptSrc = match[1];
      
      // 只处理相对路径
      if (!scriptSrc.startsWith('http://') && !scriptSrc.startsWith('https://') && !scriptSrc.startsWith('//')) {
        try {
          const scriptPath = path.join(basePath, scriptSrc);
          
          if (await fs.pathExists(scriptPath)) {
            const scriptContent = await fs.readFile(scriptPath, 'utf-8');
            const inlineScript = `<script>\n${scriptContent}\n</script>`;
            
            // 替换外部脚本标签为内联脚本
            processedHtml = processedHtml.replace(scriptTag, inlineScript);
          }
        } catch (error) {
          console.error(`处理脚本文件失败: ${scriptSrc}`, error);
        }
      }
    }
    
    return processedHtml;
  }
  
  /**
   * 处理HTML中的样式标签
   * @param {string} htmlContent - HTML内容
   * @param {string} pluginPath - 插件根目录路径
   * @param {string} basePath - HTML文件所在目录路径
   * @returns {Promise<string>} - 处理后的HTML内容
   */
  static async processStyleTags(htmlContent, pluginPath, basePath) {
    // 正则表达式匹配样式标签
    const styleRegex = /<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["'][^>]*\/?>/g;
    let match;
    let processedHtml = htmlContent;
    
    while ((match = styleRegex.exec(htmlContent)) !== null) {
      const styleTag = match[0];
      const styleSrc = match[1];
      
      // 只处理相对路径
      if (!styleSrc.startsWith('http://') && !styleSrc.startsWith('https://') && !styleSrc.startsWith('//')) {
        try {
          const stylePath = path.join(basePath, styleSrc);
          
          if (await fs.pathExists(stylePath)) {
            const styleContent = await fs.readFile(stylePath, 'utf-8');
            const inlineStyle = `<style>\n${styleContent}\n</style>`;
            
            // 替换外部样式标签为内联样式
            processedHtml = processedHtml.replace(styleTag, inlineStyle);
          }
        } catch (error) {
          console.error(`处理样式文件失败: ${styleSrc}`, error);
        }
      }
    }
    
    return processedHtml;
  }
}

module.exports = HtmlLoader;