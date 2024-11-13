let isDarkMode = false;
let collectedReactCode = {
  jsx: null,
  css: null
};

// Helper function to detect React/JSX code
function isReactCode(code) {
  const reactPatterns = [
    /import\s+.*?['"]react['"]/i,
    /import\s+.*?from\s+['"]react['"]/i,
    /React\.(Component|createElement|useState|useEffect)/,
    /function\s+[A-Z][A-Za-z0-9]*\s*\(/,
    /class\s+[A-Z][A-Za-z0-9]*\s+extends\s+React\.Component/,
    /const\s+[A-Z][A-Za-z0-9]*\s*=\s*\(/,
    /<[A-Z][A-Za-z0-9]*\s*[^>]*>/,
    /jsx|tsx/i
  ];

  return reactPatterns.some(pattern => pattern.test(code));
}

// Helper function to detect CSS code
function isCSSCode(code) {
  // Look for common CSS patterns
  return code.includes('{') &&
    (code.includes('px') || code.includes('em') || code.includes('rem') ||
      code.includes('width') || code.includes('height') || code.includes('margin'));
}



function addButtons(codeBlock) {
  if (codeBlock.dataset.buttonsAdded) return;

  const code = codeBlock.textContent.trim();
  if (!code) return;

  const isReact = isReactCode(code);
  const isCSS = isCSSCode(code);

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'code-buttons';

  if (isReact || isCSS) {
    const collectBtn = createButton(
      isReact ? 'Collect JSX' : 'Collect CSS',
      function () {
        const latestCode = codeBlock.textContent.trim(); // 获取最新的代码
        collectCode(latestCode, isReact ? 'jsx' : 'css');
      },
      'collect-btn'
    );
    buttonsDiv.append(collectBtn);
  }

  const previewBtn = createButton('Preview Code',
    function () {
      const latestCode = codeBlock.textContent.trim(); // 获取最新的代码
      togglePreview(latestCode, codeBlock.className);
    },
    'preview-btn'
  );

  buttonsDiv.append(previewBtn);
  codeBlock.parentNode.insertBefore(buttonsDiv, codeBlock.nextSibling);
  codeBlock.dataset.buttonsAdded = 'true';
}



// 修改 collectCode 函数
function collectCode(code, type) {
  if (type === 'jsx') {
    code = preprocessReactCode(code);
  }
  collectedReactCode[type] = code;
  showTemporaryMessage(`${type.toUpperCase()} code collected`);

  // 如果同时有 JSX 和 CSS，自动打开预览
  if (collectedReactCode.jsx && collectedReactCode.css) {
    togglePreview(collectedReactCode.jsx, 'language-react', collectedReactCode.css);
  }
}



// 添加错误处理函数
function handleReactError(error, rootElement) {
  const errorMessage = document.createElement('div');
  errorMessage.style.color = 'red';
  errorMessage.style.padding = '20px';
  errorMessage.innerHTML = `
    <h3>Error rendering component:</h3>
    <pre>${error.toString()}</pre>
  `;
  rootElement.appendChild(errorMessage);
  console.error('React rendering error:', error);
}




function createButton(text, onClick, className = '') {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.addEventListener('click', onClick);
  if (className) button.className = className;
  return button;
}



function togglePreview(code, codeLanguage, cssCode = null) {
  let previewContainer = document.getElementById('code-preview-container');

  if (previewContainer) {
    previewContainer.style.transform = 'translateX(100%)';
    setTimeout(() => previewContainer.remove(), 300);
    document.body.style.width = '100%';
    return;
  }

  previewContainer = createPreviewContainer(codeLanguage, code);  // 传入代码内容
  document.body.appendChild(previewContainer);

  const previewIframe = document.createElement('iframe');
  previewIframe.id = 'code-preview-content';
  previewIframe.style.width = '100%';
  previewIframe.style.height = 'calc(100% - 150px)';
  previewIframe.style.border = 'none';
  previewIframe.style.display = 'block';
  previewContainer.appendChild(previewIframe);

  // 创建代码视图
  const codeView = document.createElement('pre');
  codeView.id = 'code-preview-code';
  codeView.style.display = 'none';
  codeView.style.backgroundColor = '#f5f5f5';
  codeView.style.color = '#333';
  codeView.style.padding = '15px';
  codeView.style.borderRadius = '5px';
  codeView.style.overflow = 'auto';
  codeView.style.maxHeight = 'calc(100% - 150px)';
  codeView.style.fontFamily = "Consolas, Monaco, 'Courier New', monospace";
  codeView.style.fontSize = '14px';
  codeView.style.lineHeight = '1.5';
  codeView.style.whiteSpace = 'pre-wrap';
  codeView.style.wordWrap = 'break-word';

  const codeElement = document.createElement('code');
  codeElement.textContent = code;

  codeView.appendChild(codeElement);
  previewContainer.appendChild(codeView);

  setupPreviewControls(previewContainer, previewIframe, code, codeLanguage, cssCode);
  loadCodeInIframe(previewIframe, code, codeLanguage, cssCode);
}




function createPreviewContainer(codeLanguage, code) {
  const container = document.createElement('div');
  container.id = 'code-preview-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.width = '40%';
  container.style.height = '100%';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '1000';
  container.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.2)';
  container.style.overflow = 'auto';
  container.style.transition = 'transform 0.3s ease-in-out';



  // 动态设置标题
  let title = 'Code Preview';

  // 检查代码是否包含HTML、CSS和JavaScript的组合
  function isWebPageCode(code) {
    const hasHTML = /<\w+>.*<\/\w+>/s.test(code);
    const hasCSS = /{[\s\S]*}/.test(code) && /style|@media|@keyframes/.test(code);
    const hasJS = /function|var|let|const|if|for|while/.test(code);
    return hasHTML && (hasCSS || hasJS);
  }

  if (codeLanguage.includes('language-react') || codeLanguage.includes('language-jsx')) {
    title = 'React Component Preview';
  } else if (isWebPageCode(code)) {  // 使用代码内容判断是否为网页代码
    title = 'Web Page Preview';
  } else if (codeLanguage.includes('language-html')) {
    title = 'HTML Preview';
  } else if (codeLanguage.includes('language-vue')) {
    title = 'Vue Preview';
  } else if (codeLanguage.includes('language-css')) {
    title = 'CSS Preview';
  } else if (codeLanguage.includes('language-javascript') || codeLanguage.includes('language-js')) {
    title = 'JavaScript Preview';
  }




  // Add top controls
  const topControls = document.createElement('div');
  topControls.className = 'preview-controls top';
  topControls.innerHTML = `
    <div class="preview-title">${title}</div>
    <div class="preview-tabs">
      <button id="preview-tab" class="tab-btn active">Preview</button>
      <button id="code-tab" class="tab-btn">Code</button>
    </div>
    <div class="right-controls">
      <button class="reload-btn">🔄</button>
      <button class="close-btn">❌</button>
    </div>
  `;
  container.appendChild(topControls);

  return container;
}



function setupPreviewControls(container, previewIframe, code, codeLanguage, cssCode) {
  const codeView = document.getElementById('code-preview-code');
  const cssView = document.getElementById('css-preview-code');

  document.querySelector('.close-btn').addEventListener('click', () => {
    container.style.transform = 'translateX(100%)';
    setTimeout(() => {
      container.remove();
      collectedReactCode = { jsx: null, css: null }; // 重置已收集的代码
    }, 300);
    document.body.style.width = '100%';
  });

  document.querySelector('.reload-btn').addEventListener('click', () => {
    loadCodeInIframe(previewIframe, code, codeLanguage, cssCode);
  });

  const previewTab = document.getElementById('preview-tab');
  const codeTab = document.getElementById('code-tab');

  previewTab.addEventListener('click', () => {
    previewIframe.style.display = 'block';
    codeView.style.display = 'none';
    if (cssView) cssView.style.display = 'none';
    previewTab.classList.add('active');
    codeTab.classList.remove('active');
  });

  codeTab.addEventListener('click', () => {
    previewIframe.style.display = 'none';
    codeView.style.display = 'block';
    if (cssView) cssView.style.display = 'block';
    codeTab.classList.add('active');
    previewTab.classList.remove('active');
  });

  // 添加底部控制按钮用于复制和下载
  const bottomControls = document.createElement('div');
  bottomControls.className = 'preview-controls bottom';
  bottomControls.innerHTML = `
    <button class="copy-btn">📋 Copy Code</button>
    <button class="download-btn">⬇️ Download Code</button>
  `;
  container.appendChild(bottomControls);

  document.querySelector('.copy-btn').addEventListener('click', () => {
    const fullCode = cssCode ? `${code}\n\n/* CSS */\n${cssCode}` : code;
    copyCode(fullCode);
  });

  document.querySelector('.download-btn').addEventListener('click', () => {
    const fullCode = cssCode ? `${code}\n\n/* CSS */\n${cssCode}` : code;
    downloadCode(fullCode);
  });
}




function loadCodeInIframe(iframe, code, codeLanguage, cssCode = null) {
  if (codeLanguage.includes('language-vue')) {
    loadVueComponent(iframe, code);
  } else if (codeLanguage.includes('language-react') || codeLanguage.includes('language-jsx')) {
    // 处理可能的 import 语句
    const codeWithoutImports = code.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');

    // 处理可能的 export 语句
    const codeWithoutExports = codeWithoutImports.replace(/export\s+default\s+/, '');

    getScriptContent('libs/react.development.js', (reactScriptContent) => {
      getScriptContent('libs/react-dom.development.js', (reactDOMScriptContent) => {
        getScriptContent('libs/babel.min.js', (babelScriptContent) => {
          const iframeContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                ${cssCode || ''}
                /* 添加一些基础样式 */
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                #root {
                  width: 100%;
                  height: 100%;
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script>${reactScriptContent}</script>
              <script>${reactDOMScriptContent}</script>
              <script>${babelScriptContent}</script>
              <script type="text/babel">
                // 设置全局 React 和 ReactDOM
                window.React = React;
                window.ReactDOM = ReactDOM;

                // 包装代码以确保正确渲染
                try {
                  ${codeWithoutExports}
                  
                  // 获取最后一个定义的组件或函数
                  const componentNames = Object.keys(window).filter(key => {
                    try {
                      return typeof window[key] === 'function' && 
                             /^[A-Z]/.test(key) && 
                             window[key].toString().includes('React');
                    } catch (e) {
                      return false;
                    }
                  });
                  
                  const Component = window[componentNames[componentNames.length - 1]] || (() => {
                    // 如果没有找到组件，尝试直接执行代码
                    ${codeWithoutExports}
                    return <div>Component rendered</div>;
                  });

                  // 渲染组件
                  ReactDOM.render(
                    <React.StrictMode>
                      <Component />
                    </React.StrictMode>,
                    document.getElementById('root')
                  );
                } catch (error) {
                  // 显示错误信息
                  document.getElementById('root').innerHTML = 
                    '<div style="color: red; padding: 20px;">' +
                    '<h3>Error rendering component:</h3>' +
                    '<pre>' + error.toString() + '</pre>' +
                    '</div>';
                  console.error('Error rendering React component:', error);
                }
              </script>
            </body>
            </html>
          `;
          iframe.srcdoc = iframeContent;
        });
      });
    });
  } else {
    // 处理非React代码
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssCode || ''}</style>
      </head>
      <body>
        ${code}
      </body>
      </html>
    `;
  }
}





function loadVueComponent(iframe, code) {
  // Parse the Vue SFC
  const templateMatch = code.match(/<template>([\s\S]*)<\/template>/);
  const scriptMatch = code.match(/<script>([\s\S]*)<\/script>/);
  const styleMatch = code.match(/<style[^>]*>([\s\S]*)<\/style>/);

  const template = templateMatch ? templateMatch[1].trim() : '';
  const script = scriptMatch ? scriptMatch[1].trim() : '';
  const style = styleMatch ? styleMatch[1].trim() : '';

  const processedScript = script
    .replace('export default', 'const componentDefinition =')
    .replace(/import\s+.*['"].*['"]/g, '');

  // Get the URL for vue.global.js
  const vueScriptUrl = chrome.runtime.getURL('libs/vue.global.js');

  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${style}
      </style>
      <script src="${vueScriptUrl}"></script>
    </head>
    <body>
      <div id="app">${template}</div>
      <script>
        (function() {
          ${processedScript}

          if (typeof componentDefinition === 'undefined') {
            throw new Error('Component definition not found');
          }

          const app = Vue.createApp({
            ...componentDefinition,
            template: \`${template}\`
          });

          try {
            app.mount('#app');
            console.log('Vue app mounted successfully');
          } catch (error) {
            document.body.innerHTML = \`
              <div style="color: red; padding: 20px;">
                <h3>Error rendering Vue component:</h3>
                <pre>\${error.toString()}</pre>
              </div>
            \`;
            console.error('Vue rendering error:', error);
          }
        })();
      </script>
    </body>
    </html>
  `;

  // Set the iframe content
  iframe.srcdoc = iframeContent;

  // Update code view
  const codeView = document.getElementById('code-preview-code');
  if (codeView) {
    codeView.innerHTML = '';

    const codeElement = document.createElement('code');
    codeElement.className = 'language-vue';
    codeElement.textContent = code;

    codeView.style.backgroundColor = '#1e1e1e';
    codeView.style.color = '#d4d4d4';
    codeView.style.padding = '15px';
    codeView.style.borderRadius = '5px';
    codeView.style.overflow = 'auto';
    codeView.style.height = 'calc(100% - 150px)';

    codeView.appendChild(codeElement);
  }
}





// 添加新的辅助函数来处理React组件代码
function preprocessReactCode(code) {
  // 移除所有 import 语句
  code = code.replace(/import\s+[^;]+;?\s*/g, '');

  // 移除 export 语句
  code = code.replace(/export\s+default\s+/, '');

  // 如果代码中使用了 useState 等 hooks，确保正确引入
  if (code.includes('useState') || code.includes('useEffect') || code.includes('useRef')) {
    code = `const { useState, useEffect, useRef } = React;\n${code}`;
  }

  return code;
}



function getScriptContent(scriptPath, callback) {
  chrome.runtime.sendMessage({ action: 'getScriptContent', scriptPath: scriptPath }, (response) => {
    if (response && response.success) {
      callback(response.content);
    } else {
      console.error('Failed to get script content:', response.error);
    }
  });
}




function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showTemporaryMessage('Code copied to clipboard');
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}

function downloadCode(code) {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'react-component.txt';
  a.click();
  URL.revokeObjectURL(url);
  showTemporaryMessage('Code downloaded successfully');
}

function showTemporaryMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'temporary-message';
  messageDiv.textContent = message;
  messageDiv.style.position = 'fixed';
  messageDiv.style.bottom = '20px';
  messageDiv.style.right = '20px';
  messageDiv.style.backgroundColor = '#4CAF50';
  messageDiv.style.color = '#fff';
  messageDiv.style.padding = '10px 20px';
  messageDiv.style.borderRadius = '5px';
  messageDiv.style.zIndex = '1001';
  messageDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  document.body.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
}



const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const codeBlocks = node.querySelectorAll('pre code');
          codeBlocks.forEach(codeBlock => {
            if (!codeBlock.dataset.buttonsAdded) {
              // 为每个新的代码块添加独立的观察者
              observeCodeBlockContent(codeBlock);
            }
          });
        }
      });
    }
  });
});



observer.observe(document.body, { childList: true, subtree: true });
// setInterval(addButtonsToExistingCodeBlocks, 1000);



// 为代码块添加内容观察者的函数
function observeCodeBlockContent(codeBlock) {
  let contentChanged = false;
  let lastContent = codeBlock.textContent.trim();

  const codeObserver = new MutationObserver(() => {
    const currentContent = codeBlock.textContent.trim();
    if (currentContent !== lastContent) {
      lastContent = currentContent;
      contentChanged = true;
      return;
    }

    if (contentChanged) {
      // 内容已稳定，处理代码块
      codeObserver.disconnect();
      addButtons(codeBlock);
    }
  });

  // 配置观察选项，监听子节点和字符数据的变化
  codeObserver.observe(codeBlock, { childList: true, subtree: true, characterData: true });

  // 设置超时，防止无限等待
  setTimeout(() => {
    codeObserver.disconnect();
    if (!codeBlock.dataset.buttonsAdded) {
      addButtons(codeBlock);
    }
  }, 3000); // 3秒后强制处理
}



