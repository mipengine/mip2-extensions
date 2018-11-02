# `mip-viz-echarts`

基于 echarts 的 mip 可视化组件

| 标题     | 内容                                                |
| -------- | --------------------------------------------------- |
| 类型     |  通用                                               |
| 支持布局 | responsive, fixed-height, fixed, container          |
| 所需脚本 | [https://c.mipcdn.com/static/v2/mip-viz-echarts/mip-viz-echarts.js](https://c.mipcdn.com/static/v2/mip-viz-echarts/mip-viz-echarts.js) |

## 说明

基于 echarts 的 mip 可视化组件，支持通用的纯 JSON 配置的简单图表

## 示例

```html
<h1>Echarts 可视化</h1>

<h2>1、响应式大小、从远程获取图表数据</h2>
<mip-viz-echarts id="charts-1" width="400" height="200" layout="responsive" src="./chart-data.json">
</mip-viz-echarts>

<h2>2、响应式布局，从本地的 script JSON 中获取数据</h2>
<mip-viz-echarts id="charts-2" width="400" height="400" layout="responsive">
  <script type="application/json">
    {
      "data": {
        "tooltip": {
          "trigger": "axis",
          "axisPointer": {
            "type": "shadow"
          }
        },
        "legend": {
          "data": [
            "直接访问",
            "邮件营销",
            "联盟广告",
            "视频广告",
            "搜索引擎",
            "百度",
            "谷歌",
            "必应",
            "其他"
          ]
        },
        "grid": {
          "left": "3%",
          "right": "4%",
          "bottom": "3%",
          "containLabel": true
        },
        "xAxis": [
          {
            "type": "category",
            "data": [
              "周一",
              "周二",
              "周三",
              "周四",
              "周五",
              "周六",
              "周日"
            ]
          }
        ],
        "yAxis": [
          {
            "type": "value"
          }
        ],
        "series": [
          {
            "name": "直接访问",
            "type": "bar",
            "data": [
              320,
              332,
              301,
              334,
              390,
              330,
              320
            ]
          },
          {
            "name": "邮件营销",
            "type": "bar",
            "stack": "广告",
            "data": [
              120,
              132,
              101,
              134,
              90,
              230,
              210
            ]
          },
          {
            "name": "联盟广告",
            "type": "bar",
            "stack": "广告",
            "data": [
              220,
              182,
              191,
              234,
              290,
              330,
              310
            ]
          },
          {
            "name": "视频广告",
            "type": "bar",
            "stack": "广告",
            "data": [
              150,
              232,
              201,
              154,
              190,
              330,
              410
            ]
          },
          {
            "name": "搜索引擎",
            "type": "bar",
            "data": [
              862,
              1018,
              964,
              1026,
              1679,
              1600,
              1570
            ],
            "markLine": {
              "lineStyle": {
                "normal": {
                  "type": "dashed"
                }
              },
              "data": [
                [
                  {
                    "type": "min"
                  },
                  {
                    "type": "max"
                  }
                ]
              ]
            }
          },
          {
            "name": "百度",
            "type": "bar",
            "barWidth": 5,
            "stack": "搜索引擎",
            "data": [
              620,
              732,
              701,
              734,
              1090,
              1130,
              1120
            ]
          },
          {
            "name": "谷歌",
            "type": "bar",
            "stack": "搜索引擎",
            "data": [
              120,
              132,
              101,
              134,
              290,
              230,
              220
            ]
          },
          {
            "name": "必应",
            "type": "bar",
            "stack": "搜索引擎",
            "data": [
              60,
              72,
              71,
              74,
              190,
              130,
              110
            ]
          },
          {
            "name": "其他",
            "type": "bar",
            "stack": "搜索引擎",
            "data": [
              62,
              82,
              91,
              84,
              109,
              110,
              120
            ]
          }
        ]
      }
    }
  </script>
</mip-viz-echarts>

<h2>3、固定高度大小的饼图，使用远程数据，并使用指定的图片进行 placeHolder 占位</h2>
<mip-viz-echarts id="charts-3" use-data-width height="500" layout="fixed-height" src="./pie-data.json">
  <mip-img placeholder height="500" layout="fixed-height" src="https://placehold.it/400x200?text=echarts">
  </mip-img>
</mip-viz-echarts>

<h2>4、可以指定长宽比的响应式图表，从远程获取数据</h2>
<mip-viz-echarts id="charts-4" width="2" height="1.5" layout="responsive" src="./chart-data.json">
</mip-viz-echarts>

<h2>5、在 lightbox 中响应式展示图表</h2>
<button on="tap:mip-lightbox.toggle">显示图表</button>
<mip-lightbox id="mip-lightbox" layout="nodisplay">
  <mip-viz-echarts id="charts-5" width="400" height="400" layout="responsive" src="./chart-data.json">
  </mip-viz-echarts>
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

图表的数据，参照 [echarts 文档](http://echarts.baidu.com/examples/)
