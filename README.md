# docsify-pytutor

一个可直接在 **Docsify** 中使用的代码执行可视化插件，基于 **Python Tutor** 实现，支持在 Markdown 中把 `Python` 和 `Java` 代码块自动渲染为可交互的可视化面板。

---

## 功能特性

- 支持 `python` 代码块可视化交互展示
- 支持 `java` 代码块可视化交互展示
- 支持 `pytutor` 作为 Python 简写
- 自动注入样式，无需手动编写大段 CSS
- 自带“复制代码”按钮
- 支持通过 `window.$docsify.pytutor` 进行简单配置
- 支持本地引用
- 支持通过 **GitHub + jsDelivr CDN** 直接引用
- 内置 `compact / comfortable / tall` 三档舒适视图
- 支持一键“展开查看”，适合长代码和复杂对象场景
- 窄屏下可自动切换为纵向布局，减少对象区被压缩
- 自动去除代码块的公共前导缩进，降低 Markdown 缩进带来的报错概率
- 支持按已知步数配置“开始 / 暂停”自动播放，适合课件演示

---

## 在线预览

如果你通过 `docsify` 打开本仓库的文档页，下面这个示例会被直接渲染成可交互的可视化面板：

```pytutor-steps-10
nums = [1, 2, 3]
total = 0

for n in nums:
    total += n

print(total)
```

---

## 仓库地址

```text
https://github.com/sherlockmen/docsify-pytutor
```

---

## 安装方式

### 方式一：通过 CDN 引用（推荐）

在`docsify`的`index.html`文件中引用以下CDN地址

```html
<script src="https://cdn.jsdelivr.net/gh/sherlockmen/docsify-pytutor@v1.0.1/dist/docsify-pytutor.js"></script>
```

如果你还在使用 `@v1.0.0`，是看不到这次界面优化效果的，需要切到新版本 tag。

### 方式二：本地引用

将插件文件下载到项目中后，本地引入：

```html
<script src="./dist/docsify-pytutor.js"></script>
```
---

## 快速开始

在 Docsify 的 `index.html` 中进行如下配置：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Docsify PyTutor Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css" />
</head>
<body>
  <div id="app"></div>

  <script>
    window.$docsify = {
      name: 'Docsify PyTutor Demo',
      loadSidebar: false,
      subMaxLevel: 2,
      pytutor: {
        baseEmbedUrl: 'https://pythontutor.com/iframe-embed.html',
        defaultOptions: {
          cumulative: 'false',
          curInstr: '0',
          heapPrimitives: 'nevernest',
          drawParentPointers: 'false',
          textReferences: 'false',
          showOnlyOutputs: 'false'
        },
        autoplay: {
          interval: 900,
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
          baseHeight: 760,
          lineHeight: 24,
          minHeight: 680,
          maxHeight: 1200,
          mobileMinHeight: 480,
          codeDivMaxHeight: 760
        }
      }
    };
  </script>

  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="https://cdn.jsdelivr.net/gh/sherlockmen/docsify-pytutor@v1.0.1/dist/docsify-pytutor.js"></script>
</body>
</html>
```

---

## Markdown 使用方式

### Python

````md
```pytutor-python
def for_loop(n: int) -> int:
    """for 循环"""
    res = 0
    for i in range(1, n + 1):
        res += i
    return res

if __name__ == "__main__":
    n = 5
    res = for_loop(n)
    print(f"for循环的求和结果 res = {res}")
```
````

### Python 简写

````md
```pytutor
nums = [1, 2, 3]
for n in nums:
    print(n)
```
````

### Java

````md
```pytutor-java
public class Main {
    public static void main(String[] args) {
        int a = 3;
        int b = 4;
        int c = a + b;
        System.out.println(c);
    }
}
```
````

---

## 配置项说明

可以在 `window.$docsify.pytutor` 中进行自定义配置：

```js
window.$docsify = {
  pytutor: {
    baseEmbedUrl: 'https://pythontutor.com/iframe-embed.html',
    defaultOptions: {
      cumulative: 'false',
      curInstr: '0',
      heapPrimitives: 'nevernest',
      drawParentPointers: 'false',
      textReferences: 'false',
      showOnlyOutputs: 'false'
    },
    autoplay: {
      interval: 900,
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
      baseHeight: 760,
      lineHeight: 24,
      minHeight: 680,
      maxHeight: 1200,
      mobileMinHeight: 480,
      codeDivMaxHeight: 760
    }
  }
}
```

### 参数说明

#### 顶层配置

| 参数 | 说明 | 示例 |
|------|------|------|
| `baseEmbedUrl` | Python Tutor iframe 地址 | `https://pythontutor.com/iframe-embed.html` |
| `defaultOptions` | 透传给 Python Tutor 的参数 | 见下文 |
| `autoplay` | 自动播放相关配置 | 见下文 |
| `ui` | 插件界面相关配置 | 见下文 |

