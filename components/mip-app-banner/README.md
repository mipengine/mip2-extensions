# mip-app-banner App 调起组件

此组件用于调起 App。提供一个固定位置（页面底部）的容器供用户自定义 banner 的内容，点击 banner 中的 button 按钮后，调起或下载 App。在用户关闭后会永久隐藏。

| 标题     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 类型     | 通用                                                            |
| 支持布局 | responsive, fixed-height, fill, container, fixed                |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-app-banner/mip-app-banner.js |

## 说明

`mip-app-banner` 不提供默认的样式，用户可以自定义 banner 内部的结构和样式。为了保证更友好的交互性，组件内部对 banner 的关闭按钮做了限制，不可自定义，该按钮的 class 名为 `mip-app-banner-dismiss-button`，出现在 banner 的右上角位置。组件内部必须定义一个带有 `open-button` 属性的 `button` 元素，用于调起/下载 App。

在特定的系统和浏览器环境下，如 Android/Chrome 或 iOS/Safari，会出现系统自带的 banner，所以 `mip-app-banner` 会被隐藏，避免冗余。具体可参考下方的兼容性说明。

### 浏览器兼容性

| 浏览器       | Android+chrome | Android+baidu | iOS+safari       | 其他情况 |
| ------------ | -------------- | ------------- | ---------------- | -------- |
| 结果页打开   | 支持           | 不支持，屏蔽    | 不支持，暂时屏蔽 | 支持     |
| 非结果页打开 | 不支持，屏蔽     | 不支持，屏蔽    | 浏览器 banner    | 支持     |

在环境支持的情况下，组件默认会始终展示。如果用户手动点击了关闭按钮，组件将永远不会出现，除非更换浏览器或者清除浏览器缓存（localstorage）。

## 注意事项

- 组件需要有 `mip-hidden` class，否则会有闪动问题

- 根据不同的系统，在引用组件的页面头部 head 标签中需要加两个标签
  - iOS 使用：`<meta name="apple-itunes-app" content="app-id=app的id, app-argument=medium://xxxx">`。
  - Android 使用：`<link rel="manifest" href="https://xxxx/manifest.json">`。
  - manifest 的 url 必须是 HTTPS 的。

- manifest.json 示例

```
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "open": "scheme://xx",
      "install": "your download url"
    }
  ]
}
```

## 示例

### 基本用法

```html
<head>
  <meta name="apple-itunes-app" content="app-id=xxxx, app-argument=medium://xxxx">
  <link rel="manifest" href="xxxx/manifest">
</head>
...
<mip-app-banner id="my-app-banner" layout="nodisplay" class="mip-hidden">
  <button open-button>打开app</button>
</mip-app-banner>
```

## 属性

### id

说明：组件 id，组件的唯一性标识，作为 localstorage 的 key 值，用于处理持久化 展示/隐藏 逻辑

比选项： 是

类型：字符串

取值范围：无

单位：无

默认值：无

### layout

说明：组件布局，只能设置值为 `nodisplay`

必选项：是

类型：字符串

取值范围：`nodisplay`

单位：无

默认值：`nodisplay`

### 子节点 `[open-button]`

说明：调起 App 的按钮，必须带有 `open-button` 属性

必选项：是

类型：HTML 节点

取值范围：无

单位：无

默认值：`<button open-button>`
