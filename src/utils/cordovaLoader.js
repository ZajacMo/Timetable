// 检查是否在原生应用环境中运行
if (window.cordova || document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
  // 在原生应用环境中，动态加载cordova.js
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'cordova.js';
  document.head.appendChild(script);
} else {
  // 在浏览器环境中，创建一个模拟的cordova对象
  window.cordova = {
    plugins: {}
  };
  console.log('浏览器开发环境：已创建模拟cordova对象');
}