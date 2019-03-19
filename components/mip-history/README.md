# mip-history

封装了对历史记录的操作，实现浏览器页面间前进后退的功能。

标题|内容
----|----
类型| 动态内容
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-history/mip-history.js

## 示例

### 基本用法

`mip-history` 组件用于操作浏览器 history，通过 `history` 属性指定操作。`mip-history` 的操作相当于对 `window.history` 的封装，使用方法可参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/History)。

```html
<mip-history history="go, -1" class="mip-history-default">
  go, -1 (返回上一页)
</mip-history>
<mip-history history="go, -2" class="mip-history-default">
  go, -2 (返回上两页)
</mip-history>
<mip-history history="go, 1" class="mip-history-default">
  go, 1(前进下一页)
</mip-history>
<mip-history history="go" class="mip-history-default">
  go (前进下一页)
</mip-history>
<mip-history history="back" class="mip-history-default">
  back(返回下一页)
</mip-history>
<mip-history history="forward" class="mip-history-default">
  forward(前进下一页)
</mip-history>
```

### 使用 `<mip-history>` 作为按钮

配合组件 layout 属性，可以方便的为 `mip-history` 指定样式作为页面前进返回按钮。例如示例中设置 `layout="responsive"` 布局，设置 `width` 和 `height` 样式宽高比，请参考阅读[组件布局](/doc/3-widget/11-widget-layout.html)。

```html
<!--宽高比3：1-->
<mip-history history="go, -1" class="mip-history-default"
  layout="responsive" width="3" height="1">
  go, -1
</mip-history>
<!--定高30px-->
<mip-history history="go, -1" class="mip-history-default"
  layout="fixed-height" width="30">
  go, -1
</mip-history>
```

## 属性

### history

说明：对历史记录的操作方式，支持 `go`, `back`, `forward`

必选项：是

类型：字符串

取值范围：`back`, `forward`, `"go, -1"`
