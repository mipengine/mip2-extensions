[# mip-stats-mta

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|[https://c.mipcdn.com/static/v2/mip-stats-mta/mip-stats-mta.js](https://c.mipcdn.com/static/v2/mip-stats-mta/mip-stats-mta.js)

## 说明

组件功能说明

## 示例

示例说明

```
// 代码示例
```

## 属性

### 属性1

**说明**：

**必选项**：

**单位**：

**默认值**：
](# mip-stats-mta

mip-stats-mta 组件说明
腾讯移动分析 mta，参考完整文档[点击这里](https://mta.qq.com/docs/h5_advance_access.html)。  
目前事件追踪支持 `click`, `mouseup`，其它事件暂不支持。  

标题|内容
----|----
类型|通用
所需脚本|https://c.mipcdn.com/static/v1/mip-stats-mta/mip-stats-mta.js

## 示例

### 1. 基本用法，引入SDK
```html

<mip-stats-mta setconfig=""></mip-stats-mta>

```

其中的setconfig的值，encodeURIComponent(JSON.stringify(以下mta sdk的配置)) 以下是mta jssdk的配置项参考  
```javascript
{
  mta_url: '//pingjs.qq.com/h5/stats.js?v2.0.4',
  sid:'76777123',
  cid: '65551233',
  name: 'MTAH5'
}
```

### 2. 自定义事件

可以通过 click mouseup 方式来触发点击上报代码，来统计事件的点击次数。

这是需要配置的值
```
var para = {"type":"click","data":["test", {paramid:"true"}]}
```
#### type

说明：对应的触发事件(click 点击触发/mouseup 触发)  
必填：是  
格式：字符串数组  

#### data

说明：用于自定义采集数据  
必填：是  
格式：字符串

### 注意
第一个参数表示，事件列表中添加的事件ID，ID需要先在MTA前台配置好才能生效。
第二个参数表示，事件参数，参数需要先在MTA前台配置好才能生效。


## 实际案例方法

```html
// 这个代码必须放在首屏，不然不会触发
<mip-stats-mta setconfig=""></mip-stats-mta>


<div data-stats-mta=""></div>

```
其中第一行表示 sdk 的配置     
参数设置如：setconfig='{"mta_url":"//pingjs.qq.com/h5/stats.js?v2.0.4","name":"MTAH5","sid":"500669569a","cid":"500669581a"}'

第二行表示在 click 后执行 MtaH5.clickStat('test',{paramid:'true'})
参数设置如：data-stats-mta='{"type":"click","data":["test", {"pramaid":"true"}]}'
)