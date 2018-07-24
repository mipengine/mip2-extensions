# `mip-confirm`

标题|内容
----|----
类型|
| 支持布局 | responsive, fixed-height, fixed, container                |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-confirm/mip-confirm.js |


## 说明

提示框组件 自定义内容 可配置确认取消按钮（confirm确认框） 和 只有确认按钮（alert提示框）

## 示例
1、弹出框 pattern="alert" 只有确认按钮

```html
<!-- <mip-test id="confirmTest"  on="show:confirm.show"></mip-test>    测试组件，模拟接收和抛出事件 -->
<mip-confirm
  id= "confirm"
  pattern="alert"
  on="ready:confirmTest.print"
  info-title="提示"
  info-text="confirm 类型的弹窗。这里是弹窗的提示信息内容，问题问题问题问题"
>
</mip-confirm>

```
2、弹出框 pattern="confirm" 有确认按钮和取消按钮

```html
<!-- <mip-test id="confirmTest"  on="show:confirm.show"></mip-test>    测试组件，模拟接收和抛出事件 -->
<mip-confirm
  id= "confirm"
  pattern="confirm"
  on="ready:confirmTest.print"
  info-title="提示"
  info-text="confirm 类型的弹窗。这里是弹窗的提示信息内容，问题问题问题问题"
>
</mip-confirm>

```

## 属性

属性说明

### id

说明：组件间通信用到

必选项：否

类型 ：`String`

默认值：""

### pattern

说明：控制是alert方式（提示框）还是confirm方式（确认框），alert只有确认按钮，confirm有取消按钮和确认按钮

必选项：是

类型 ：`String`

默认值："confirm"

### info-title

说明：提示框标题

必选项：否

类型 ：`String`

默认值：""

### info-text

说明：提示框内容

必选项：否

类型 ：`String`

默认值：""




## 接收事件

### show(第二个show)

每次其他组件触发抛出事件后，触发`mip-confirm`的`show`事件，并传当前状态是显示

注意，每次其他组件触发抛出事件后，也可以触发`mip-confirm`的`hidden`事件，并传当前状态是隐藏

## 抛出事件

### ready

每次触发抛事件后，抛出`mip-confirm`的`ready`事件，并传当前状态是 确认（true）还是取消（false），boolean


组件间通信请看文档 https://www.mipengine.org/doc/3-widget/6-help/3-mip-normal.html