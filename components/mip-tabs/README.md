# `mip-tabs`

tab 切换组件

| 标题     | 内容                                                |
| -------- | --------------------------------------------------- |
| 类型     |  通用                                               |
| 支持布局 | responsive, fixed-height, fixed, container          |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-tabs/mip-tabs.js |

## 说明

可嵌套、自定义 tab 标签及对应内容

## 示例

```html
<mip-tabs initial-tab="0">
  <mip-tabs-item label="MIP 2">
    <h2>什么是 MIP</h2>
    <p>MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
      MIP 主要由三部分组织成：
    </p>
  </mip-tabs-item>

  <mip-tabs-item label="mip-tabs组件介绍">
    <ol>
      <li>使用方便</li>
      <li>动画交互</li>
      <li>任意嵌套</li>
      <li>自定义tab内容结构</li>
    </ol>
  </mip-tabs-item>

  <mip-tabs-item label="嵌套">
    这里嵌套了另一个tab标签
    <mip-tabs initial-tab="0">
      <mip-tabs-item label="嵌1"> 嵌套111111</mip-tabs-item>
      <mip-tabs-item label="嵌2"> 嵌套222222</mip-tabs-item>
      <mip-tabs-item label="嵌3"> 嵌套333333</mip-tabs-item>
    </mip-tabs>
  </mip-tabs-item>

  <mip-tabs-item label="Tab 4">
    纯文字~
  </mip-tabs-item>

  <mip-tabs-item label="暂未开放" disabled="true">
  </mip-tabs-item>

  </mip-tabs>
```

## 属性

属性说明

### initialTab

说明：设置初始显示的标签

必选项：否

类型：`Number`

默认值：0

## 事件

### changeEnd

每次切换完毕后，触发`changeEnd`事件，并透传当前激活的下标

## 方法

### slideTab (index)

- **参数:**

  - `{Number} index`

- **用法：**
  - 外部调用组件`slideTab`方法，tab 标签会切换至相应下标（如组件`id`为`tab`, `tab.slideTab(1)`）
