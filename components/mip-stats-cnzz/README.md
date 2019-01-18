# mip-stats-cnzz

mip-stats-cnzz 用于友盟（CNZZ）统计投放。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-stats-cnzz/mip-stats-cnzz.js

## 示例

```html
<mip-stats-cnzz nodes="4,6,7,8,10" token="2423211" setconfig="%5B_setAutoPageview%2C%20true%5D"></mip-stats-cnzz>
```

## 属性

### token

说明：token 为站长的站点在友盟 [CNZZ](http://open.cnzz.com) 上接入申请的唯一 ID。

必选项：是

类型：`string`

默认值：无

### nodes

说明：CNZZ 组件中，官方提供的是 s11 节点，但如果该节点不能满足需求时，开发者可以通过 nodes 参数自行配置节点，以节点号书写，多个节点之间通过逗号分隔，如 `1,2,3,4`，统计时将随机选择配置的节点。

必选项：否

类型：`string`

默认值：11

### setconfig

说明：setconfig 用于一些全局变量的配置，如 `[_setAutoPageview, true]`，具体参照 [CNZZ API 列表](http://open.cnzz.com/a/api/apilist/)。

必选项：否

类型：`string`

默认值：''

## CNZZ 统计事件追踪

如果期望能够对统计事件进行追踪，可以通过以下方式进行设置：

- 书写 mip-stats-cnzz 组件

`<mip-stats-cnzz token="2423211" setconfig="全局配置"></mip-stats-bidu>`

- 触发事件追踪的 dom

`<div data-stats-cnzz-obj='{"type":"click","data":["_trackPageview", "/virtual/login"]}'>`

data-stats-cnzz-obj 配置属性格式为 `{"type":"触发机制(click点击触发/load为页面加载自动触发)","data":["_trackPageview", "/virtual/login"]}`，其中 **setconfig 与 data-stats-cnzz-obj 均需要 encodeURIComponent 转码后传入**。
