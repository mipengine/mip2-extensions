# `mip-toast`
弹出框（只有文字 文字和图标 位置上 中 下）

标题|内容
----|----
类型|
| 支持布局 | responsive, fixed-height, fixed, container                |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-toast/mip-toast.js |


## 说明

提示框组件 自定义内容 可配置确认取消按钮（confirm确认框） 和 只有确认按钮（alert提示框）

## 示例

1、弹出框 只弹出文字（不传 info-icon-src）

```html
<!-- <mip-test id="confirmTest"  on="show:confirm.show"></mip-test>    测试组件，模拟接收和抛出事件 -->
<mip-toast
  id= "demo"
  info-text="最多七个中文字"
  station = "top"
  auto-close = "true"
>
</mip-toast>

```
2、弹出框 弹出带图和文字

```html
<!-- <mip-test id="confirmTest"  on="show:confirm.show"></mip-test>    测试组件，模拟接收和抛出事件 -->
<mip-toast
  id= "demo"
  info-icon-src="https://www.mipengine.org/static/img/sample_mip_logo.png"
  info-text="最多七个中文字"
  station = "top"
  auto-close = "true"
>
</mip-toast>

```

## 属性

属性说明

### id

说明：组件间通信用到

必选项：否

类型 ：`String`

默认值：""

### info-icon-src

说明：配置图片或gif的src，没有传或不写这个属性只显示文字

必选项：否

类型 ：`String`

默认值：""


### info-text

说明：提示框内容

必选项：是

类型 ：`String`

默认值：""

### station

说明：提示框所在位置，可选 top  center bottom

必选项：否

类型 ：`String`

默认值："center"


## 接收事件

### show(第二个show)

每次其他组件触发抛出事件后，触发`mip-toast`的`show`事件，并传当前状态是显示

注意，每次其他组件触发抛出事件后，也可以触发`mip-toast`的`hidden`事件，并传当前状态是隐藏


组件间通信请看文档 https://www.mipengine.org/doc/3-widget/6-help/3-mip-normal.html
