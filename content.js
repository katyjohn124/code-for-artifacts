// content.js
let isDarkMode = false;

function addButtons(codeBlock) {
  if (codeBlock.dataset.buttonsAdded) return;

  const codeLanguage = codeBlock.className; // e.g., "language-javascript"
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'code-buttons';

  const previewBtn = createButton('Preview Code', () => togglePreview(codeBlock.textContent, codeLanguage), 'preview-btn');

  buttonsDiv.append(previewBtn);
  codeBlock.parentNode.insertBefore(buttonsDiv, codeBlock.nextSibling);
  codeBlock.dataset.buttonsAdded = 'true';
}


function createButton(text, onClick, className = '') {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.addEventListener('click', onClick);
  if (className) button.className = className;
  return button;
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


function togglePreview(code, codeLanguage) {
  let previewContainer = document.getElementById('code-preview-container');

  if (previewContainer) {
    previewContainer.style.transform = 'translateX(100%)';
    setTimeout(() => previewContainer.remove(), 300);
    document.body.style.width = '100%';
    return;
  }

  previewContainer = document.createElement('div');
  previewContainer.id = 'code-preview-container';
  previewContainer.style.position = 'fixed';
  previewContainer.style.top = '0';
  previewContainer.style.right = '0';
  previewContainer.style.width = '40%';
  previewContainer.style.height = '100%';
  previewContainer.style.backgroundColor = '#ffffff';
  previewContainer.style.zIndex = '1000';
  previewContainer.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.2)';
  previewContainer.style.overflow = 'auto';
  previewContainer.style.transition = 'transform 0.3s ease-in-out';
  previewContainer.style.transform = 'translateX(0)';

  document.body.style.width = '60%'; // Adjust main content width

  // Create top control bar (title + tabs + buttons)
  const topControlsDiv = document.createElement('div');
  topControlsDiv.className = 'preview-controls top';
  topControlsDiv.style.display = 'flex';
  topControlsDiv.style.justifyContent = 'space-between';
  topControlsDiv.style.alignItems = 'center';
  topControlsDiv.style.padding = '10px';
  topControlsDiv.style.backgroundColor = '#f1f1f1';
  topControlsDiv.innerHTML = `
    <div class="preview-title">Project Title</div>
    <div class="preview-tabs">
      <button id="preview-tab" class="tab-btn active">Preview</button>
      <button id="code-tab" class="tab-btn">Code</button>
    </div>
    <div class="right-controls">
      <button class="reload-btn">🔄</button>
      <button class="close-btn">❌</button>
    </div>
  `;
  previewContainer.appendChild(topControlsDiv);

  const previewIframe = document.createElement('iframe');
  previewIframe.id = 'code-preview-content';
  previewIframe.style.width = '100%';
  previewIframe.style.height = 'calc(100% - 150px)';
  previewIframe.style.border = 'none';
  previewIframe.style.display = 'block';
  previewContainer.appendChild(previewIframe);

  const codeView = document.createElement('pre');
  codeView.id = 'code-preview-code';
  codeView.style.display = 'none';
  codeView.textContent = code;
  codeView.style.height = 'calc(100% - 150px)';
  codeView.style.padding = '10px';
  codeView.style.overflow = 'auto';
  previewContainer.appendChild(codeView);

  document.body.appendChild(previewContainer);

  const bottomControlsDiv = document.createElement('div');
  bottomControlsDiv.className = 'preview-controls bottom';
  bottomControlsDiv.style.position = 'absolute';
  bottomControlsDiv.style.bottom = '10px';
  bottomControlsDiv.style.right = '10px';
  bottomControlsDiv.innerHTML = `
    <button class="copy-btn">📋 Copy Code</button>
    <button class="download-btn">⬇️ Download Code</button>
  `;
  previewContainer.appendChild(bottomControlsDiv);

  document.querySelector('.close-btn').addEventListener('click', () => {
    previewContainer.style.transform = 'translateX(100%)';
    setTimeout(() => previewContainer.remove(), 300);
    document.body.style.width = '100%';
  });
  document.querySelector('.copy-btn').addEventListener('click', () => {
    copyCode(code);
    showTemporaryMessage('Code copied to clipboard');
  });
  document.querySelector('.download-btn').addEventListener('click', () => {
    downloadCode(code);
    showTemporaryMessage('Code downloaded successfully');
  });
  document.querySelector('.reload-btn').addEventListener('click', () => {
    loadCodeInIframe(previewIframe, code, codeLanguage);
  });

  const previewTab = document.getElementById('preview-tab');
  const codeTab = document.getElementById('code-tab');

  previewTab.addEventListener('click', () => {
    previewIframe.style.display = 'block';
    codeView.style.display = 'none';
    previewTab.classList.add('active');
    codeTab.classList.remove('active');
    console.log('Switched to Preview mode');
  });

  codeTab.addEventListener('click', () => {
    previewIframe.style.display = 'none';
    codeView.style.display = 'block';
    codeTab.classList.add('active');
    previewTab.classList.remove('active');
    console.log('Switched to Code view');
  });

  loadCodeInIframe(previewIframe, code, codeLanguage);
}



