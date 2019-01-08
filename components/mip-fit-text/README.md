# `mip-fit-text`

标题|内容
----|----
类型| 通用
支持布局| responsive, fixed-height, fill, container, fixed, fixed-item
所需脚本| [https://c.mipcdn.com/static/v2/mip-fit-text/mip-fit-text.js](https://c.mipcdn.com/static/v2/mip-fit-text/mip-fit-text.js)

## 说明

`mip-fit-text` 组件是一个文本容器，在给定文本内容和文本容器大小的情况下，mip-fit-text 会计算出最适合的文本字体大小，使得文本内容能够填充满整个文本容器区域。mip-fit-text 的内容可以是文本或者其他行内元素的内容（inline content），也可包含非行内元素的内容。

## 示例

mip-fit-text 只是一个文本容器，本身并不会带任何样式，为了能够在下面的示例中展示出文本与容器的相对关系，会给 `mip-fit-text` 标签预设一个边框样式：

```css
mip-fit-text {
  border: 1px solid #000;
}
```

### 基本用法

本示例展示了文本容器区域宽高固定为 200px 的情况下，mip-fit-text 会自动计算出最适合的文本字体大小，使得内容完全占满整个文本容器区域：

```html
<mip-fit-text width="200" height="200" layout="fixed">
  MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
</mip-fit-text>
```

当 mip-fit-text 的 layout="responsive" 时，文本容器区域大小随父节点的宽度进行等比例缩放。当父节点宽高固定为 200px，而 mip-fit-text 的宽高比为 300:200 时，内容文本同样占满整个文本容器区域：

```html
<div class="wrapper">
  <mip-fit-text width="300" height="200" layout="responsive">
    MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
  </mip-fit-text>
</div>
```

### 设置 min-font-size

mip-fit-text 默认的最小字体大小为 6px，开发者可以通过配置属性 `min-font-size` 来修改最小字体大小，如果 min-font-size 设置过大，可能会导致文本内容超出容器区域，mip-fit-text 会对超出区域的部分做截断处理。本示例将 min-font-size 设置为 30，可以看到截断处理的效果：

```html
<mip-fit-text
  width="200"
  height="200"
  layout="fixed"
  min-font-size="30"
>
  MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
</mip-fit-text>
```

### 设置 max-font-size

mip-fit-text 默认最大字体大小为 72px，开发者可以通过配置属性 `max-font-size` 来修改最大字体大小。如果 max-font-size 设置过小，可能会导致文本内容无法跳虫整个容器区域，mip-fit-text 会将这块文本做垂直居中处理。本示例将 max-font-size 设置为 10，可以看到文本块垂直居中的效果：

```html
<mip-fit-text
  width="200"
  height="200"
  layout="fixed"
  max-font-size="10"
>
  MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
</mip-fit-text>
```

### 设置 line-height

mip-fit-text 默认的行高为 1.15em，开发者可以通过配置属性 `line-height` 来修改行高。本示例展示了 line-height 设置为 2em 时的效果：

```html
<mip-fit-text
  width="200"
  height="200"
  layout="fixed"
  line-height="2"
>
  MIP（Mobile Instant Pages - 移动网页加速器），是一套应用于移动网页的开放性技术标准。通过提供 MIP-HTML 规范、MIP-JS 运行环境以及 MIP-Cache 页面缓存系统，实现移动网页加速。
</mip-fit-text>
```

## 属性

属性说明

## min-font-size

说明：最小字体大小，单位为 px

必选项：否

类型：`number`

默认值：6

## max-font-size

说明：最大字体大小，单位为 px

必选项：否

类型：`number`

默认值：72

## line-height

说明：文本行高，单位为 em

必选项：否

类型：`number`

默认值：1.15

## 接收事件

无

