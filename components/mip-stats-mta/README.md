# mip-stats-mta 腾讯移动分析 mta

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|[https://c.mipcdn.com/static/v2/mip-stats-mta/mip-stats-mta.js](https://c.mipcdn.com/static/v2/mip-stats-mta/mip-stats-mta.js)

## 说明

MIP 腾讯移动分析mta组件基于[腾讯移动分析 H5分析接入](https://mta.qq.com/docs/h5_advance_access.html)，请参照 API 将参数配置在 MIP 页。目前事件追踪支持 `click`, `mouseup`, 其它事件暂不支持。

## 示例

MIP 提供腾讯移动分析的插件，提供实时数据统计分析服务，需要提前到腾讯移动分析平台 [https://mta.qq.com] 注册账户，之后创建HTML5应用，最终生成 JS SDK 代码，根据代码生成的参数，填入 MIP 组件。

注意：刚注册完毕有20分钟内上报可能会出现502，是注册应用未同步的原因，属正常情况
如果上报成功，在浏览器的 network 中有发起 pingtcss.qq.com 或者 pingtas.qq.com 的请求，并且状态码为200

### MIP 组件通过 JSON 数据引入：

```html
<mip-stats-mta>
  <script type="application/json">
    {
      "version": "v2.0.4",
      "name": "MTAH5",
      "sid": "500671073",
      "cid": "500671075",
    }
  </script>
</mip-stats-mta>
```

### 事件追踪：

通过在页面元素中加上H5点击上报代码，来统计事件的点击次数。

```html
<button data-stats-mta='{"type":"click","data":["test666666", {"pramaid":"2asjue1323"}]}'>click me!</button>
```

## 属性

### version

**说明**：mta 版本号，以官方提供的为准，默认为'v2.0.4'

**必填**：是

**格式**：字符串

### name

**说明**：mta 管理后台自动生成代码中的参数 name

**必填**：是

**格式**：字符串

### sid

**说明**：mta 管理后台自动生成代码中的参数 sid

**必填**：是

**格式**：字符串

### cid

**说明**：mta 管理后台自动生成代码中的参数 cid

**必填**：是

**格式**：字符串

### 事件追逐属性：

**属性**：`data-stats-mta`

#### type

**说明**：对应的触发事件(click 点击触发)

**必填**：是

**格式**：字符串

#### data

**说明**：用于自定义采集数据配置参数。数组第一个参数表示，事件列表中添加的事件ID，ID需要先在MTA前台配置好才能生效。数组第二个参数表示，事件参数，参数需要先在MTA前台配置好才能生效。

**必填**：是

**格式**：字符串数组

#### data-stats-mta 双引号配置方法

`data-stats-mta` 值必须 `encodeURIComponent` 处理, 方法如下：

```js
// 理想配置
{"type":"click","data":["test", {paramid:"true"}]}

// 处理配置方法
encodeURIComponent(JSON.stringify({"type":"click","data":["test", {paramid:"true"}]}))
```

```html
<!-- 最终DOM配置效果 -->
<div data-stats-mta="%7B%22type%22%3A%22click%22%2C%22data%22%3A%5B%22test%22%2C%7B%22paramid%22%3A%22true%22%7D%5D%7D"></div>
```
