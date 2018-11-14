# `mip-3d-gltf`

标题|内容
----|----
类型|
支持布局|
所需脚本| [https://c.mipcdn.com/static/v2/mip-3d-gltf/mip-3d-gltf.js](https://c.mipcdn.com/static/v2/mip-3d-gltf/mip-3d-gltf.js)

## 说明

gltf格式的3D模型展示组件

## 示例

```html
    <h1>glTF格式3D模型展示</h1>

    <h2>1、通过src远程获取模型</h2>
    <mip-3d-gltf
      layout="responsive"
      width="250"
      height="450"
      src="https://ampbyexample.com/glTF/DamagedHelmet.glb">
    </mip-3d-gltf>

    <h2>2、可以指定可用空间透明度、抗锯齿、背景颜色、设备像素比、缩放和自动旋转</h2>
    <mip-3d-gltf
      layout="responsive"
      width="250"
      height="450"
      alpha="true"
      maxPixelRatio="0.5"
      clear-color="#FFFFFF"
      antialiasing="true"
      enable-zoom="false"
      auto-rotate="true"
      src="https://ampbyexample.com/glTF/DamagedHelmet.glb">
    </mip-3d-gltf>

## 属性

属性说明

### width

说明：自定义指定的宽度

必选项：否

类型：`Number`

默认值：窗口的宽度

### height

说明：自定义指定的高度

必选项：否

类型：`Number`

默认值：窗口的高度

### src

说明：数据模型的URL

必选项：是

类型：`String`

### alpha

说明：自由空间是否透明

必选项：否

类型：`Boolean`

默认值：false

### maxPixelRatio

说明：最大设备像素比

必选项：否

类型：`Number`

默认值：window.devicePixelRatio

### clear-color

说明：自由空间颜色，需要是有效的CSS color

必选项：否

类型：`String`

默认值：#FFFFFF

### antialiasing

说明：是否开启抗锯齿

必选项：否

类型：`Boolean`

默认值：false

### enable-zoom

说明：是否可以缩放

必选项：否

类型：`Boolean`

默认值：true

### auto-rotate

说明：是否自动旋转

必选项：否

类型：`Boolean`

默认值：false