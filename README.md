<<<<<<< HEAD
# docsify-pytutor
一个可以实现代码执行可视化的docsify插件
=======
# docsify-pytutor-plugin

一个可直接在 **Docsify** 中使用的 **Python Tutor 可视化插件**，支持在 Markdown 里把 `Python` 和 `Java` 代码块自动渲染成可交互的可视化面板。

它基于 Docsify 的插件机制实现，Docsify 官方支持通过插件生命周期扩展页面渲染能力；同时 jsDelivr 支持直接从 GitHub 仓库分发静态脚本，所以这个插件既可以本地引用，也可以发布到 GitHub 后让别人通过 CDN 直接引用。

---

## 功能特性

- 支持 `pytutor-python` 代码块
- 支持 `pytutor-java` 代码块
- 支持 `pytutor` 作为 Python 简写
- 自动注入样式，不需要再手写一大段 CSS
- 自带“复制代码”按钮
- 支持通过 `window.$docsify.pytutor` 做简单配置
- 适合 GitHub 仓库托管，也适合后续扩展到 npm 发布

---

## 目录结构

```text
.
├── dist/
│   └── docsify-pytutor.js
├── docs/
│   ├── index.html
│   └── README.md
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 一、本地使用

先把 `dist/docsify-pytutor.js` 放到你的项目里，然后在 `index.html` 中引入。

### `index.html`

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
        ui: {
          copyButtonText: '复制代码',
          copiedButtonText: '已复制',
          copyFailedText: '复制失败',
          showNote: false,
          noteText: '说明：适合小段教学示例代码，不适合复杂项目代码。',
          maxWidth: '960px',
          aspectRatio: '2.35 / 1',
          minHeight: '400px',
          maxHeight: '500px'
        }
      }
    };
  </script>

  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="./dist/docsify-pytutor.js"></script>
</body>
</html>
```

插件会自动注册到 Docsify，不需要你再手动写 `plugins: [function(hook){...}]`。Docsify 官方文档说明插件就是挂在其生命周期上的函数。

---

## 二、Markdown 写法

### Python

````md
```pytutor-python
x = 1
y = 2
z = x + y
print(z)
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

## 三、配置项

你可以在 `window.$docsify.pytutor` 里配置：

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
    ui: {
      copyButtonText: '复制代码',
      copiedButtonText: '已复制',
      copyFailedText: '复制失败',
      showNote: false,
      noteText: '说明：适合小段教学示例代码，不适合复杂项目代码。',
      maxWidth: '960px',
      aspectRatio: '2.35 / 1',
      minHeight: '400px',
      maxHeight: '500px'
    }
  }
}
```

### 配置说明

| 配置项 | 说明 | 默认值 |
|---|---|---|
| `baseEmbedUrl` | Python Tutor iframe 地址 | `https://pythontutor.com/iframe-embed.html` |
| `defaultOptions` | 透传给 Python Tutor 的参数 | 见上文 |
| `ui.copyButtonText` | 复制按钮文案 | `复制代码` |
| `ui.copiedButtonText` | 复制成功文案 | `已复制` |
| `ui.copyFailedText` | 复制失败文案 | `复制失败` |
| `ui.showNote` | 是否显示底部说明 | `false` |
| `ui.noteText` | 底部说明文字 | 默认说明 |
| `ui.maxWidth` | iframe 最大宽度 | `960px` |
| `ui.aspectRatio` | iframe 比例 | `2.35 / 1` |
| `ui.minHeight` | iframe 最小高度 | `400px` |
| `ui.maxHeight` | iframe 最大高度 | `500px` |

---

## 四、发布到 GitHub 后给别人引用

### 1. 创建仓库

先在 GitHub 创建一个公开仓库，例如：

```text
docsify-pytutor-plugin
```

### 2. 本地初始化并推送

```bash
git init
git add .
git commit -m "feat: init docsify-pytutor-plugin"
git branch -M main
git remote add origin https://github.com/<your-name>/docsify-pytutor-plugin.git
git push -u origin main
```

### 3. 打版本标签

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 4. 让别人通过 CDN 引用

jsDelivr 支持直接从 GitHub 公共仓库分发文件。

你的插件地址可以写成：

```html
<script src="https://cdn.jsdelivr.net/gh/<your-name>/docsify-pytutor-plugin@v1.0.0/dist/docsify-pytutor.js"></script>
```

推荐固定版本号，不要直接用 `main`，这样更稳定。jsDelivr 本身支持从 GitHub 分发静态文件。

---

## 五、别人如何配置使用

别人只需要在自己的 Docsify `index.html` 里这样写：

```html
<script>
  window.$docsify = {
    name: 'My Docs',
    loadSidebar: true,
    pytutor: {
      ui: {
        showNote: false,
        maxWidth: '960px',
        aspectRatio: '2.35 / 1'
      }
    }
  };
</script>

<script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
<script src="https://cdn.jsdelivr.net/gh/<your-name>/docsify-pytutor-plugin@v1.0.0/dist/docsify-pytutor.js"></script>
```

然后在 Markdown 里直接写：

````md
```pytutor-python
x = 1
y = 2
print(x + y)
```
````

---

## 六、可选：开启 GitHub Pages 做演示站

Docsify 本身非常适合直接放到 GitHub Pages 上做演示文档；Docsify 官方也提供了 GitHub Pages 友好的快速使用方式。

如果你希望仓库自带一个 demo 页面：

1. 保留本仓库里的 `docs/` 目录
2. GitHub 仓库进入 `Settings` → `Pages`
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`
5. Folder 选择 `/docs`

这样别人既能看源码，也能直接打开你的演示站。

---

## 七、注意事项

- Python Tutor 更适合小段教学示例代码
- 复杂项目、外部依赖、文件读写、GUI、多线程代码通常不适合可视化
- 如果你后面自部署了 Python Tutor，只需要改 `baseEmbedUrl`
- 这是基于 iframe 的嵌入方式，样式主要控制外层容器，不直接控制 iframe 内部页面

---

## 八、License

MIT
>>>>>>> bea380e (feat: init docsify-pytutor-plugin)
