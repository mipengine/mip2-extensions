# `mip-slider`

通过拖动滑块在一个固定区间内进行选择

| 标题     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 类型     | 通用                                                    |
| 支持布局 | N/A                                                     |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-slider/mip-slider.js |

## 说明

通过拖动滑块在一个固定区间内进行选择，支持自定义样式、自定义步长、单值、范围值、固定范围

## 示例

```html
<!-- 单值、横向、上方显示、范围0-200、步长1、预设值60  -->

<mip-slider>
  <script type="application/json">
    {
      range: 60,
      height: 6,
      dotSize: 16,
      min: 0,
      max: 200,
      step: 1
    }
  </script>
</mip-slider>
```

```html
<!-- 范围值、横向、下方显示、范围0-100、步长5、预设20-60、支持固定范围拖动 -->

<mip-slider>
  <script type="application/json">
    {
      range: [20, 60],
      height: 6,
      dotSize: 16,
      min: 0,
      max: 100,
      step: 5,
      tipDir: "bottom",
      fixRange: true
    }
  </script>
</mip-slider>
```

```html
<!-- 范围值、纵向、左方显示、范围0-100、步长3、预设20-80、自定义颜色 -->

<mip-slider>
  <script type="application/json">
    {
      range: [20, 80],
      width: 6,
      height: 300,
      dotSize: 24,
      direction: "vertical",
      min: 0,
      max: 100,
      step: 3,
      dotStyle: {
        "background": "url('https://cambrian-images.cdn.bcebos.com/580ce3eeaa75ee03a916db594e47ae4e_1516170693203.jpeg') center center no-repeat",
        "background-size": "100%"
      },
      barStyle: {
        "background": "#f3f3f3",
        "box-shadow": "inset 0 1px 2px rgba(0,0,0,.1)"
      },
      processStyle: {
        "background-image": "-webkit-linear-gradient(top, rgb(240, 91, 114), rgb(52, 152, 219))"
      }
    }
  </script>
<mip-slider>
```

示例说明

## 属性

### width

说明：slider 的宽度

必选项：否

类型：`Number`、`String`

默认值：`auto`

### height

说明：slider 的高度

必选项：否

类型：`Number`、`String`

默认值：`auto`

### dotSize

说明：slider 控制柄的尺寸

必选项：否

类型：`Number`

默认值：`16`

### min

说明：slider 的最小值

必选项：否

类型：`Number`

默认值：`0`

### max

说明：slider 的最大值

必选项：否

类型：`Number`

默认值：`100`

### step

说明：slider 的步长

必选项：否

类型：`Number`

默认值：`1`

### disabled

说明：slider 是否禁用

必选项：否

类型：`Boolean`

默认值：`false`

### direction

说明：slider 方向 支持横向、纵向

必选项：否

类型：`String`

默认值：`horizontal`

### clickable

说明：slider 是否支持点选

必选项：否

类型：`Boolean`

默认值：`true`

### range

说明：slider 的取值范围

必选项：否

类型：`Number`、`String`、`Array`

默认值：`0`

### fixRange

说明：是否支持固定区间，如果支持，则可拖拽进度条

必选项：否

类型：`Boolean`

默认值：`false`

### tipDir

说明：tip 的方向，支持

必选项：否

类型：`String`

取值范围：`top`、`bottom`、`left`、`right`

默认值：`空`

### dotStyle

说明：控制柄的样式

必选项：否

类型：`Array`、`Object`

默认值：`null`

### processStyle

说明：进度条的样式

必选项：否

类型：`Array`、`Object`

默认值：`null`

### barStyle

说明：slider 整体样式

必选项：否

类型：`Array`、`Object`

默认值：`null`

## 事件

### dragStart

开始拖拽时触发，返回当前值(如：`[10,20]`)

### dragging

值正在变化中，返回当前值(如：`[10,20]`)

### dragEnd

结束拖拽时触发，返回当前值(如：`[10,20]`)

## 方法

### setVal(val)

- **参数**

  - `{Array} val` 设置值

- **用法**
将值设置为`10-30`=>`ID.setVal([10,30])`
