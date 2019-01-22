# mip-anim 动图

用来支持在 MIP 页中 GIF 图的使用。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fixed, container
所需脚本|https://c.mipcdn.com/static/v2/mip-anim/mip-anim.js

## 示例

### 带 `placeholder` 的加载方式

```html
<mip-anim layout="fixed" width=210 height=210 src="http://boscdn.bpc.baidu.com/v1/assets/mipengine/sample.gif" alt="an animation">
   <mip-img class="background" layout="fixed-height" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>
</mip-anim>
```

### 只有 GIF 图

```html
<mip-anim layout="fixed" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/sample.gif" alt="an animation"></mip-anim>
```

### 没传 GIF 图，只显示默认图

```html
<mip-anim layout="fixed" width=210 height=210  alt="an animation">
   <mip-img class="background" layout="fixed-height" width=210 height=210 src="http://boscdn.baidu.com/v1/assets/mipengine/logo.jpeg"></mip-img>
</mip-anim>
```

## 属性

### src

说明：图片路径

必选项：是

类型：字符串

取值范围：URL
