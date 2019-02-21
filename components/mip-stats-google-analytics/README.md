# mip-stats-google-analytics Google Analytics统计

添加GA统计组件，用于统计页面数据。

标题|内容
----|----
类型| 通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/extensions/platform/v2/google-analytics.com/mip-stats-google-analytics/mip-stats-google-analytics.js

## 说明

MIP GA统计组件基于[Google Analytics API](https://developers.google.com/analytics/devguides/collection/analyticsjs/)，请参照 API 将参数配置在 MIP 页。目前事件追踪支持 `click`, `mouseup`, `load`，其它事件暂不支持。


### MIP 组件通过 JSON 数据引入

```html
<mip-stats-google-analytics>
    <script type="application/json">
        [
            ["create", "UA-XXXXX-Y", "auto"],
            ["send", "pageview"]
        ]
    </script>
</mip-stats-google-analytics>

```

### 事件追踪

事件追踪与百度统计提供的定制化方法相同

[warning] `data-stats-ga-obj` 要求配置外层为单引号，内层为双引号。或按照下文 **`data-stats-ga-obj` 双引号配置方法** 处理。

```html
<div data-stats-ga-obj='{"type":"click","data":["send", "event", "foo", "click"]}'>
  点击发送请求
</div>
```

### 事件追踪属性

属性: `data-stats-ga-obj`

#### type

说明：对应的触发事件(load 加载触发/click 点击触发/mouseup 触发)

必填：是

格式：字符串数组

#### data

说明：用于事件追踪数据传递

必填：是

格式：字符串
