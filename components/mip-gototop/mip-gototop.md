# mip-gototop 回到顶部组件

点击回到页面顶部。

| 标题     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 类型     | 通用                                                      |
| 支持布局 | N/S                                                       |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-gototop/mip-gototop.js |

## 示例

### 基本使用

```html
<mip-fixed type="gototop">
  <mip-gototop></mip-gototop>
</mip-fixed>
```

### 设置阈值

```html
<mip-fixed type="gototop">
  <mip-gototop threshold="300"></mip-gototop>
</mip-fixed>
```

## 属性

### threshold

说明：设置页面滚动多少高度时显示按钮  
必选项: 否  
取值范围：`Number`  
单位：`px`  
默认值：`200`
