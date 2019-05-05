# `mip-viz-vega`

基于 vega 的 mip 可视化组件

| 标题     | 内容                                                |
| -------- | --------------------------------------------------- |
| 类型     |  通用                                               |
| 支持布局 | responsive, fixed-height, fixed, container          |
| 所需脚本 | [https://c.mipcdn.com/static/v2/mip-viz-vega/mip-viz-vega.js](https://c.mipcdn.com/static/v2/mip-viz-vega/mip-viz-vega.js) |

## 说明

基于 vega 的 mip 可视化组件，支持通用的纯 JSON 配置的简单图表，mip-viz-vega 采用的是 vega@2.6.1 版本：https://github.com/vega/vega/tree/v2.6.1 [Lisense:BSD](https://github.com/vega/vega/blob/v2.6.1/LICENSE)

## 示例

```html
<h1>Vega 可视化</h1>

<h2>1、响应式大小、从远程获取图表数据</h2>
<mip-viz-vega id="charts-1" width="400" height="200" layout="responsive" src="./chart-data.json">
</mip-viz-vega>

<h2>2、响应式布局，从本地的 script JSON 中获取数据</h2>
<mip-viz-vega id="charts-2" width="400" height="400" layout="responsive">
  <script type="application/json">
   {
      "width": 500,
      "height": 200,
      "padding": 20,
      "data": [
        {
          "name": "table",
          "values": [
            {"x": 0, "y": 28, "c":0}, {"x": 0, "y": 55, "c":1},
            {"x": 1, "y": 43, "c":0}, {"x": 1, "y": 91, "c":1},
            {"x": 2, "y": 81, "c":0}, {"x": 2, "y": 53, "c":1},
            {"x": 3, "y": 19, "c":0}, {"x": 3, "y": 87, "c":1},
            {"x": 4, "y": 52, "c":0}, {"x": 4, "y": 48, "c":1},
            {"x": 5, "y": 24, "c":0}, {"x": 5, "y": 49, "c":1},
            {"x": 6, "y": 87, "c":0}, {"x": 6, "y": 66, "c":1},
            {"x": 7, "y": 17, "c":0}, {"x": 7, "y": 27, "c":1},
            {"x": 8, "y": 68, "c":0}, {"x": 8, "y": 16, "c":1},
            {"x": 9, "y": 49, "c":0}, {"x": 9, "y": 15, "c":1}
          ],
          "transform": [
            {
              "type": "stack",
              "groupby": ["x"],
              "sort": {"field": "c"},
              "field": "y"
            }
          ]
        }
      ],
      "scales": [
        {
          "name": "x",
          "type": "band",
          "range": "width",
          "domain": {"data": "table", "field": "x"}
        },
        {
          "name": "y",
          "type": "linear",
          "range": "height",
          "nice": true, "zero": true,
          "domain": {"data": "table", "field": "y1"}
        },
        {
          "name": "color",
          "type": "ordinal",
          "range": "category",
          "domain": {"data": "table", "field": "c"}
        }
      ],
      "axes": [
        {"orient": "bottom", "scale": "x", "zindex": 1},
        {"orient": "left", "scale": "y", "zindex": 1}
      ],
      "marks": [
        {
          "type": "rect",
          "from": {"data": "table"},
          "encode": {
            "enter": {
              "x": {"scale": "x", "field": "x"},
              "width": {"scale": "x", "band": 1, "offset": -1},
              "y": {"scale": "y", "field": "y0"},
              "y2": {"scale": "y", "field": "y1"},
              "fill": {"scale": "color", "field": "c"}
            },
            "update": {
              "fillOpacity": {"value": 1}
            },
            "hover": {
              "fillOpacity": {"value": 0.5}
            }
          }
        }
      ]
    }
  </script>
</mip-viz-vega>

<h2>3、固定高度大小的饼图，使用远程数据，并使用指定的图片进行 placeHolder 占位</h2>
<mip-viz-vega id="charts-3" use-data-width height="500" layout="fixed-height" src="./pie-data.json">
  <mip-img placeholder height="500" layout="fixed-height" src="https://placehold.it/400x500?text=vega">
  </mip-img>
</mip-viz-vega>

<h2>4、可以指定长宽比的响应式图表，从远程获取数据</h2>
<mip-viz-vega id="charts-4" width="2" height="1.5" layout="responsive" src="./chart-data.json">
</mip-viz-vega>

<h2>5、在 lightbox 中响应式展示图表</h2>
<button on="tap:mip-lightbox.toggle">显示图表</button>
<mip-lightbox id="mip-lightbox" layout="nodisplay">
  <mip-viz-vega id="charts-5" width="400" height="400" layout="responsive" src="./chart-data.json">
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

图表的数据，参照 [vega 文档](https://vega.github.io/vega/)
