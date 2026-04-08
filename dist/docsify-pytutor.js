(function () {
  'use strict';

  var STYLE_ID = 'docsify-pytutor-style';

  var DEFAULT_CONFIG = {
    baseEmbedUrl: 'https://pythontutor.com/iframe-embed.html',
    defaultOptions: {
      cumulative: 'false',
      curInstr: '0',
      heapPrimitives: 'nevernest',
      drawParentPointers: 'false',
      textReferences: 'false',
      showOnlyOutputs: 'false'
    },
    langMap: {
      pytutor: {
        label: 'Python',
        py: '3'
      },
      'pytutor-python': {
        label: 'Python',
        py: '3'
      },
      'pytutor-java': {
        label: 'Java',
        py: 'java'
      }
    },
    ui: {
      copyButtonText: '复制代码',
      copiedButtonText: '已复制',
      copyFailedText: '复制失败',
      showNote: false,
      noteText: '说明：适合小段教学示例代码，不适合复杂项目代码。',
      maxWidth: '960px',
      baseHeight: 420,
      lineHeight: 24,
      minHeight: 420,
      maxHeight: 1400,
      mobileMinHeight: 420,
      codeDivMaxHeight: 960
    }
  };

  function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function deepMerge(target, source) {
    var out = Object.assign({}, target || {});
    if (!source) return out;

    Object.keys(source).forEach(function (key) {
      var targetValue = out[key];
      var sourceValue = source[key];

      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        out[key] = deepMerge(targetValue, sourceValue);
      } else {
        out[key] = sourceValue;
      }
    });

    return out;
  }

  function getMergedConfig() {
    var $docsify = window.$docsify || {};
    return deepMerge(DEFAULT_CONFIG, $docsify.pytutor || {});
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      ':root {',
      '  --pt-card-bg: #ffffff;',
      '  --pt-border: #e6ebf2;',
      '  --pt-border-hover: #d7e0ea;',
      '  --pt-text: #1f2937;',
      '  --pt-subtext: #6b7280;',
      '  --pt-primary: #2563eb;',
      '  --pt-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);',
      '  --pt-shadow-hover: 0 10px 28px rgba(15, 23, 42, 0.10);',
      '  --pt-radius: 16px;',
      '  --pt-inner-radius: 12px;',
      '}',
      '.markdown-section {',
      '  max-width: 1100px;',
      '}',
      '.pytutor-wrapper {',
      '  margin: 20px 0 28px;',
      '  padding: 16px;',
      '  background: linear-gradient(180deg, #fcfdff 0%, #f8fafc 100%);',
      '  border: 1px solid var(--pt-border);',
      '  border-radius: var(--pt-radius);',
      '  box-shadow: var(--pt-shadow);',
      '  transition: all 0.2s ease;',
      '  overflow: hidden;',
      '}',
      '.pytutor-wrapper:hover {',
      '  border-color: var(--pt-border-hover);',
      '  box-shadow: var(--pt-shadow-hover);',
      '}',
      '.pytutor-toolbar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  margin-bottom: 14px;',
      '  padding-bottom: 12px;',
      '  border-bottom: 1px solid var(--pt-border);',
      '}',
      '.pytutor-toolbar-right {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',
      '.pytutor-toolbar .lang-badge {',
      '  font-size: 18px;',
      '  font-weight: 600;',
      '  color: var(--pt-text);',
      '  line-height: 1.2;',
      '  letter-spacing: 0.2px;',
      '}',
      '.pytutor-toolbar button,',
      '.pytutor-wrapper .copy-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  height: 34px;',
      '  padding: 0 14px;',
      '  border: 1px solid #d7dee8;',
      '  border-radius: 8px;',
      '  background: #fff;',
      '  color: #374151;',
      '  font-size: 14px;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  box-sizing: border-box;',
      '}',
      '.pytutor-toolbar button:hover,',
      '.pytutor-wrapper .copy-btn:hover {',
      '  border-color: #c8d3df;',
      '  background: #f8fafc;',
      '  color: var(--pt-primary);',
      '}',
      '.pytutor-toolbar button:active,',
      '.pytutor-wrapper .copy-btn:active {',
      '  transform: translateY(1px);',
      '}',
      '.pytutor-frame-container {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '}',
      '.pytutor-wrapper iframe {',
      '  display: block;',
      '  width: 100%;',
      '  max-width: 960px;',
      '  margin: 0 auto;',
      '  border: 1px solid var(--pt-border);',
      '  border-radius: var(--pt-inner-radius);',
      '  background: var(--pt-card-bg);',
      '  box-sizing: border-box;',
      '  overflow: hidden;',
      '}',
      '.pytutor-note {',
      '  margin-top: 12px;',
      '  padding-left: 2px;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '  color: var(--pt-subtext);',
      '}',
      '@media (max-width: 992px) {',
      '  .markdown-section {',
      '    max-width: 100%;',
      '  }',
      '  .pytutor-wrapper iframe {',
      '    max-width: 100%;',
      '  }',
      '}',
      '@media (max-width: 768px) {',
      '  .pytutor-wrapper {',
      '    padding: 12px;',
      '    border-radius: 14px;',
      '  }',
      '  .pytutor-toolbar {',
      '    flex-direction: column;',
      '    align-items: flex-start;',
      '    gap: 10px;',
      '  }',
      '  .pytutor-toolbar .lang-badge {',
      '    font-size: 16px;',
      '  }',
      '  .pytutor-wrapper iframe {',
      '    max-width: 100%;',
      '    border-radius: 10px;',
      '  }',
      '}',
      '@media (max-width: 480px) {',
      '  .pytutor-wrapper {',
      '    padding: 10px;',
      '    margin: 16px 0 22px;',
      '  }',
      '  .pytutor-toolbar button,',
      '  .pytutor-wrapper .copy-btn {',
      '    height: 32px;',
      '    padding: 0 12px;',
      '    font-size: 13px;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function normalizeCode(rawCode) {
    var code = String(rawCode || '').replace(/\t/g, '    ');
    var lines = code.split('\n');

    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

    var indents = lines
      .filter(function (line) {
        return line.trim();
      })
      .map(function (line) {
        var match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
      });

    var minIndent = indents.length ? Math.min.apply(null, indents) : 0;

    return lines
      .map(function (line) {
        return line.slice(minIndent);
      })
      .join('\n');
  }

  function buildHash(code, langConfig, mergedConfig, runtimeOptions) {
    var params = Object.assign(
      {
        code: code.trim(),
        py: langConfig.py
      },
      mergedConfig.defaultOptions || {},
      runtimeOptions || {}
    );

    return Object.keys(params)
      .map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
      })
      .join('&');
  }

  function buildIframeUrl(code, langConfig, mergedConfig, runtimeOptions) {
    return mergedConfig.baseEmbedUrl + '#' + buildHash(code, langConfig, mergedConfig, runtimeOptions);
  }

  function getCodeLineCount(code) {
    return String(code || '').split('\n').length;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parsePixelValue(value) {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    if (typeof value === 'string') {
      var match = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);
      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  }

  function getElementWidth(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
      return 0;
    }

    var rect = element.getBoundingClientRect();
    return rect && rect.width ? Math.round(rect.width) : 0;
  }

  function getFrameWidth(element, mergedConfig) {
    var ui = mergedConfig.ui || {};
    var maxWidth = parsePixelValue(ui.maxWidth || DEFAULT_CONFIG.ui.maxWidth);
    var elementWidth = getElementWidth(element);
    var parentWidth = element && element.parentElement ? getElementWidth(element.parentElement) : 0;
    var container =
      element && typeof element.closest === 'function'
        ? element.closest('.markdown-section, #main')
        : null;
    var containerWidth = getElementWidth(container);
    var viewportWidth = window.innerWidth ? Math.max(320, window.innerWidth - 40) : 960;
    var width = Math.max(elementWidth, parentWidth, containerWidth) || viewportWidth;

    if (maxWidth) {
      width = Math.min(width, maxWidth);
    }

    return Math.max(320, Math.round(width));
  }

  function calcCodeDivWidth(frameWidth) {
    if (!frameWidth || frameWidth <= 480) {
      return 280;
    }

    if (frameWidth <= 760) {
      return 360;
    }

    return clamp(Math.round(frameWidth * 0.46), 360, 480);
  }

  function getLineDisplayWidth(line) {
    return String(line || '').split('').reduce(function (total, ch) {
      if (ch === '\t') return total + 4;
      return total + (/[\u0100-\uffff]/.test(ch) ? 2 : 1);
    }, 0);
  }

  function estimateVisualLineCount(code, frameWidth) {
    var codeDivWidth = calcCodeDivWidth(frameWidth);
    var wrapColumn = Math.max(20, Math.floor((codeDivWidth - 64) / 8));

    return String(code || '')
      .split('\n')
      .reduce(function (total, line) {
        var displayWidth = getLineDisplayWidth(line);
        return total + Math.max(1, Math.ceil(Math.max(1, displayWidth) / wrapColumn));
      }, 0);
  }

  function calcCodeDivHeight(code, mergedConfig, frameWidth) {
    var ui = mergedConfig.ui || {};
    var lineCount = getCodeLineCount(code);
    var lineHeight = Number(ui.lineHeight || DEFAULT_CONFIG.ui.lineHeight);
    var maxHeight = Number(ui.codeDivMaxHeight || DEFAULT_CONFIG.ui.codeDivMaxHeight);
    var visualLineCount = estimateVisualLineCount(code, frameWidth);
    var wrappedExtraLines = Math.max(0, visualLineCount - lineCount);
    var height = 400 + wrappedExtraLines * lineHeight;

    if (frameWidth < 960) {
      height += 24;
    }

    if (frameWidth < 760) {
      height += 48;
    }

    return clamp(height, 400, maxHeight);
  }

  function calcIframeHeight(code, mergedConfig, frameWidth) {
    var ui = mergedConfig.ui || {};
    var lineCount = getCodeLineCount(code);
    var visualLineCount = estimateVisualLineCount(code, frameWidth);
    var wrappedExtraLines = Math.max(0, visualLineCount - lineCount);
    var baseHeight = Number(ui.baseHeight || DEFAULT_CONFIG.ui.baseHeight);
    var lineHeight = Number(ui.lineHeight || DEFAULT_CONFIG.ui.lineHeight);
    var minHeight = Number(ui.minHeight || DEFAULT_CONFIG.ui.minHeight);
    var maxHeight = Number(ui.maxHeight || DEFAULT_CONFIG.ui.maxHeight);
    var mobileMinHeight = Number(ui.mobileMinHeight || DEFAULT_CONFIG.ui.mobileMinHeight);
    var codeDivHeight = calcCodeDivHeight(code, mergedConfig, frameWidth);
    var height = baseHeight + lineCount * lineHeight + Math.max(0, codeDivHeight - 400);

    if (wrappedExtraLines > 0) {
      height += wrappedExtraLines * Math.max(8, Math.round(lineHeight * 0.65));
    }

    if (frameWidth < 960) {
      height += 32;
    }

    if (frameWidth < 760) {
      height += 56;
    }

    height = clamp(height, minHeight, maxHeight);

    if (window.innerWidth <= 768) {
      height = Math.max(mobileMinHeight, clamp(height, mobileMinHeight, maxHeight));
    }

    return height;
  }

  function getRuntimeLayoutOptions(element, code, mergedConfig) {
    var frameWidth = getFrameWidth(element, mergedConfig);

    return {
      frameWidth: frameWidth,
      codeDivWidth: calcCodeDivWidth(frameWidth),
      codeDivHeight: calcCodeDivHeight(code, mergedConfig, frameWidth),
      iframeHeight: calcIframeHeight(code, mergedConfig, frameWidth)
    };
  }

  function applyResponsiveIframeHeight(wrapper, iframe, code, mergedConfig) {
    var layout = getRuntimeLayoutOptions(wrapper, code, mergedConfig);
    iframe.style.height = layout.iframeHeight + 'px';
  }

  function bindResponsiveIframeHeight(wrapper, iframe, code, mergedConfig) {
    var resizeObserver = null;

    function updateHeight() {
      applyResponsiveIframeHeight(wrapper, iframe, code, mergedConfig);
    }

    updateHeight();
    iframe.addEventListener('load', updateHeight);

    if (typeof window.ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(function () {
        updateHeight();
      });
      resizeObserver.observe(wrapper);
      wrapper.__ptResizeObserver = resizeObserver;
    } else {
      window.addEventListener('resize', updateHeight);
    }
  }

  function createToolbar(langLabel, rawCode, mergedConfig) {
    var toolbar = document.createElement('div');
    toolbar.className = 'pytutor-toolbar';

    var left = document.createElement('div');
    left.className = 'lang-badge';
    left.textContent = langLabel + ' 可视化';

    var right = document.createElement('div');
    right.className = 'pytutor-toolbar-right';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = mergedConfig.ui.copyButtonText;

    copyBtn.onclick = function () {
      navigator.clipboard
        .writeText(rawCode)
        .then(function () {
          copyBtn.textContent = mergedConfig.ui.copiedButtonText;
          setTimeout(function () {
            copyBtn.textContent = mergedConfig.ui.copyButtonText;
          }, 1200);
        })
        .catch(function () {
          copyBtn.textContent = mergedConfig.ui.copyFailedText;
          setTimeout(function () {
            copyBtn.textContent = mergedConfig.ui.copyButtonText;
          }, 1200);
        });
    };

    right.appendChild(copyBtn);
    toolbar.appendChild(left);
    toolbar.appendChild(right);

    return toolbar;
  }

  function renderOneBlock(pre, langKey, mergedConfig) {
    if (!pre || pre.dataset.ptRendered === '1') return;

    var codeEl = pre.querySelector('code');
    if (!codeEl) return;

    var rawCode = codeEl.textContent || '';
    if (!rawCode.trim()) return;

    var normalizedCode = normalizeCode(rawCode);
    var langConfig = mergedConfig.langMap[langKey];
    if (!langConfig) return;

    var layout = getRuntimeLayoutOptions(pre, normalizedCode, mergedConfig);

    var wrapper = document.createElement('div');
    wrapper.className = 'pytutor-wrapper';

    var toolbar = createToolbar(langConfig.label, normalizedCode, mergedConfig);

    var frameContainer = document.createElement('div');
    frameContainer.className = 'pytutor-frame-container';

    var iframe = document.createElement('iframe');
    iframe.src = buildIframeUrl(
      normalizedCode,
      langConfig,
      mergedConfig,
      {
        codeDivWidth: layout.codeDivWidth,
        codeDivHeight: layout.codeDivHeight
      }
    );
    iframe.loading = 'lazy';
    iframe.title = langConfig.label + ' Visualizer';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.maxWidth = mergedConfig.ui.maxWidth || DEFAULT_CONFIG.ui.maxWidth;
    iframe.style.height = layout.iframeHeight + 'px';

    frameContainer.appendChild(iframe);

    wrapper.appendChild(toolbar);
    wrapper.appendChild(frameContainer);

    if (mergedConfig.ui.showNote) {
      var note = document.createElement('div');
      note.className = 'pytutor-note';
      note.textContent = mergedConfig.ui.noteText || '';
      wrapper.appendChild(note);
    }

    pre.replaceWith(wrapper);
    pre.dataset.ptRendered = '1';
    bindResponsiveIframeHeight(wrapper, iframe, normalizedCode, mergedConfig);
  }

  function renderPyTutorBlocks() {
    ensureStyles();

    var mergedConfig = getMergedConfig();
    var container = document.querySelector('#main');
    if (!container) return;

    Object.keys(mergedConfig.langMap).forEach(function (langKey) {
      var blocks = container.querySelectorAll('pre[data-lang="' + langKey + '"]');
      Array.prototype.forEach.call(blocks, function (pre) {
        renderOneBlock(pre, langKey, mergedConfig);
      });
    });
  }

  function install(hook) {
    hook.doneEach(function () {
      renderPyTutorBlocks();
    });
  }

  if (window.$docsify) {
    window.$docsify.plugins = [].concat(install, window.$docsify.plugins || []);
  } else {
    window.$docsify = { plugins: [install] };
  }

  window.renderPyTutorBlocks = renderPyTutorBlocks;
})();
