# mip-anim 动图

运行时管理的动图，一般是 GIF

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fixed, container
所需脚本|https://c.mipcdn.com/static/v2/mip-anim/mip-anim.js

`mip-anim` 与 `mip-img` 几乎完全相同，但是当组件在视窗之外时可以通过 MIP Runtime 减少 CPU 的使用。`mip-anim` 接受具有 `placeholder` 属性的子元素，当 `src` 资源在加载时会显示 `placeholder`：

```html
<mip-anim width=400 height=300 src="my-gif.gif">
  <mip-img placeholder width=400 height=300 src="http://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg">
  </mip-img>
</mip-anim>
```

在将来，可能会添加动画播放控制等功能。

## 示例

### 带 `placeholder` 的加载方式

```html
<mip-anim layout="fixed" width=210 height=210 src="http://boscdn.bpc.baidu.com/v1/assets/mipengine/sample.gif" alt="an animation">
   <mip-img placeholder class="background" layout="fixed-height" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>
</mip-anim>
```

### 只有 GIF 图

```html
<mip-anim layout="fixed" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/sample.gif" alt="an animation"></mip-anim>
```

### 不指定 URL

```html
<mip-anim layout="fixed" width=210 height=210  alt="an animation">
   <mip-img placeholder class="background" layout="fixed-height" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>
</mip-anim>
```

## 属性

### src

与 `img` 标签的 `src` 属性相似。其值必须是指向可公开缓存图像文件的 URL。MIP-Cache 可能会对 `src` 进行改写，使其指向缓存版本。

### srcset

与 `img` 标签的 `srcset` 属性相同。

### alt

图像的替代文本，与 `img` 标签的 `alt` 属性相同。

### attribution

表明图像来源的文本。

### height 和 width

显示指明图像大小，让 MIP Runtime 无需加载资源就能够决定图像的宽高比。

### 常见属性

MIP 组件共有的扩展属性，如 `on`、`sizes` 等。

## 样式

可以直接通过 CSS 设定 `mip-anim` 的样式。例如，设置一个背景颜色为灰色的占位符：

```css
mip-anim {
   background-color: grey;
}
```