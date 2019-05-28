# mip-sticky-ad

作为广告的容器，用于将广告固定在页面的底部。

标题|内容
----|----
类型|通用
支持布局| nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-sticky-ad/mip-sticky-ad.js](https://c.mipcdn.com/static/v2/mip-sticky-ad/mip-sticky-ad.js)

## 行为

- 页面中只能有一个 `<mip-sticky-ad>` 并且 `<mip-sticky-ad>` 只能有一个子元素 `<mip-ad>`
- 组件出现在页面底部
- 组件占满页面宽度，内部根据 `<mip-ad>` 的 `width` 和 `height` 显示 `<mip-ad>`
- 组件的 `height` 是 `<mip-ad>` 所需的最大高度
- 组件的最大高度为 `100px`，如果子元素高度超过 `100px`，超出部分会被隐藏
- 组件的 `width` 为 `100%`，不能被覆盖
- 组件的 `opacity` 为 `1`，不能被覆盖
- 组件的 `background-color` 可以自定义，但是不允许设置 `alpha`，会被自动改为不透明
- 滚动页面到底部时，页面会被自动填充空位，所以页面内容不会被组件遮盖
- 点击关闭按钮可以移除组件

子组件用法见[`mip-ad`](https://www.mipengine.org/v2/components/ads/mip-ad.html)

## 示例

```html
<mip-sticky-ad layout="nodisplay">
  <mip-ad
    width="300"
    height="50"
    type="ad-baidu"
    cproid="u2697398">
  </mip-ad>
</mip-sticky-ad>
```

## 属性

### layout

说明：布局

必选项：是

类型：string

默认值：`nodisplay`，且只能取 `nodisplay`

## 样式

组件可以通过 CSS 设置样式。

- 使用类名 `i-miphtml-sticky-ad-layout` 设置容器样式
- 使用类名 `mip-sticky-ad-close-button` 设置关闭按钮样式
- 使用类名 `mip-sticky-ad-top-padding` 设置顶部填充条样式