function loadCodeInIframe(iframe, code, codeLanguage) {
  if (codeLanguage.includes('language-vue')) {
    compileVue(code).then(jsCode => {
      getScriptContent('libs/vue.global.js', (vueScriptContent) => {
        const iframeContent = `
          <div id="app"></div>
          <script>
            ${vueScriptContent}
          </script>
          <script>
            const App = ${jsCode};
            const app = Vue.createApp(App);
            app.mount('#app');
          </script>
        `;
        iframe.srcdoc = iframeContent;
      });
    });
  } else if (codeLanguage.includes('language-react') || codeLanguage.includes('language-jsx')) {
    getScriptContent('libs/react.development.js', (reactScriptContent) => {
      getScriptContent('libs/react-dom.development.js', (reactDOMScriptContent) => {
        getScriptContent('libs/babel.min.js', (babelScriptContent) => {
          const iframeContent = `
            <div id="root"></div>
            <script>
              ${reactScriptContent}
            </script>
            <script>
              ${reactDOMScriptContent}
            </script>
            <script>
              ${babelScriptContent}
            </script>
            <script type="text/babel">
              ${code}
            </script>
          `;
          iframe.srcdoc = iframeContent;
        });
      });
    });
  } else if (codeLanguage.includes('language-typescript')) {
    getScriptContent('libs/typescript.min.js', (tsScriptContent) => {
      const escapedCode = JSON.stringify(code);
      const iframeContent = `
        <body></body>
        <script>
          ${tsScriptContent}
        </script>
        <script>
          const tsCode = ${escapedCode};
          const jsCode = ts.transpile(tsCode, { module: ts.ModuleKind.None });
          window.addEventListener('DOMContentLoaded', () => {
            eval(jsCode);
          });
        </script>
      `;
      iframe.srcdoc = iframeContent;
    });
  } else {
    // Default code handling
    iframe.srcdoc = code;
  }
}



function compileVue(code) {
  return new Promise((resolve) => {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = code.match(/<script.*?>([\s\S]*?)<\/script>/);
    const template = templateMatch ? templateMatch[1] : '';
    let script = scriptMatch ? scriptMatch[1] : '';

    // Replace 'export default' with 'return'
    script = script.replace(/export\s+default/, 'return');

    // Remove 'export' statements
    script = script.replace(/export\s+[^;]+;/g, '');

    // Remove 'import' statements
    script = script.replace(/import[\s\S]*?;/g, '');

    const compiledCode = `
      (function(){
        ${script.trim()}
      })()
    `;

    const finalCode = `
      (function(){
        const component = ${compiledCode};
        component.template = \`${template.trim()}\`;
        return component;
      })()
    `;
    resolve(finalCode);
  });
}




function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 1500);
    }
    showTemporaryMessage('Code copied to clipboard');
  }).catch((err) => {
    console.error('Could not copy text: ', err);
  });
}

function downloadCode(code) {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'code.txt';
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
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

addButtonsToExistingCodeBlocks();

function addButtonsToExistingCodeBlocks() {
  document.querySelectorAll('pre').forEach(preElement => {
    const codeElement = preElement.querySelector('code');
    if (codeElement && !codeElement.dataset.buttonsAdded) {
      addButtons(codeElement);
    }
  });
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const codeElements = node.querySelectorAll('pre code');
          codeElements.forEach(codeElement => {
            if (codeElement && !codeElement.dataset.buttonsAdded) {
              addButtons(codeElement);
            }
          });
        }
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

setInterval(addButtonsToExistingCodeBlocks, 1000);
