# mip-gototop 回到顶部组件

点击回到页面顶部。

| 标题     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 类型     | 通用                                                      |
| 支持布局 | N/S                                                       |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-gototop/mip-gototop.js |

## 示例

### 基本使用

默认为滚动 200px 的高度显示按钮

```html
<mip-fixed type="gototop">
  <mip-gototop></mip-gototop>
</mip-fixed>
```

### 设置阈值

阈值为页面滚动的高度
```html
<mip-fixed type="gototop">
  <mip-gototop threshold="300"></mip-gototop>
</mip-fixed>
```

单位为 vh 时
```html
<mip-fixed type="gototop">
  <mip-gototop threshold="120vh"></mip-gototop>
</mip-fixed>
```

## 属性

### threshold

说明：设置页面滚动多少高度时显示按钮，单位

必选项: 否

单位：`px`，`vh`，1vh = 窗口高度的 1%，单位默认为 `px`

默认值：`200px`
