(function () {
  'use strict';

  var STYLE_ID = 'docsify-pytutor-style';
  var renderedBlocks = [];
  var activeExpandedBlock = null;
  var scrollLockState = null;
  var AUTOPLAY_WARMUP_MS = 650;
  var INLINE_RESIZE_MIN_HEIGHT = 420;
  var INLINE_RESIZE_MAX_HEIGHT = 1480;
  var traceMetaCache = Object.create(null);

  var HEIGHT_PRESETS = {
    compact: {
      targetHeight: 500,
      minHeight: 460,
      maxHeight: 820,
      mobileMinHeight: 420,
      codeDivBaseHeight: 400,
      codeDivMaxHeight: 560
    },
    comfortable: {
      targetHeight: 640,
      minHeight: 560,
      maxHeight: 1080,
      mobileMinHeight: 460,
      codeDivBaseHeight: 460,
      codeDivMaxHeight: 700
    },
    tall: {
      targetHeight: 820,
      minHeight: 700,
      maxHeight: 1280,
      mobileMinHeight: 520,
      codeDivBaseHeight: 560,
      codeDivMaxHeight: 860
    }
  };

  var DEFAULT_CONFIG = {
    baseEmbedUrl: 'https://pythontutor.com/iframe-embed.html',
    traceProxyUrl: 'https://api.codetabs.com/v1/proxy/?quest=',
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
        family: 'python',
        py: '3'
      },
      'pytutor-python': {
        label: 'Python',
        family: 'python',
        py: '3'
      },
      'pytutor-java': {
        label: 'Java',
        family: 'java',
        py: 'java'
      }
    },
    autoplay: {
      enabled: true,
      interval: 900,
      warmupMs: 650,
      preparingButtonText: '准备中',
      startButtonText: '开始',
      pauseButtonText: '暂停'
    },
    ui: {
      copyButtonText: '复制代码',
      copiedButtonText: '已复制',
      copyFailedText: '复制失败',
      showNote: false,
      noteText: '说明：适合小段教学示例代码，不适合复杂项目代码。',
      maxWidth: '1080px',
      heightPreset: 'comfortable',
      layoutMode: 'auto',
      showExpandButton: true,
      expandButtonText: '展开查看',
      collapseButtonText: '退出展开',
      baseHeight: 640,
      lineHeight: 24,
      minHeight: 560,
      maxHeight: 1080,
      mobileMinHeight: 460,
      codeDivMaxHeight: 700
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toNumber(value, fallback) {
    var num = Number(value);
    return isNaN(num) ? fallback : num;
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

  function normalizeHeightPreset(value) {
    var preset = String(value || '').toLowerCase();
    return HEIGHT_PRESETS[preset] ? preset : 'comfortable';
  }

  function normalizeLayoutMode(value) {
    var mode = String(value || '').toLowerCase();
    return mode === 'horizontal' || mode === 'vertical' ? mode : 'auto';
  }

  function parseLangSpec(value, mergedConfig) {
    var langSpec = String(value || '').toLowerCase();

    if (mergedConfig.langMap[langSpec]) {
      return {
        langKey: langSpec
      };
    }

    return null;
  }

  function normalizeUserConfig(rawConfig) {
    if (!isPlainObject(rawConfig)) {
      return {};
    }

    var normalized = deepMerge({}, rawConfig);

    if (Object.prototype.hasOwnProperty.call(rawConfig, 'heightPreset')) {
      normalized.ui = normalized.ui || {};
      normalized.ui.heightPreset = rawConfig.heightPreset;
    }

    if (Object.prototype.hasOwnProperty.call(rawConfig, 'maxWidth')) {
      normalized.ui = normalized.ui || {};
      normalized.ui.maxWidth = rawConfig.maxWidth;
    }

    if (Object.prototype.hasOwnProperty.call(rawConfig, 'showExpandButton')) {
      normalized.ui = normalized.ui || {};
      normalized.ui.showExpandButton = rawConfig.showExpandButton;
    }

    if (Object.prototype.hasOwnProperty.call(rawConfig, 'autoplayInterval')) {
      normalized.autoplay = isPlainObject(normalized.autoplay) ? normalized.autoplay : {};
      normalized.autoplay.interval = rawConfig.autoplayInterval;
    }

    if (typeof rawConfig.autoplay === 'boolean') {
      normalized.autoplay = {
        enabled: rawConfig.autoplay
      };
    }

    return normalized;
  }

  function getMergedConfig() {
    var $docsify = window.$docsify || {};
    return deepMerge(DEFAULT_CONFIG, normalizeUserConfig($docsify.pytutor || {}));
  }

  function getEffectiveUiConfig(mergedConfig) {
    var ui = mergedConfig.ui || {};
    var presetName = normalizeHeightPreset(ui.heightPreset);
    var preset = HEIGHT_PRESETS[presetName];

    return {
      copyButtonText: ui.copyButtonText || DEFAULT_CONFIG.ui.copyButtonText,
      copiedButtonText: ui.copiedButtonText || DEFAULT_CONFIG.ui.copiedButtonText,
      copyFailedText: ui.copyFailedText || DEFAULT_CONFIG.ui.copyFailedText,
      showNote: Boolean(ui.showNote),
      noteText: typeof ui.noteText === 'string' ? ui.noteText : DEFAULT_CONFIG.ui.noteText,
      maxWidth: ui.maxWidth || DEFAULT_CONFIG.ui.maxWidth,
      heightPreset: presetName,
      layoutMode: normalizeLayoutMode(ui.layoutMode),
      showExpandButton: ui.showExpandButton !== false,
      expandButtonText: ui.expandButtonText || DEFAULT_CONFIG.ui.expandButtonText,
      collapseButtonText: ui.collapseButtonText || DEFAULT_CONFIG.ui.collapseButtonText,
      lineHeight: toNumber(ui.lineHeight, DEFAULT_CONFIG.ui.lineHeight),
      targetHeight: toNumber(ui.baseHeight, preset.targetHeight),
      minHeight: toNumber(ui.minHeight, preset.minHeight),
      maxHeight: toNumber(ui.maxHeight, preset.maxHeight),
      mobileMinHeight: toNumber(ui.mobileMinHeight, preset.mobileMinHeight),
      codeDivBaseHeight: preset.codeDivBaseHeight,
      codeDivMaxHeight: toNumber(ui.codeDivMaxHeight, preset.codeDivMaxHeight)
    };
  }

  function getEffectiveAutoplayConfig(mergedConfig) {
    var autoplay = mergedConfig.autoplay || {};
    var enabled = autoplay.enabled !== false;

    return {
      enabled: enabled,
      maxInstruction: null,
      interval: clamp(toNumber(autoplay.interval, DEFAULT_CONFIG.autoplay.interval), 300, 5000),
      warmupMs: clamp(toNumber(autoplay.warmupMs, DEFAULT_CONFIG.autoplay.warmupMs), 200, 3000),
      preparingButtonText: autoplay.preparingButtonText || DEFAULT_CONFIG.autoplay.preparingButtonText,
      startButtonText: autoplay.startButtonText || DEFAULT_CONFIG.autoplay.startButtonText,
      pauseButtonText: autoplay.pauseButtonText || DEFAULT_CONFIG.autoplay.pauseButtonText
    };
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
      '  --pt-shadow: 0 8px 28px rgba(15, 23, 42, 0.07);',
      '  --pt-shadow-hover: 0 12px 36px rgba(15, 23, 42, 0.12);',
      '  --pt-radius: 18px;',
      '  --pt-inner-radius: 12px;',
      '  --pt-overlay-backdrop-z: 9998;',
      '  --pt-overlay-card-z: 10000;',
      '}',
      '.markdown-section {',
      '  max-width: 1140px;',
      '}',
      '.pytutor-wrapper {',
      '  position: relative;',
      '  margin: 20px 0 28px;',
      '  padding: 16px;',
      '  background: linear-gradient(180deg, #fcfdff 0%, #f8fafc 100%);',
      '  border: 1px solid var(--pt-border);',
      '  border-radius: var(--pt-radius);',
      '  box-shadow: var(--pt-shadow);',
      '  transition: box-shadow 0.2s ease, border-color 0.2s ease;',
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
      '.pytutor-toolbar-left {',
      '  min-width: 0;',
      '}',
      '.pytutor-toolbar-right {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: flex-end;',
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
      '.pytutor-toolbar .layout-hint {',
      '  margin-top: 4px;',
      '  font-size: 13px;',
      '  color: var(--pt-subtext);',
      '}',
      '.pytutor-toolbar button,',
      '.pytutor-wrapper .copy-btn,',
      '.pytutor-wrapper .expand-btn {',
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
      '  white-space: nowrap;',
      '}',
      '.pytutor-toolbar button:hover,',
      '.pytutor-wrapper .copy-btn:hover,',
      '.pytutor-wrapper .expand-btn:hover {',
      '  border-color: #c8d3df;',
      '  background: #f8fafc;',
      '  color: var(--pt-primary);',
      '}',
      '.pytutor-wrapper .expand-btn.is-active,',
      '.pytutor-wrapper .autoplay-btn.is-active {',
      '  border-color: rgba(37, 99, 235, 0.22);',
      '  background: rgba(37, 99, 235, 0.08);',
      '  color: var(--pt-primary);',
      '}',
      '.pytutor-toolbar button:active,',
      '.pytutor-wrapper .copy-btn:active,',
      '.pytutor-wrapper .expand-btn:active {',
      '  transform: translateY(1px);',
      '}',
      '.pytutor-frame-container {',
      '  position: relative;',
      '  display: block;',
      '  width: 100%;',
      '  margin: 0 auto;',
      '  overflow: hidden;',
      '}',
      '.pytutor-frame-container.is-resizing {',
      '  cursor: nwse-resize;',
      '}',
      '.pytutor-wrapper iframe {',
      '  position: absolute;',
      '  inset: 0;',
      '  display: block;',
      '  width: 100%;',
      '  border: 1px solid var(--pt-border);',
      '  border-radius: var(--pt-inner-radius);',
      '  background: var(--pt-card-bg);',
      '  box-sizing: border-box;',
      '  overflow: hidden;',
      '  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  transform: translateZ(0);',
      '  backface-visibility: hidden;',
      '  will-change: transform, opacity;',
      '}',
      '.pytutor-wrapper iframe.pt-frame-active {',
      '  pointer-events: auto;',
      '  z-index: 2;',
      '  opacity: 1;',
      '  transform: translate3d(0, 0, 0) scale(1);',
      '}',
      '.pytutor-wrapper iframe.pt-frame-standby {',
      '  pointer-events: none;',
      '  z-index: 3;',
      '  opacity: 0.999;',
      '  transform-origin: top left;',
      '  transform: translate3d(calc(100% - 2px), 0, 0) scale(1);',
      '}',
      '.pytutor-resize-handle {',
      '  position: absolute;',
      '  right: 10px;',
      '  bottom: 10px;',
      '  width: 18px;',
      '  height: 18px;',
      '  z-index: 5;',
      '  cursor: nwse-resize;',
      '  user-select: none;',
      '  background: transparent;',
      '}',
      '.pytutor-resize-handle::before {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 1px;',
      '  background:',
      '    linear-gradient(135deg, transparent 0 22%, rgba(148, 163, 184, 0.72) 22% 30%, transparent 30%) 0 0 / 100% 100% no-repeat,',
      '    linear-gradient(135deg, transparent 0 40%, rgba(148, 163, 184, 0.84) 40% 48%, transparent 48%) 0 0 / 100% 100% no-repeat,',
      '    linear-gradient(135deg, transparent 0 58%, rgba(148, 163, 184, 0.96) 58% 66%, transparent 66%) 0 0 / 100% 100% no-repeat;',
      '  opacity: 0.92;',
      '}',
      '.pytutor-frame-container:hover .pytutor-resize-handle::before,',
      '.pytutor-frame-container.is-resizing .pytutor-resize-handle::before {',
      '  opacity: 1;',
      '}',
      '.pytutor-frame-container.is-resizing iframe {',
      '  pointer-events: none;',
      '}',
      '.pytutor-note {',
      '  margin-top: 12px;',
      '  padding-left: 2px;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '  color: var(--pt-subtext);',
      '}',
      '.pytutor-expanded-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: var(--pt-overlay-backdrop-z);',
      '  background: rgba(15, 23, 42, 0.08);',
      '  pointer-events: none;',
      '}',
      '.pytutor-placeholder {',
      '  width: 100%;',
      '}',
      '.pytutor-wrapper.is-expanded {',
      '  position: fixed;',
      '  inset: 16px;',
      '  z-index: var(--pt-overlay-card-z);',
      '  display: flex;',
      '  flex-direction: column;',
      '  margin: 0;',
      '  padding: 20px;',
      '  max-width: none;',
      '  width: auto;',
      '  border-radius: 22px;',
      '  box-shadow: 0 22px 80px rgba(15, 23, 42, 0.28);',
      '}',
      '.pytutor-wrapper.is-expanded .pytutor-frame-container {',
      '  flex: 1 1 auto;',
      '  min-height: 0;',
      '}',
      '.pytutor-wrapper.is-expanded iframe {',
      '  max-width: none;',
      '  height: var(--pt-expanded-frame-height, 78vh);',
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
      '  .pytutor-toolbar-right {',
      '    width: 100%;',
      '    justify-content: flex-start;',
      '  }',
      '  .pytutor-toolbar .lang-badge {',
      '    font-size: 16px;',
      '  }',
      '  .pytutor-wrapper.is-expanded {',
      '    inset: 0;',
      '    padding: 14px;',
      '    border-radius: 0;',
      '  }',
      '  .pytutor-wrapper.is-expanded iframe {',
      '    height: var(--pt-expanded-frame-height, 100dvh);',
      '  }',
      '}',
      '@media (max-width: 480px) {',
      '  .pytutor-wrapper {',
      '    padding: 10px;',
      '    margin: 16px 0 22px;',
      '  }',
      '  .pytutor-toolbar button,',
      '  .pytutor-wrapper .copy-btn,',
      '  .pytutor-wrapper .expand-btn {',
      '    height: 32px;',
      '    padding: 0 12px;',
      '    font-size: 13px;',
      '  }',
      '  .pytutor-toolbar-right {',
      '    gap: 6px;',
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
      .filter(function (key) {
        return params[key] !== undefined && params[key] !== null && params[key] !== '';
      })
      .map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
      })
      .join('&');
  }

  function appendReloadToken(baseUrl, token) {
    if (!token) return baseUrl;

    return baseUrl + (baseUrl.indexOf('?') === -1 ? '?' : '&') + '__pt_reload=' + encodeURIComponent(token);
  }

  function buildIframeUrl(code, langConfig, mergedConfig, runtimeOptions, baseUrlOverride) {
    var baseUrl = baseUrlOverride || mergedConfig.baseEmbedUrl;
    return baseUrl + '#' + buildHash(code, langConfig, mergedConfig, runtimeOptions);
  }

  function getFrameIndexForInstruction(state, instruction) {
    if (state.autoplayConfig && state.autoplayConfig.enabled && state.iframes.length > 1) {
      return clamp(Math.max(0, parseInt(instruction, 10) || 0), 0, state.iframes.length - 1);
    }

    return 0;
  }

  function getActiveIframe(state) {
    return state.iframes[getFrameIndexForInstruction(state, state.currentInstr)];
  }

  function updateIframeVisibility(state) {
    state.activeIframeIndex = getFrameIndexForInstruction(state, state.currentInstr);

    state.iframes.forEach(function (iframe, index) {
      var isActive = index === state.activeIframeIndex;
      iframe.classList.toggle('pt-frame-active', isActive);
      iframe.classList.toggle('pt-frame-standby', !isActive);
      iframe.tabIndex = isActive ? 0 : -1;
    });
  }

  function getCodeLineCount(code) {
    return String(code || '').split('\n').length;
  }

  function getLineDisplayWidth(line) {
    return String(line || '').split('').reduce(function (total, ch) {
      if (ch === '\t') return total + 4;
      return total + (/[\u0100-\uffff]/.test(ch) ? 2 : 1);
    }, 0);
  }

  function getElementWidth(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
      return 0;
    }

    var rect = element.getBoundingClientRect();
    return rect && rect.width ? Math.round(rect.width) : 0;
  }

  function getFrameWidth(element, effectiveUi) {
    var maxWidth = parsePixelValue(effectiveUi.maxWidth || DEFAULT_CONFIG.ui.maxWidth);
    var elementWidth = getElementWidth(element);
    var parentWidth = element && element.parentElement ? getElementWidth(element.parentElement) : 0;
    var section =
      element && typeof element.closest === 'function'
        ? element.closest('.markdown-section, #main')
        : null;
    var sectionWidth = getElementWidth(section);
    var viewportWidth = window.innerWidth ? Math.max(320, window.innerWidth - 32) : 960;
    var width = Math.max(elementWidth, parentWidth, sectionWidth) || viewportWidth;

    if (maxWidth) {
      width = Math.min(width, maxWidth);
    }

    return Math.max(320, Math.round(width));
  }

  function shouldUseVerticalStack(frameWidth, effectiveUi) {
    if (effectiveUi.layoutMode === 'vertical') return true;
    if (effectiveUi.layoutMode === 'horizontal') return false;

    return frameWidth <= 920 || window.innerWidth <= 768;
  }

  function calcCodeDivWidth(frameWidth, verticalStack) {
    if (!frameWidth || frameWidth <= 480) {
      return 320;
    }

    if (verticalStack) {
      return clamp(frameWidth - 72, 360, 720);
    }

    return clamp(Math.round(frameWidth * 0.45), 420, 480);
  }

  function estimateVisualLineCount(code, codeDivWidth) {
    var wrapColumn = Math.max(20, Math.floor((codeDivWidth - 76) / 8));

    return String(code || '')
      .split('\n')
      .reduce(function (total, line) {
        var displayWidth = getLineDisplayWidth(line);
        return total + Math.max(1, Math.ceil(Math.max(1, displayWidth) / wrapColumn));
      }, 0);
  }

  function calcCodeDivHeight(code, effectiveUi, frameWidth, verticalStack, codeDivWidth) {
    var lineCount = getCodeLineCount(code);
    var visualLineCount = estimateVisualLineCount(code, codeDivWidth);
    var wrappedExtraLines = Math.max(0, visualLineCount - lineCount);
    var height = effectiveUi.codeDivBaseHeight + wrappedExtraLines * effectiveUi.lineHeight;

    if (lineCount > 12) {
      height += (lineCount - 12) * Math.round(effectiveUi.lineHeight * 0.55);
    }

    if (verticalStack) {
      height += 36;
    }

    if (frameWidth < 960) {
      height += 24;
    }

    return clamp(height, effectiveUi.codeDivBaseHeight, effectiveUi.codeDivMaxHeight);
  }

  function calcInlineIframeHeight(code, effectiveUi, frameWidth, verticalStack, codeDivWidth) {
    var lineCount = getCodeLineCount(code);
    var visualLineCount = estimateVisualLineCount(code, codeDivWidth);
    var wrappedExtraLines = Math.max(0, visualLineCount - lineCount);
    var height = effectiveUi.targetHeight;

    if (lineCount > 10) {
      height += (lineCount - 10) * Math.round(effectiveUi.lineHeight * 0.65);
    }

    if (wrappedExtraLines > 0) {
      height += wrappedExtraLines * Math.round(effectiveUi.lineHeight * 0.9);
    }

    if (verticalStack) {
      height += 160;
    }

    if (frameWidth < 960) {
      height += 48;
    }

    if (frameWidth < 720) {
      height += 32;
    }

    height = clamp(height, effectiveUi.minHeight, effectiveUi.maxHeight);

    if (window.innerWidth <= 768) {
      height = Math.max(effectiveUi.mobileMinHeight, height);
    }

    return height;
  }

  function getInlineLayout(element, code, mergedConfig) {
    var effectiveUi = getEffectiveUiConfig(mergedConfig);
    var frameWidth = getFrameWidth(element, effectiveUi);
    var verticalStack = shouldUseVerticalStack(frameWidth, effectiveUi);
    var codeDivWidth = calcCodeDivWidth(frameWidth, verticalStack);
    var codeDivHeight = calcCodeDivHeight(code, effectiveUi, frameWidth, verticalStack, codeDivWidth);
    var iframeHeight = calcInlineIframeHeight(code, effectiveUi, frameWidth, verticalStack, codeDivWidth);

    return {
      effectiveUi: effectiveUi,
      frameWidth: frameWidth,
      verticalStack: verticalStack,
      codeDivWidth: codeDivWidth,
      codeDivHeight: codeDivHeight,
      iframeHeight: iframeHeight,
      layoutHint: verticalStack
        ? '窄屏时会自动切换为纵向布局，可拖动右下角拖拽角调整高度。'
        : '默认使用更紧凑的舒适视图，可拖动右下角拖拽角调整高度，必要时可一键展开查看。'
    };
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (copied) {
          resolve();
        } else {
          reject(new Error('copy failed'));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function createToolbar(langLabel, rawCode, effectiveUi, autoplayConfig) {
    var toolbar = document.createElement('div');
    toolbar.className = 'pytutor-toolbar';

    var left = document.createElement('div');
    left.className = 'pytutor-toolbar-left';

    var badge = document.createElement('div');
    badge.className = 'lang-badge';
    badge.textContent = langLabel + ' 可视化';

    var hint = document.createElement('div');
    hint.className = 'layout-hint';

    var right = document.createElement('div');
    right.className = 'pytutor-toolbar-right';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = effectiveUi.copyButtonText;
    copyBtn.onclick = function () {
      copyTextToClipboard(rawCode)
        .then(function () {
          copyBtn.textContent = effectiveUi.copiedButtonText;
          setTimeout(function () {
            copyBtn.textContent = effectiveUi.copyButtonText;
          }, 1200);
        })
        .catch(function () {
          copyBtn.textContent = effectiveUi.copyFailedText;
          setTimeout(function () {
            copyBtn.textContent = effectiveUi.copyButtonText;
          }, 1200);
        });
    };

    left.appendChild(badge);
    left.appendChild(hint);

    if (autoplayConfig && autoplayConfig.enabled) {
      var autoplayBtn = document.createElement('button');
      autoplayBtn.className = 'autoplay-btn';
      autoplayBtn.textContent = autoplayConfig.startButtonText;
      right.appendChild(autoplayBtn);
    }

    if (effectiveUi.showExpandButton) {
      var expandBtn = document.createElement('button');
      expandBtn.className = 'expand-btn';
      expandBtn.textContent = effectiveUi.expandButtonText;
      right.appendChild(expandBtn);
    }

    right.appendChild(copyBtn);
    toolbar.appendChild(left);
    toolbar.appendChild(right);

    return {
      toolbar: toolbar,
      hint: hint,
      copyBtn: copyBtn,
      autoplayBtn: autoplayConfig && autoplayConfig.enabled ? right.querySelector('.autoplay-btn') : null,
      expandBtn: effectiveUi.showExpandButton ? right.querySelector('.expand-btn') : null
    };
  }

  function getOuterHeight(element) {
    if (!element || !element.getBoundingClientRect) return 0;

    var rect = element.getBoundingClientRect();
    var style = window.getComputedStyle(element);
    var marginTop = parseFloat(style.marginTop || '0') || 0;
    var marginBottom = parseFloat(style.marginBottom || '0') || 0;

    return rect.height + marginTop + marginBottom;
  }

  function lockDocumentScroll() {
    if (scrollLockState) return;

    var docEl = document.documentElement;
    var body = document.body;
    var scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);

    scrollLockState = {
      htmlOverflow: docEl.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight
    };

    docEl.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = scrollbarWidth + 'px';
    }
  }

  function unlockDocumentScroll() {
    if (!scrollLockState) return;

    document.documentElement.style.overflow = scrollLockState.htmlOverflow;
    document.body.style.overflow = scrollLockState.bodyOverflow;
    document.body.style.paddingRight = scrollLockState.bodyPaddingRight;
    scrollLockState = null;
  }

  function buildRuntimeOptions(state) {
    return {
      curInstr: String(Math.max(0, state.currentInstr || 0)),
      codeDivWidth: state.inlineLayout.codeDivWidth,
      codeDivHeight: state.inlineLayout.codeDivHeight,
      verticalStack: state.inlineLayout.verticalStack ? 'true' : undefined
    };
  }

  function buildRuntimeOptionsForInstruction(state, instruction) {
    var options = buildRuntimeOptions(state);
    options.curInstr = String(Math.max(0, parseInt(instruction, 10) || 0));
    return options;
  }

  function getBackendScriptName(langConfig) {
    if (!langConfig) return null;
    if (langConfig.py === 'java') return 'web_exec_java.py';
    if (langConfig.py === '3') return 'web_exec_py3.py';
    return null;
  }

  function getTraceOptionsJson(state) {
    var defaultOptions = state.mergedConfig.defaultOptions || {};
    return JSON.stringify({
      cumulative_mode: String(defaultOptions.cumulative || '').toLowerCase() === 'true',
      heap_primitives: String(defaultOptions.heapPrimitives || '').toLowerCase() === 'true',
      show_only_outputs: String(defaultOptions.showOnlyOutputs || '').toLowerCase() === 'true',
      origin: 'iframe-embed.js'
    });
  }

  function buildTraceBackendUrl(state) {
    var scriptName = getBackendScriptName(state.langConfig);
    if (!scriptName) return null;

    var params = {
      user_script: state.code,
      raw_input_json: '[]',
      options_json: getTraceOptionsJson(state),
      n: String(Math.floor(Math.random() * 1000000)),
      user_uuid: 'docsify-pytutor',
      session_uuid: 'docsify-pytutor'
    };

    var query = Object.keys(params).map(function (key) {
      return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return 'https://pythontutor.com/' + scriptName + '?' + query;
  }

  function buildTraceLookupUrl(state) {
    var backendUrl = buildTraceBackendUrl(state);
    if (!backendUrl) return null;

    var proxyBase = state.mergedConfig.traceProxyUrl || DEFAULT_CONFIG.traceProxyUrl;
    if (!proxyBase) {
      return backendUrl;
    }

    return proxyBase + encodeURIComponent(backendUrl);
  }

  function getTraceCacheKey(state) {
    return [state.langConfig.py, state.code].join('::');
  }

  function parseTraceResponseText(text) {
    var trimmed = String(text || '').trim();
    if (!trimmed) {
      throw new Error('empty trace response');
    }

    return JSON.parse(trimmed);
  }

  function getPlayableMaxInstruction(trace) {
    var events = Array.isArray(trace) ? trace : [];
    return Math.max(0, events.length - 1);
  }

  function fetchTraceMetadata(state) {
    var cacheKey = getTraceCacheKey(state);
    if (traceMetaCache[cacheKey]) {
      return traceMetaCache[cacheKey];
    }

    var requestUrl = buildTraceLookupUrl(state);
    if (!requestUrl || typeof window.fetch !== 'function') {
      return Promise.reject(new Error('trace lookup unavailable'));
    }

    traceMetaCache[cacheKey] = window.fetch(requestUrl, {
      method: 'GET',
      credentials: 'omit'
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('trace lookup failed with status ' + response.status);
        }
        return response.text();
      })
      .then(parseTraceResponseText)
      .then(function (payload) {
        var trace = payload && Array.isArray(payload.trace) ? payload.trace : [];
        return {
          maxInstruction: getPlayableMaxInstruction(trace),
          traceLength: trace.length
        };
      })
      .catch(function (error) {
        delete traceMetaCache[cacheKey];
        throw error;
      });

    return traceMetaCache[cacheKey];
  }

  function rebuildAutoplayFrames(state, forceFresh) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) return;

    var currentInstr = clamp(state.currentInstr, 0, state.autoplayConfig.maxInstruction);
    var currentFrame = forceFresh ? null : getActiveIframe(state);
    var nextFrames = [];
    var fragment = document.createDocumentFragment();

    state.currentInstr = currentInstr;
    state.loadedFrameMap = {};
    state.autoplayReady = false;

    for (var instr = 0; instr <= state.autoplayConfig.maxInstruction; instr += 1) {
      var frame;
      if (currentFrame && instr === currentInstr) {
        frame = currentFrame;
        frame.dataset.ptInstr = String(instr);
        state.loadedFrameMap[instr] = Date.now();
      } else {
        frame = createVisualizerIframe(state, instr);
      }

      nextFrames.push(frame);
      fragment.appendChild(frame);
    }

    state.iframes.forEach(function (frame) {
      if (frame !== currentFrame && frame.parentNode === state.frameContainer) {
        frame.parentNode.removeChild(frame);
      }
    });

    if (currentFrame && currentFrame.parentNode === state.frameContainer) {
      currentFrame.parentNode.removeChild(currentFrame);
    }

    state.iframes = nextFrames;
    state.frameContainer.appendChild(fragment);
    if (state.resizeHandleEl) {
      state.frameContainer.appendChild(state.resizeHandleEl);
    }
    applyFrameDimensions(
      state,
      state.frameContainer.style.maxWidth || state.effectiveUi.maxWidth || DEFAULT_CONFIG.ui.maxWidth,
      state.frameContainer.clientHeight || state.inlineLayout.iframeHeight
    );
    updateIframeVisibility(state);
    evaluateAutoplayReadiness(state);
    scheduleAutoplayReadinessCheck(state);
  }

  function initializeAutoplayFromTrace(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (state.autoplayConfig.maxInstruction !== null && state.autoplayConfig.maxInstruction !== undefined) return;
    if (state.traceMetaRequested) return;

    state.traceMetaRequested = true;
    updateAutoplayButtonState(state);

    fetchTraceMetadata(state)
      .then(function (meta) {
        if (!state || !state.wrapper || !document.documentElement.contains(state.wrapper)) {
          return;
        }

        state.traceMetaRequested = false;
        state.autoplayConfig.maxInstruction = meta.maxInstruction;

        if (meta.maxInstruction <= 0) {
          state.autoplayUnavailable = true;
          updateAutoplayButtonState(state);
          return;
        }

        rebuildAutoplayFrames(state);
      })
      .catch(function () {
        if (!state || !state.wrapper || !document.documentElement.contains(state.wrapper)) {
          return;
        }

        state.traceMetaRequested = false;
        state.autoplayUnavailable = true;
        updateAutoplayButtonState(state);
      });
  }

  function loadInstructionInIframe(state, iframe, instruction, forceReload) {
    var baseUrl = forceReload
      ? appendReloadToken(state.mergedConfig.baseEmbedUrl, String(instruction))
      : state.mergedConfig.baseEmbedUrl;
    iframe.dataset.ptInstr = String(instruction);
    iframe.src = buildIframeUrl(
      state.code,
      state.langConfig,
      state.mergedConfig,
      buildRuntimeOptionsForInstruction(state, instruction),
      baseUrl
    );
  }

  function setCurrentInstruction(state, instruction, forceReload) {
    var nextInstruction = Math.max(0, parseInt(instruction, 10) || 0);

    if (state.autoplayConfig && state.autoplayConfig.enabled && state.autoplayConfig.maxInstruction !== null && state.autoplayConfig.maxInstruction !== undefined) {
      nextInstruction = clamp(nextInstruction, 0, state.autoplayConfig.maxInstruction);
    }

    state.currentInstr = nextInstruction;

    if (state.autoplayConfig && state.autoplayConfig.enabled && state.iframes.length > 1) {
      updateIframeVisibility(state);
      return;
    }

    loadInstructionInIframe(state, getActiveIframe(state), state.currentInstr, forceReload);
  }

  function clearAutoplayTimer(state) {
    if (state.autoplayTimer) {
      clearTimeout(state.autoplayTimer);
      state.autoplayTimer = null;
    }
  }

  function updateAutoplayButtonState(state) {
    if (!state.autoplayBtn) return;

    if (state.autoplayUnavailable) {
      state.autoplayBtn.style.removeProperty('display');
      state.autoplayBtn.textContent = '自动播放不可用';
      state.autoplayBtn.disabled = true;
      state.autoplayBtn.classList.remove('is-active');
      return;
    }

    state.autoplayBtn.style.removeProperty('display');

    if (
      state.traceMetaRequested ||
      state.autoplayConfig.maxInstruction === null ||
      state.autoplayConfig.maxInstruction === undefined ||
      !state.autoplayReady
    ) {
      state.autoplayBtn.textContent = state.autoplayConfig.preparingButtonText;
      state.autoplayBtn.disabled = true;
      state.autoplayBtn.classList.remove('is-active');
      return;
    }

    state.autoplayBtn.disabled = false;

    state.autoplayBtn.textContent = state.isAutoplaying
      ? state.autoplayConfig.pauseButtonText
      : state.autoplayConfig.startButtonText;

    state.autoplayBtn.classList.toggle('is-active', state.isAutoplaying);
  }

  function evaluateAutoplayReadiness(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) {
      state.autoplayReady = false;
      updateAutoplayButtonState(state);
      return;
    }

    var now = Date.now();
    var warmupMs = state.autoplayConfig.warmupMs || AUTOPLAY_WARMUP_MS;
    var fullyReady = true;

    for (var i = 0; i <= state.autoplayConfig.maxInstruction; i += 1) {
      var loadedAt = state.loadedFrameMap[i];

      if (!loadedAt || (now - loadedAt) < warmupMs) {
        fullyReady = false;
        break;
      }
    }

    state.autoplayReady = fullyReady;

    if (fullyReady && state.pendingAutoplayStart) {
      state.pendingAutoplayStart = false;
      beginAutoplayPlayback(state);
      return;
    }

    updateAutoplayButtonState(state);
  }

  function scheduleAutoplayReadinessCheck(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) return;

    if (state.readinessTimer) {
      clearTimeout(state.readinessTimer);
      state.readinessTimer = null;
    }

    state.readinessTimer = window.setTimeout(function () {
      state.readinessTimer = null;
      evaluateAutoplayReadiness(state);
    }, Math.max(120, state.autoplayConfig.warmupMs || AUTOPLAY_WARMUP_MS));
  }

  function pauseAutoplay(state) {
    if (!state) return;

    state.isAutoplaying = false;
    clearAutoplayTimer(state);
    updateAutoplayButtonState(state);
  }

  function markIframeStateDirty(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;

    if (state.isAutoplaying) {
      pauseAutoplay(state);
    }

    state.frameMayBeOutOfSync = true;
    state.pendingAutoplayStart = false;
  }

  function markFrameLoaded(state, instruction) {
    var index = Math.max(0, parseInt(instruction, 10) || 0);
    state.loadedFrameMap[index] = Date.now();

    if (
      state.autoplayConfig &&
      state.autoplayConfig.enabled &&
      state.autoplayConfig.maxInstruction !== null &&
      state.autoplayConfig.maxInstruction !== undefined
    ) {
      evaluateAutoplayReadiness(state);
      if (!state.autoplayReady) {
        scheduleAutoplayReadinessCheck(state);
      }
    }
  }

  function scheduleAutoplayAdvance(state, delayOverride) {
    clearAutoplayTimer(state);

    if (!state.isAutoplaying) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) {
      pauseAutoplay(state);
      return;
    }

    state.autoplayTimer = window.setTimeout(function () {
      if (!state.isAutoplaying) return;

      if (state.currentInstr >= state.autoplayConfig.maxInstruction) {
        pauseAutoplay(state);
        return;
      }

      setCurrentInstruction(state, state.currentInstr + 1, false);

      if (state.currentInstr >= state.autoplayConfig.maxInstruction) {
        pauseAutoplay(state);
        return;
      }

      scheduleAutoplayAdvance(state);
    }, delayOverride === undefined ? state.autoplayConfig.interval : delayOverride);
  }

  function beginAutoplayPlayback(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (!state.autoplayReady) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) return;

    if (state.currentInstr >= state.autoplayConfig.maxInstruction) {
      setCurrentInstruction(state, 0, false);
    }

    state.isAutoplaying = true;
    updateAutoplayButtonState(state);

    scheduleAutoplayAdvance(state, 80);
  }

  function restartAutoplayFromBeginning(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;
    if (state.autoplayConfig.maxInstruction === null || state.autoplayConfig.maxInstruction === undefined) return;

    pauseAutoplay(state);
    state.currentInstr = 0;
    state.frameMayBeOutOfSync = false;
    state.pendingAutoplayStart = true;
    rebuildAutoplayFrames(state, true);
    updateAutoplayButtonState(state);
  }

  function startAutoplay(state) {
    if (!state || !state.autoplayConfig || !state.autoplayConfig.enabled) return;

    if (state.frameMayBeOutOfSync) {
      restartAutoplayFromBeginning(state);
      return;
    }

    beginAutoplayPlayback(state);
  }

  function updateExpandButtonState(state) {
    if (!state.expandBtn) return;

    state.expandBtn.textContent = state.isExpanded
      ? state.effectiveUi.collapseButtonText
      : state.effectiveUi.expandButtonText;

    state.expandBtn.classList.toggle('is-active', state.isExpanded);
  }

  function getFrameResizeBounds(state) {
    var minHeight = Math.max(INLINE_RESIZE_MIN_HEIGHT, state.effectiveUi.mobileMinHeight || INLINE_RESIZE_MIN_HEIGHT);
    var viewportMax = state.isExpanded
      ? Math.max(minHeight, window.innerHeight - 56)
      : Math.max(minHeight, Math.min(INLINE_RESIZE_MAX_HEIGHT, window.innerHeight ? window.innerHeight - 120 : INLINE_RESIZE_MAX_HEIGHT));

    return {
      min: minHeight,
      max: Math.max(minHeight, viewportMax)
    };
  }

  function getPreferredFrameHeight(state, autoHeightPx) {
    var bounds = getFrameResizeBounds(state);
    var storedHeight = state.isExpanded ? state.userExpandedHeight : state.userInlineHeight;
    var desiredHeight = storedHeight !== null && storedHeight !== undefined ? storedHeight : autoHeightPx;
    return clamp(Math.round(desiredHeight), bounds.min, bounds.max);
  }

  function applyFrameDimensions(state, maxWidthValue, heightPx) {
    var bounds = getFrameResizeBounds(state);
    var safeHeight = clamp(Math.round(heightPx), bounds.min, bounds.max);

    state.frameContainer.style.maxWidth = maxWidthValue || DEFAULT_CONFIG.ui.maxWidth;
    state.frameContainer.style.minHeight = bounds.min + 'px';
    state.frameContainer.style.maxHeight = bounds.max + 'px';
    state.frameContainer.style.height = safeHeight + 'px';

    state.iframes.forEach(function (iframe) {
      iframe.style.maxWidth = 'none';
      iframe.style.height = '100%';
    });
  }

  function setToolbarHint(state) {
    if (!state.hintEl) return;

    state.hintEl.textContent = state.isExpanded
      ? '已进入展开查看，按 Esc 或点击按钮可退出。'
      : state.inlineLayout.layoutHint;
  }

  function applyInlineLayout(state) {
    state.inlineLayout = getInlineLayout(state.wrapper, state.code, state.mergedConfig);
    state.effectiveUi = state.inlineLayout.effectiveUi;
    applyFrameDimensions(
      state,
      state.effectiveUi.maxWidth || DEFAULT_CONFIG.ui.maxWidth,
      getPreferredFrameHeight(state, state.inlineLayout.iframeHeight)
    );
    state.wrapper.style.removeProperty('--pt-expanded-frame-height');
    state.wrapper.classList.remove('is-expanded');
    setToolbarHint(state);
    updateAutoplayButtonState(state);
    updateExpandButtonState(state);
  }

  function calcExpandedIframeHeight(state) {
    var wrapperHeight = state.wrapper.clientHeight;
    var occupied = getOuterHeight(state.toolbarEl) + (state.noteEl ? getOuterHeight(state.noteEl) : 0) + 8;
    var available = wrapperHeight - occupied;
    var minimum = window.innerWidth <= 768
      ? state.effectiveUi.mobileMinHeight
      : Math.max(620, state.effectiveUi.targetHeight);

    return Math.max(minimum, available);
  }

  function applyExpandedLayout(state) {
    state.wrapper.classList.add('is-expanded');

    var expandedHeight = getPreferredFrameHeight(state, calcExpandedIframeHeight(state));
    state.wrapper.style.setProperty('--pt-expanded-frame-height', expandedHeight + 'px');
    applyFrameDimensions(state, 'none', expandedHeight);
    setToolbarHint(state);
    updateAutoplayButtonState(state);
    updateExpandButtonState(state);
  }

  function refreshBlockLayout(state) {
    if (!state || !document.documentElement.contains(state.wrapper)) return;

    if (state.isExpanded) {
      applyExpandedLayout(state);
    } else {
      applyInlineLayout(state);
    }
  }

  function createResizeHandle() {
    var handle = document.createElement('div');
    handle.className = 'pytutor-resize-handle';
    handle.setAttribute('role', 'presentation');
    handle.title = '拖动右下角调整高度';
    return handle;
  }

  function bindResizeHandle(state) {
    if (!state || !state.resizeHandleEl) return;

    state.resizeHandleEl.addEventListener('mousedown', function (event) {
      event.preventDefault();

      var startY = event.clientY;
      var startHeight = state.frameContainer.getBoundingClientRect().height;

      state.frameContainer.classList.add('is-resizing');
      document.body.style.userSelect = 'none';

      function onMouseMove(moveEvent) {
        var bounds = getFrameResizeBounds(state);
        var nextHeight = clamp(startHeight + (moveEvent.clientY - startY), bounds.min, bounds.max);

        if (state.isExpanded) {
          state.userExpandedHeight = nextHeight;
          state.wrapper.style.setProperty('--pt-expanded-frame-height', nextHeight + 'px');
        } else {
          state.userInlineHeight = nextHeight;
        }

        applyFrameDimensions(
          state,
          state.isExpanded ? 'none' : (state.effectiveUi.maxWidth || DEFAULT_CONFIG.ui.maxWidth),
          nextHeight
        );
      }

      function onMouseUp() {
        state.frameContainer.classList.remove('is-resizing');
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  function createBackdrop(state) {
    var backdrop = document.createElement('div');
    backdrop.className = 'pytutor-expanded-backdrop';
    return backdrop;
  }

  function expandBlock(state) {
    if (!state || state.isExpanded) return;

    if (activeExpandedBlock && activeExpandedBlock !== state) {
      collapseExpandedBlock(activeExpandedBlock, false);
    }

    state.placeholderEl = document.createElement('div');
    state.placeholderEl.className = 'pytutor-placeholder';
    state.placeholderEl.style.height = getOuterHeight(state.wrapper) + 'px';
    state.wrapper.parentNode.insertBefore(state.placeholderEl, state.wrapper);

    state.lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    state.lastFocusedEl = document.activeElement;
    state.backdropEl = createBackdrop(state);

    document.body.appendChild(state.backdropEl);
    document.body.appendChild(state.wrapper);
    lockDocumentScroll();

    state.isExpanded = true;
    activeExpandedBlock = state;
    applyExpandedLayout(state);

    if (!state.boundKeydown) {
      state.boundKeydown = function (event) {
        if (event.key === 'Escape') {
          collapseExpandedBlock(state, true);
        }
      };
    }

    window.addEventListener('keydown', state.boundKeydown);
    if (state.expandBtn) {
      state.expandBtn.focus();
    }
  }

  function collapseExpandedBlock(state, restoreFocus) {
    if (!state || !state.isExpanded) return;

    state.isExpanded = false;

    if (state.backdropEl && state.backdropEl.parentNode) {
      state.backdropEl.parentNode.removeChild(state.backdropEl);
    }
    state.backdropEl = null;

    if (state.placeholderEl && state.placeholderEl.parentNode) {
      state.placeholderEl.parentNode.insertBefore(state.wrapper, state.placeholderEl);
      state.placeholderEl.parentNode.removeChild(state.placeholderEl);
    }
    state.placeholderEl = null;

    window.removeEventListener('keydown', state.boundKeydown);
    unlockDocumentScroll();

    if (activeExpandedBlock === state) {
      activeExpandedBlock = null;
    }

    applyInlineLayout(state);
    window.scrollTo(0, state.lastScrollY || 0);

    if (restoreFocus && state.lastFocusedEl && typeof state.lastFocusedEl.focus === 'function') {
      try {
        state.lastFocusedEl.focus();
      } catch (err) {}
    }
  }

  function destroyBlock(state) {
    if (!state) return;

    pauseAutoplay(state);

    if (state.isExpanded) {
      collapseExpandedBlock(state, false);
    }

    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
    }

    if (state.readinessTimer) {
      clearTimeout(state.readinessTimer);
      state.readinessTimer = null;
    }

    if (state.boundResize) {
      window.removeEventListener('resize', state.boundResize);
    }
  }

  function teardownRenderedBlocks() {
    renderedBlocks.forEach(function (state) {
      destroyBlock(state);
    });

    renderedBlocks = [];
  }

  function bindResponsiveLayout(state) {
    state.boundResize = function () {
      refreshBlockLayout(state);
    };

    window.addEventListener('resize', state.boundResize);

    if (typeof window.ResizeObserver === 'function') {
      state.resizeObserver = new ResizeObserver(function () {
        if (!state.isExpanded) {
          refreshBlockLayout(state);
        }
      });
      state.resizeObserver.observe(state.wrapper.parentElement || state.wrapper);
    }
  }

  function createVisualizerIframe(state, instruction) {
    var iframe = document.createElement('iframe');
    iframe.loading = 'eager';
    iframe.title = state.langConfig.label + ' Visualizer';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.dataset.ptInstr = String(instruction);
    iframe.addEventListener('load', function () {
      markFrameLoaded(state, instruction);
    });
    iframe.addEventListener('focus', function () {
      markIframeStateDirty(state);
    });
    iframe.addEventListener('pointerdown', function () {
      markIframeStateDirty(state);
    });
    loadInstructionInIframe(state, iframe, instruction, true);
    return iframe;
  }

  function renderOneBlock(pre, langSpec, mergedConfig) {
    if (!pre || pre.dataset.ptRendered === '1') return;

    var codeEl = pre.querySelector('code');
    if (!codeEl) return;

    var rawCode = codeEl.textContent || '';
    if (!rawCode.trim()) return;

    var normalizedCode = normalizeCode(rawCode);
    var langConfig = mergedConfig.langMap[langSpec.langKey];
    if (!langConfig) return;

    var inlineLayout = getInlineLayout(pre, normalizedCode, mergedConfig);
    var autoplayConfig = getEffectiveAutoplayConfig(mergedConfig);
    var initialInstr = Math.max(0, toNumber((mergedConfig.defaultOptions || {}).curInstr, 0));
    var toolbarBits = createToolbar(langConfig.label, normalizedCode, inlineLayout.effectiveUi, autoplayConfig);

    var wrapper = document.createElement('div');
    wrapper.className = 'pytutor-wrapper';

    var frameContainer = document.createElement('div');
    frameContainer.className = 'pytutor-frame-container';
    var resizeHandleEl = createResizeHandle();

    wrapper.appendChild(toolbarBits.toolbar);
    wrapper.appendChild(frameContainer);

    var noteEl = null;
    if (inlineLayout.effectiveUi.showNote) {
      noteEl = document.createElement('div');
      noteEl.className = 'pytutor-note';
      noteEl.textContent = inlineLayout.effectiveUi.noteText || '';
      wrapper.appendChild(noteEl);
    }

    pre.replaceWith(wrapper);
    pre.dataset.ptRendered = '1';

    var state = {
      wrapper: wrapper,
      frameContainer: frameContainer,
      iframes: [],
      activeIframeIndex: initialInstr,
      code: normalizedCode,
      langConfig: langConfig,
      mergedConfig: mergedConfig,
      inlineLayout: inlineLayout,
      effectiveUi: inlineLayout.effectiveUi,
      autoplayConfig: autoplayConfig,
      toolbarEl: toolbarBits.toolbar,
      hintEl: toolbarBits.hint,
      autoplayBtn: toolbarBits.autoplayBtn,
      expandBtn: toolbarBits.expandBtn,
      resizeHandleEl: resizeHandleEl,
      noteEl: noteEl,
      currentInstr: initialInstr,
      loadedFrameMap: {},
      autoplayReady: autoplayConfig.enabled ? false : true,
      autoplayUnavailable: autoplayConfig.enabled ? false : true,
      traceMetaRequested: false,
      isAutoplaying: false,
      autoplayTimer: null,
      readinessTimer: null,
      pendingAutoplayStart: false,
      frameMayBeOutOfSync: false,
      userInlineHeight: null,
      userExpandedHeight: null,
      isExpanded: false,
      boundResize: null,
      resizeObserver: null,
      backdropEl: null,
      placeholderEl: null,
      lastFocusedEl: null,
      lastScrollY: 0,
      boundKeydown: null
    };

    if (
      state.autoplayConfig.enabled &&
      state.autoplayConfig.maxInstruction !== null &&
      state.autoplayConfig.maxInstruction !== undefined
    ) {
      for (var instr = 0; instr <= state.autoplayConfig.maxInstruction; instr += 1) {
        state.iframes.push(createVisualizerIframe(state, instr));
      }
    } else {
      state.iframes.push(createVisualizerIframe(state, initialInstr));
    }

    state.iframes.forEach(function (frame) {
      frameContainer.appendChild(frame);
    });
    frameContainer.appendChild(resizeHandleEl);

    updateIframeVisibility(state);
    updateAutoplayButtonState(state);
    initializeAutoplayFromTrace(state);
    bindResizeHandle(state);

    if (state.expandBtn) {
      state.expandBtn.addEventListener('click', function () {
        if (state.isExpanded) {
          collapseExpandedBlock(state, true);
        } else {
          expandBlock(state);
        }
      });
    }

    if (state.autoplayBtn) {
      state.autoplayBtn.addEventListener('click', function () {
        if (state.isAutoplaying) {
          pauseAutoplay(state);
        } else {
          startAutoplay(state);
        }
      });
    }

    applyInlineLayout(state);
    bindResponsiveLayout(state);
    renderedBlocks.push(state);
  }

  function renderPyTutorBlocks() {
    ensureStyles();
    teardownRenderedBlocks();

    var mergedConfig = getMergedConfig();
    var container = document.querySelector('#main');
    if (!container) return;

    var blocks = container.querySelectorAll('pre[data-lang]');
    Array.prototype.forEach.call(blocks, function (pre) {
      var langSpec = parseLangSpec(pre.getAttribute('data-lang'), mergedConfig);
      if (!langSpec) return;

      renderOneBlock(pre, langSpec, mergedConfig);
    });
  }

  function install(hook) {
    hook.beforeEach(function (content) {
      teardownRenderedBlocks();
      return content;
    });

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