#### `defaultOptions` 配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `cumulative` | 是否累计显示执行步骤 | `false` |
| `curInstr` | 初始显示的执行步骤 | `0` |
| `heapPrimitives` | 基本类型在堆中的显示方式 | `nevernest` |
| `drawParentPointers` | 是否显示父指针 | `false` |
| `textReferences` | 是否显示文本引用 | `false` |
| `showOnlyOutputs` | 是否仅显示输出 | `false` |

#### `ui` 配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `copyButtonText` | 复制按钮文案 | `复制代码` |
| `copiedButtonText` | 复制成功文案 | `已复制` |
| `copyFailedText` | 复制失败文案 | `复制失败` |
| `showNote` | 是否显示底部说明 | `false` |
| `noteText` | 底部说明文字 | 适合小段教学示例代码的说明 |
| `maxWidth` | iframe 最大宽度 | `1080px` |
| `heightPreset` | 舒适视图档位，支持 `compact / comfortable / tall` | `comfortable` |
| `layoutMode` | 布局模式，支持 `auto / horizontal / vertical` | `auto` |
| `showExpandButton` | 是否显示展开查看按钮 | `true` |
| `expandButtonText` | 展开按钮文案 | `展开查看` |
| `collapseButtonText` | 收起按钮文案 | `退出展开` |
| `baseHeight` | 高级覆盖项，用于手动指定基础高度 | `760` |
| `lineHeight` | 每行代码增加的高度 | `24` |
| `minHeight` | 高级覆盖项，用于手动指定最小高度 | `680` |
| `maxHeight` | 高级覆盖项，用于手动指定最大高度 | `1200` |
| `mobileMinHeight` | 高级覆盖项，用于手动指定移动端最小高度 | `480` |
| `codeDivMaxHeight` | 高级覆盖项，用于限制 Python Tutor 内部代码区最大高度 | `760` |

#### `autoplay` 配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `stepCount` | 全局自动播放步数，可被代码块语言后缀覆盖 | `null` |
| `interval` | 自动播放的步进间隔，单位毫秒 | `900` |
| `warmupMs` | 预热等待时间，单位毫秒，用于等待后台帧真正稳定可切换 | `650` |
| `startButtonText` | 自动播放开始按钮文案 | `开始` |
| `pauseButtonText` | 自动播放暂停按钮文案 | `暂停` |

### 自动播放用法

由于 Python Tutor 的 iframe 不会把总步数暴露给父页面，因此自动播放需要一个已知步数。最简单的用法，是在代码块语言后面追加 `-steps-数字`：

````md
```pytutor-steps-10
nums = [1, 2, 3]
total = 0

for n in nums:
    total += n

print(total)
```
````

如果你希望整站统一开启自动播放按钮，也可以通过全局配置传入：

```js
window.$docsify = {
  pytutor: {
    autoplay: {
      stepCount: 10,
      interval: 900,
      warmupMs: 650
    }
  }
};
```

推荐优先使用代码块后缀，例如 `pytutor-steps-10` 或 `pytutor-java-steps-12`，这样不同示例可以拥有各自准确的步数。

自动播放按钮维护的是插件侧步号；如果你在播放过程中又手动点击了 Python Tutor iframe 里的前进/后退按钮，插件无法同步读回那个状态。更适合在教学演示里二选一使用：要么用“开始 / 暂停”，要么手动点步进按钮。

为了减少闪烁，自动播放会先把已知步数范围内的可视化帧在后台预加载完成；预加载没结束前，按钮会短暂显示“准备中”。这一步除了等待 iframe 外壳加载，还会额外保留一段 `warmupMs` 预热时间，尽量避开刚切换就白一下的情况。若网络较慢，建议把 `interval` 调到 `1200` 或更高。

---

## License

MIT
