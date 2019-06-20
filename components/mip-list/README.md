# mip-list 列表组件

可以渲染同步数据，或者异步请求数据后渲染。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|<https://c.mipcdn.com/static/v2/mip-list/mip-list.js></br><https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js>

mip-list 是一个前端渲染的列表组件，开发者可以使用这个组件定义好列表数据源和列表的渲染模板，这样就能够在 MIP 页面加载的时候再去请求数据并渲染出列表。

其中数据源分为同步数据和异步数据两种，异步数据要求对应的后端接口需要改造成 JSONP 接口，对 JSONP 不太了解的开发者可以首先查阅相关文档简单地进行了解。数据的格式会在下面基本用法介绍当中给出。

渲染列表的模板需要在 `<mip-list>` 标签对当中添加 `<template type="mustache">` 标签定义 mustache 模板，因此在使用 mip-list 时还需要额外引入 mip-mustache 的 JS。对 mustache 不太了解的同学可以先去学习一下 mustache 的模板语法。需要注意的是，定义的模板同样也需要遵循
MIP-HTML 规范，不允许使用规范之外的标签和属性。

## 示例

### 基本用法

可以在 mip-list 标签上添加属性 `src` 指定异步数据源的后端地址。但需要注意的是，为了能够让 mip-list 成功拿到数据，需要将后端数据接口改造为 JSONP 接口。再改造后端数据接口的时候需要遵循规范 `callback` 应为 `'callback'`，多个引号。

接口返回的数据格式需要是如下格式：

- status：0 表示请求成功。
- items：[] 是需要渲染的数序。
- isEnd：表示是否是最后一页，非必须。

```
{
  status: 0,
  data: {
    items: [],
    isEnd: 1
  }
}
```

<!-- > JSONP 异步请求的接口需要遵循规范 `callback` 为 `'callback'`。 -->

```html
<mip-list src="https://bos.nj.bpc.baidu.com/v1/assets/mip2/components/mip-list/examples/data.js" preload>
  <template type="mip-mustache">
    <div>
      <li>name: {{ name }}</li>
      <li>alias: {{ alias }}</li>
    </div>
  </template>
</mip-list>
```

### 定制模板

有时列表模板可能存在公用的情况，这时这些列表的渲染模板可以定义再标签对外面并且定义好 id，这样就可以在 mip-list 标签对上添加属性 template="[id]" 引入这个模板：

```html
<mip-list
  template="mip-template-id1"
  src="https://bos.nj.bpc.baidu.com/v1/assets/mip2/components/mip-list/examples/data.js"
  preload
>
  <template type="mip-mustache" id="mip-template-id1">
    <div>
      <li>name: {{ name }}</li>
      <li>alias: {{ alias }}</li>
    </div>
  </template>
</mip-list>
```

### 同步数据

mip-list 的数据源也可以通过同步的方式直接出来，只需要在 mip-list 标签上添加属性 `synchronous-data`，同时在标签对内部添加 script 标签定义相应 JSON 数据即可，数据的格式与异步数据的 data 字段相同：

```html
<script type="application/json">
  {
    "items": [
      // 相关列表项数据
    ]
  }
</script>
```

```html
<mip-list synchronous-data>
  <script type="application/json">
    {
      "items": [{
        "name": "lee",
        "alias": "xialong"
      }, {
        "name": "ruige",
        "alias": "ruimm"
      }, {
        "name": "langbo",
        "alias": "bobo"
      }]
    }
  </script>
  <template type="mip-mustache">
    <div>
      <li>name: {{ name }}</li>
      <li>alias: {{ alias }}</li>
    </div>
  </template>
</mip-list>
```

### 点击加载更多

有 `has-more` 属性时，`<mip-list>` 标签必须要有 `id` 属性，同时需要有点击按钮的 DOM 节点，并且此节点有 `on` 属性，属性值为：`tap:对应mip-list的id.more`

```html
<mip-list
  template="mip-template-id2"
  src="https://bos.nj.bpc.baidu.com/v1/assets/mip2/components/mip-list/examples/data-has-more.js"
  id="mip-list"
  has-more
  pn-name="pageNum"
  pn="2"
  timeout="3000"
  preload
>
  <template type="mip-mustache" id="mip-template-id2">
    <div>
      <li>name: {{ name }}</li>
    </div>
  </template>
</mip-list>
<button on="tap:mip-list.more">点击查看更多</button>
```

## 属性

### src

说明：异步请求的数据接口，如果没有其他参数结尾请不要带 `？`

必选项：否

类型：字符串

取值范围：必须是 HTTPS 的

单位：无

默认值：无

### synchronous-data

说明：使用同步数据开关属性

必选项：否

类型：字符串

取值范围：无

单位：无

默认值：无

### id

说明：`<mip-list>` 组件 `id`

必选项：否

类型：字符串

取值范围：字符串

单位：无

默认值：无

### has-more

说明：是否有点击展开更多功能

必选项：否

类型：字符串

取值范围：无

单位：无

默认值：无

### pn-name

说明：翻页变量名

必选项：否

类型：字符串

取值范围：无

单位：无

默认值：pn

### pn

说明：翻页初始页码，每次请求会自动加 1

必选项：否

类型：整数

取值范围：无

单位：无

默认值：1

### preload

说明：异步加载数据，如果添加 `preload` 参数，则在初始化时加载第一页内容

必选项：否

### timeout

说明：fetch-jsonp 请求的超时时间

必选项：否

类型：整数

取值范围：无

单位：ms

默认值：5000

## 注意事项

