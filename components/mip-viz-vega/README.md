# `mip-viz-vega`

基于 vega 的 mip 可视化组件

| 标题     | 内容                                                |
| -------- | --------------------------------------------------- |
| 类型     |  通用                                               |
| 支持布局 | responsive, fixed-height, fixed, container          |
| 所需脚本 | [https://c.mipcdn.com/static/v2/mip-viz-vega/mip-viz-vega.js](https://c.mipcdn.com/static/v2/mip-viz-vega/mip-viz-vega.js) |

## 说明

基于 vega 的 mip 可视化组件，支持通用的纯 JSON 配置的简单图表，mip-viz-vega 采用的是 vega@2.6.1 版本：https://github.com/vega/vega/tree/v5.3.5 [Lisense:BSD](https://github.com/vega/vega/blob/v5.3.5/LICENSE)

## 示例

```html
<h1>Vega 可视化</h1>

<h2>1、响应式大小、从远程获取图表数据</h2>
<mip-viz-vega id="charts-1" width="400" height="200" layout="responsive" src="./bar.json">
</mip-viz-vega>

<h2>2、响应式布局，从本地的 script JSON 中获取数据</h2>
<mip-viz-vega id="charts-2" width="400" height="400" layout="responsive">
  <script type="application/json">
   {
      "$schema": "https://vega.github.io/schema/vega/v5.json",
      "width": 400,
      "height": 400,

      "data": [
        {
          "name": "table",
          "values": [12, 23, 47, 6, 52, 19],
          "transform": [{"type": "pie", "field": "data"}]
        }
      ],

      "scales": [
        {
          "name": "r",
          "type": "sqrt",
          "domain": {"data": "table", "field": "data"},
          "zero": true,
          "range": [20, 100]
        }
      ],

      "marks": [
        {
          "type": "arc",
          "from": {"data": "table"},
          "encode": {
            "enter": {
              "x": {"field": {"group": "width"}, "mult": 0.5},
              "y": {"field": {"group": "height"}, "mult": 0.5},
              "startAngle": {"field": "startAngle"},
              "endAngle": {"field": "endAngle"},
              "innerRadius": {"value": 20},
              "outerRadius": {"scale": "r", "field": "data"},
              "stroke": {"value": "#fff"}
            },
            "update": {
              "fill": {"value": "#ccc"}
            },
            "hover": {
              "fill": {"value": "pink"}
            }
          }
        },

        {
          "type": "text",
          "from": {"data": "table"},
          "encode": {
            "enter": {
              "x": {"field": {"group": "width"}, "mult": 0.5},
              "y": {"field": {"group": "height"}, "mult": 0.5},
              "radius": {"scale": "r", "field": "data", "offset": 8},
              "theta": {"signal": "(datum.startAngle + datum.endAngle)/2"},
              "fill": {"value": "#000"},
              "align": {"value": "center"},
              "baseline": {"value": "middle"},
              "text": {"field": "data"}
            }
          }
        }
      ]
    }
  </script>
</mip-viz-vega>

<h2>3、使用远程数据，并使用指定的图片进行 placeHolder 占位</h2>
<mip-viz-vega id="charts-3" use-data-width height="500" layout="fixed-height" src="./edge-bundling.json">
  <mip-img placeholder height="500" layout="fixed-height" src="https://placehold.it/400x500?text=vega">
  </mip-img>
</mip-viz-vega>

<h2>4、可以指定长宽比的响应式图表，从远程获取数据</h2>
<mip-viz-vega id="charts-4" width="2" height="1.5" layout="responsive" src="./binned-scatter-plot.json">
</mip-viz-vega>

<h2>5、在 lightbox 中响应式展示图表</h2>
<button on="tap:mip-lightbox.toggle">显示图表</button>
<mip-lightbox id="mip-lightbox" layout="nodisplay">
  <mip-viz-vega id="charts-5" width="400" height="400" layout="responsive" src="./sunbrush.json">
  </mip-viz-vega>
</mip-lightbox>
```

## 属性

属性说明

### width

说明：自定义指定的宽度，默认不生效，默认是响应式宽度，需要指定 `use-data-width` 才会生效

必选项：否

类型：`Number`

默认值：viewport 的宽度

### height

说明：自定义指定的高度，默认不生效，默认是响应式高度，需要指定 `use-data-height` 才会生效

必选项：否

类型：`Number`

默认值：viewport 的高度

### padding

说明：指定图表的边缘留白

必选项：否

类型：`Object`

默认值:

```json
{
  "top": 0,
  "bottom": 0,
  "left": 0,
  "right": 0
}
```

### data

图表的数据配置可以参照 [vega 文档](https://vega.github.io/vega/)
