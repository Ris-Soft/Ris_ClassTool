// React 加载器
// 此脚本用于在插件中加载 React 和 ReactDOM

(function() {
  // 简化版的React实现，用于插件中
  window.React = {
    createElement: function(type, props, ...children) {
      return { type, props: props || {}, children };
    },
    
    Fragment: Symbol('Fragment'),
    
    useState: function(initialState) {
      // 这是一个非常简化的useState实现
      // 在实际应用中，你需要使用完整的React
      const state = typeof initialState === 'function' ? initialState() : initialState;
      const setState = function(newState) {
        console.log('setState called with:', newState);
        // 在简化版中，我们只记录状态变化
      };
      return [state, setState];
    }
  };
  
  // 简化版的ReactDOM实现
  window.ReactDOM = {
    render: function(element, container) {
      console.log('ReactDOM.render called with:', element);
      // 在简化版中，我们只记录渲染调用
    }
  };
  
  console.log('React 和 ReactDOM 简化版已加载');
  
  // 触发加载完成事件
  const event = new CustomEvent('react-ready');
  document.dispatchEvent(event);
})();