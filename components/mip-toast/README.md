# `mip-toast`

弹出框（只有文字 文字和图标 位置上 中 下）

| 标题     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 类型     |
| 支持布局 | responsive, fixed-height, fixed, container            |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-toast/mip-toast.js |

## 说明

提示框组件 自定义内容

## 示例

1、弹出框 只弹出文字（不传 info-icon-src）

```html
<!-- mip-test 作为测试组件，模拟接收和抛出事件 -->
<mip-test on="show:demo.show"></mip-test>
<!-- mip-test 作为测试组件，模拟接收和抛出事件 -->

<mip-toast
  id= "demo"
  info-text="默认提示框"
  station = "top"
  auto-close = "true"
>
</mip-toast>
  <!--  测试组件，模拟接收和抛出事件 -->
  <script src="https://caoru828.github.io/my_json/mip-test/mip-test.js"></script>
  <!-- 测试组件，模拟接收和抛出事件 -->
```

2、弹出框 弹出带图和文字

```html
<!-- mip-test 作为测试组件，模拟接收和抛出事件 -->
<mip-test on="show:demo.show"></mip-test>
<!-- mip-test 作为测试组件，模拟接收和抛出事件 -->
<mip-toast
  id= "demo"
  info-icon-src="https://www.mipengine.org/static/img/sample_mip_logo.png"
  info-text="最多七个中文字"
  station = "top"
  auto-close = "true"
>
</mip-toast>
<!-- 测试组件，模拟接收和抛出事件 -->
  <script src="https://caoru828.github.io/my_json/mip-test/mip-test.js"></script>
<!-- 测试组件，模拟接收和抛出事件 -->
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

说明：提示框所在位置，可选 top center bottom

必选项：否

类型 ：`String`

默认值："center"

### auto-close

说明：是否自动关闭

必选项：否

类型 ：`Boolean`

默认值：true

### close-time

说明：关闭事件

必选项：否

类型 ：`Number`

默认值：2.5

## 向 toast 组件抛出事件

抛出事件 show 或 hidden 事件 eg: this.$emit('show') eg: this.$emit('hidden')

静态传参数：直接在 toast 组件里 info-text 后边加字符串 eg: this.$emit('show')

动态传参数：抛出 show 事件可以传参数，传的参数就是想要显示的参数 eg: this.$emit('show', showString)

[详情 demo 请看](https://caoru828.github.io/my_json/mip-test-demo/)

## 接收事件

### show(第二个show)

每次其他组件触发抛出事件后，触发`mip-toast`的`show`事件，并传当前状态是显示

注意，每次其他组件触发抛出事件后，也可以触发`mip-toast`的`hidden`事件，并传当前状态是隐藏

组件间通信请看文档 https://www.mipengine.org/doc/3-widget/6-help/3-mip-normal.html
