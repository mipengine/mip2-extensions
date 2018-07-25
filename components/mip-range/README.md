# `mip-range`

通过拖动滑块在一个固定区间内进行选择

| 标题     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 类型     | 通用                                                    |
| 支持布局 | N/A                                                     |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-range/mip-range.js |

## 说明

通过拖动滑块在一个固定区间内进行选择，支持自定义样式、自定义步长、单值、范围值、固定范围

## 示例

```html
<!-- 单值、横向、上方显示、范围0-200、 步长1、预设值60、拖动显示tip -->

<mip-range class="her" id="slider1" on="dragging:test.changeSpacing dragStart:test.changeSpacing">
  <script type="application/json">
    {
      range: 60,
      height: 6,
      dotSize: 16,
      min: 0,
      max: 200,
      step: 1,
      tipShow: "dragging",
      tipFormat: "价格：{{tip}}元"
    }
  </script>
</mip-range>
<button on="click:slider1.setVal([130])">设置值为130</button>
<button on="click:slider1.valReduce(5)">减小5</button>
<button on="click:slider1.valIncrease(5)">增加5</button>
```

```html
<!-- 范围值、横向、下方显示、范围0-100、步长5、预设20-60-->

<mip-range class="her" id="slider2">
  <script type="application/json">
    {
      range: [20, 60],
      height: 6,
      dotSize: 16,
      min: 0,
      max: 100,
      step: 5,
      tipDir: "bottom"
    }
  </script>
</mip-range>
<button on="click:slider2.setVal([10,80])">设置值为10-80</button>
```

```html
<!-- 范围值、纵向、左方显示、范围0-100、步长3、预设20-80、自定义颜色 -->

<mip-range class="ver">
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
</mip-range>
```

示例说明

## 属性

### width

说明：slider 的宽度

必选项：否

类型：`{ Number | String }`

默认值：`auto`

### height

说明：slider 的高度

必选项：否

类型：`{ Number | String }`

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

### tipShow

说明：tip的现实时机

必选项：否

类型：`String`

取值范围：`{ always | dragging | change | none }`
  - `always`: 始终显示tip
  - `dragging`: 拖动的时候显示
  - `change`: 数据发生变化的时候显示
  - `none`: 始终不显示tip

默认值：`always`

### tipFormat

说明：tip显示的模板 如`价格: {{tip}}`

必选项：否

类型：`String`

默认值：``

### tipExist

说明：tip显示隐藏的过渡时间，单位`ms`

必选项：否

类型：`{ String | Number }`

默认值：`300`

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

类型：`{ Number | String | Array }`

默认值：`0`

### tipDir

说明：tip 的方向，支持

必选项：否

类型：`String`

取值范围：`{ top | bottom | left | right }`

默认值：`空`

### dotStyle

说明：控制柄的样式

必选项：否

类型：`{ Array | Object }`

默认值：`null`

### processStyle

说明：进度条的样式

必选项：否

类型：`{ Array | Object }`

默认值：`null`

### barStyle

说明：slider 整体样式

必选项：否

类型：`{ Array | Object }`

默认值：`null`

## 事件

### dragStart

开始拖拽时触发，返回当前值(如：`[10,20]`)

### dragging

值正在变化中，返回当前值(如：`[10,20]`)

### dragEnd

结束拖拽时触发，返回当前值(如：`[10,20]`)

## 方法

### setVal(val) 设置

- **参数**

  - `{Array} val` 设置值

- **用法**
将值设置为`10-30`=>`ID.setVal([10,30])`

### getVal()

- **用法**
获取当前值 =>`ID.getVal`

### valIncrease(num)

- **参数**

  - `{Number} num` 设置值 默认当前步长

- **用法**
将值增加5=>`ID.valIncrease(5)`

### valReduce(num)

- **参数**

  - `{Number} num` 设置值 默认当前步长

- **用法**
将值减少5=>`ID.valReduce(5)`
