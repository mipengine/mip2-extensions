# mip-list 列表组件

可以渲染同步数据，或者异步请求数据后渲染出列表。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js<br>https://c.mipcdn.com/static/v2/mip-list/mip-list.js

mip-list 是一个前端渲染的列表组件，开发者需要定义好列表项的 [mustache 模板](https://www.mipengine.org/v2/components/dynamic-content/mip-mustache.html)，mip-list 就可以根据配置的数据源渲染出列表，同时还具有**分页加载**、列表刷新等功能，配合上 MIP 的[数据驱动机制](https://www.mipengine.org/v2/docs/interactive-mip/data-driven-and-dom-render.html)，还能够发挥出更大的作用。

## 模板定义与渲染结果

mip-list 使用 mip-mustache 来定义列表项的渲染模板，可使用具名和匿名两种方式来定义模板。

（1） 具名方式定义模板

可以在 mip-list 标签上配置属性 `template` 指定所需模板的 id：

```xml
<mip-list template="simple-tpl">
  <!-- 其他配置... -->
</mip-list>

<template type="mip-mustache" id="simple-tpl">
  <div>您好，{{name}}</div>
</template>
```

（2） 匿名方式定义模板

可以直接将 template 定义在 mip-list 里面，在这种情况下可以省略 id：

```xml
<mip-list>
  <!-- 其他配置... -->
  <teplate type="mip-mustache">
    <div>您好，{{name}}</div>
  </teplate>
</mip-list>
```

以上两种模板定义的渲染结果是一样的。假设完整的 mip-list 如下所示：

```html
<mip-list>
  <script type="application/json">
    {
      "items": [{"name": "李雷"}, {"name": "韩梅梅"}]
    }
  </script>
  <template type="mip-mustache">
    <div>您好，{{name}}</div>
  </template>
</mip-list>
```

那么 mip-list 在加载完毕之后，会在其内部产生如下节点：

```xml
<mip-list>
  <!-- ...(script 和 template) -->
  <div role="list">
    <div role="listitem">
      <div>您好，李雷</div>
    </div>
    <div role="listitem">
      <div>您好，韩梅梅</div>
    </div>
  </div>
</mip-list>
```

可以看到，mip-list 首先会生成 `<div role="list">` 节点作为放置所有列表项的容器，然后每个列表项均会被一个个 `<div rol="listitem">` 节点将模板渲染得到的 HTML 包裹起来。

[notice] 在使用 `<mip-list>` 进行前端模板渲染时可能会存在渲染结果的节点消失、或者属性消失等问题，这可能是模板没有满足`mip-mustache` HTML 规范所致，可以阅读 [mip-mustache](https://www.mipengine.org/v2/components/dynamic-content/mip-mustache.html) 的相关文档学习相关规范和目前存在的问题的解决办法。

## 数据定义

mip-list 的数据有 3 种加载方式：

1. 同步数据
2. 异步数据
3. 与 mip-data 关联

### 同步数据

同步数据的定义方式，就是在 mip-list 内部定义 `<script type="application/json">` 数据块即可。同步数据模式下的数据块应包含 `items` 字段，它的值应该是个数组：

```xml
<mip-list>
  <script application/json>
  {
    "items": [{ "name": "李雷" }, { "name": "韩梅梅" }]
  }
  </script>
  <!-- ... -->
</mip-list>
```

items 的每一项不一定要求为 Object，根据 mustache 模板语法，使用 `{{.}}` 可以直接将数据项直接渲染出来：

```html
<mip-list>
  <script type="application/json">
    {
      "items": ["李雷", "韩梅梅"]
    }
  </script>
  <template type="mip-mustache">
    <div>您好，{{.}}</div>
  </template>
</mip-list>
```

### 异步数据

#### 数据请求地址拼接

与异步数据加载有关的属性值包括：

|属性|说明|备注|
|----|----|----|
|src|异步数据源的后端地址| 要求必须为 HTTPS 的并且包含 hostname 的完整地址 |
|pn-name |分页参数名称| 默认值为 `pn` |
| pn | 分页起始页码 | 默认值为 `1` |

mip-list 会根据以上 3 个配置项拼接出数据请求链接。举个例子：

```xml
<mip-list
  src="https://www.mipengine.org/api"
  pn-name="pageNum"
  pn=1
></mip-list>
```

那么首屏数据请求 URL 为：
```
https://www.mipengine.org/api?pageNum=1
```

请求发送成功后 pn 会自动加 1，这样在触发加载第二屏数据的 URL 将变成：
```
https://www.mipengine.org/api?pageNum=2
```

#### 数据请求方式

mip-list 支持 `fetch` 和 `jsonp` 两种请求方式，可以通过配置 mip-list 的属性 `method="fetch"` 或 `method="jsonp"` 去手动指定。为了兼容原先的逻辑，默认值为 `method="jsonp"` 即采用 fetchJsonp 进行数据加载，但 JSONP 本身安全性不高，建议开发者手动指定成 fetch 的方式进行数据加载。

对于采用 fetch 发送请求的数据接口，要求接口必须配置 CORS 跨域资源共享；

而对于采用 jsonp 发送请求的情况，数据 URL 还会额外带上 `callback` 参数，指定了 jsonp 数据的回调，例如：

```
https://www.mipengine.org/api?pageNum=2&callback=jsonp_1234567
```

#### 异步数据格式

异步数据要求返回的格式如下所示：

```json
{
  "status": 0,
  "data": {
    "items": [ ],
    "isEnd": 1
  }
}
```

- status: 数据状态，0 表示请求成功，其他数字表示请求异常；
- items: 数据列表，与同步数据的 items 一致；
- isEnd：表示是否是最后一页，非必须，当 isEnd 为 1、true 时均认为全部加载完成；

#### 初始化加载第一页内容

在异步数据的模式下，在 mip-list 初始化阶段默认不会加载第一页内容，可以通过配置 `preload` 属性开启：

```html
<mip-list
  src="https://bos.nj.bpc.baidu.com/v1/assets/mip2/components/mip-list/examples/data.js"
  preload
>
  <template type="mip-mustache">
    <ul>
      <li>name: {{ name }}</li>
      <li>alias: {{ alias }}</li>
    </ul>
  </template>
</mip-list>
```

#### 加载更多分页数据

mip-list 需要配置 `has-more` 属性，才会激活 mip-list 的分页加载功能，此时 mip-list 对外暴露的 `.more` 方法将会生效，通过 MIP 事件机制就可以控制 mip-list 的分页加载：

```html
<mip-list
  id="example-list"
  src="https://bos.nj.bpc.baidu.com/v1/assets/mip2/components/mip-list/examples/data-has-more.js",
  has-more
>
  <template type="mip-mustache">
    <ul>
      <li>name: {{ name }}</li>
      <li>alias: {{ alias }}</li>
    </ul>
  </template>
</mip-list>

<button on="tap:example-list.more" class="example-button">点击加载更多</button>
```

在配置了 `has-more` 的情况下，点击触发 mip-list 加载的按钮会自动根据数据加载的状态来显示不同文案：

|状态|文案|
|----|----|
|pending|加载中...|
|error|加载失败|
|more|点击查看更多|
|done|已经加载完毕|

#### 事件与方法

在异步数据模式下，mip-list 会对外暴露两个方法：

- more: 加载更多，在配置 `has-more`，并且当前状态为 `init`、`more`和 `error` 时该方法生效；
- refresh: 刷新列表，mip-list 会重新初始化状态、分页信息等等，并会重新加载首屏数据；

同时当 mip-list 异步数据加载失败时，会抛出事件 `fetch-error`，可以在 mip-list 标签上通过 `on` 表达式注册对该事件的监听和处理行为。

### 与 mip-data 关联

当 mip-list 配置了 `id` 和 `scope` 时，mip-list 的数据就可以跟 mip-data 关联起来，我们就可以通过数据驱动的机制操作数据，反过来控制 mip-list 的渲染。

在这里需要注意的是，当 mip-list 与 mip-data 成功关联之后，将会以 `id` 作为 mip-list 数据的命名空间，因此 `id` 的命名应满足 JS 变量命名规则，以免无法使用 MIP 表达式访问到 mip-list 的数据。

```html
<mip-data>
  <script type="application/json">
  {
    "list": [{"name": "李雷"}, {"name": "韩梅梅"}]
  }
  </script>
</mip-data>

<mip-list id="list" scope>
  <template type="mip-mustache">
    <div>您好，{{name}}</div>
  </template>
</mip-list>

<!-- 定义一些对列表的数据操作 -->
<div>
  <mip-form url="https://www.mipengine.org/api">
    <input m-bind:value="addName" type="text" placeholder="请输入新增名字" class="example-input">
  </mip-form>
  <button class="example-button"
    on="tap:MIP.setData({
      list: addName == '' ? list : list.concat({ name: addName }),
      addName: ''
    })">点击新增</button>
</div>
<div>
  <mip-form url="https://www.mipengine.org/api">
    <input m-bind:value="delName" type="text" placeholder="请输入要删除的名字" class="example-input">
  </mip-form>
  <button class="example-button"
    on="tap:MIP.setData({
      list: list.filter(item => item.name !== delName)
    })">点击删除</button>
</div>
<div>
  <mip-form url="https://www.mipengine.org/api">
    <input m-bind:value="targetName" type="text" placeholder="请输入原名字" class="example-input">
    <input m-bind:value="modifyName" type="text" placeholder="请输入新名字" class="example-input">
  </mip-form>
  <button class="example-button"
    on="tap:MIP.setData({
      list: list.map(item => item.name === targetName ? { name: modifyName } : item)
    })">点击修改</button>
</div>
```

在进行列表项数据修改的时候需要注意，MIP 数据驱动机制采用了与 React 的 setState 类似的 diff 算法，只有当 **数组** 和 **列表项** 都发生变化的情况下，才会触发对应节点的重新渲染，因此下面的数据操作都不会触发 mip-list 的重新渲染：

```xml
<mip-script>
  var list = MIP.getData('list')
  list.splice(0, 1, { name: '张三' })
  MIP.setData({
    list: list
  })
</mip-script>

<button on="tap:MIP.setData({
  list: list.map((item, i) => i === 0 ? assign(item, { name: '张三'}) : item)
})"></button>
```

在这两个例子中，`<mip-script>` 里面的操作并没有更改 list 的地址，即数组地址并未发生改变，因此不会触发 mip-list 视图更新；而 `<button>` 中的 `on` 表达式，虽然经过 `.map` 运算生成了新的数组，但是由于 `assign(item, {})` 并没有改变数组项的地址，因此同样不会触发 mip-list 的视图更新。

正确的写法应该如下所示：

```xml
<mip-script>
  var list = MIP.getData('list')
  list.splice(0, 1, { name: '张三' })
  MIP.setData({
    list: list.slice(0)
  })
</mip-script>

<button on="tap:MIP.setData({
  list: list.map((item, i) => i === 0 ? assign({}, item, { name: '张三'}) : item)
})"></button>
```

同时借助数组地址变化但列表项地址不变化不会触发视图更新的特点，还可以利用 `m-bind` 表达式来实现渲染优化：

```html
<mip-list id="example" scope>
  <script type="application/json">
  {
    "items": [{ "name": "李雷", "key": "a"}, { "name": "韩梅梅", "key": "b"}]
  }
  </script>
  <template type="mip-mustache">
    <div m-text="'你好，' + example.find(item => item.key === '{{key}}').name"></div>
  </template>
</mip-list>

<button on="tap:MIP.setData({
  example: example.map(
    item => item.key === 'a' ? assign(item, {name: '张三'}) : item
  )
})">将李雷修改为张三</button>
```

在上面的例子当中，点击按钮更新 mip-list 列表项的操作完全走的 MIP 数据绑定的逻辑，并不会重新触发 mip-list 列表项的重新渲染，这样就能够大大优化 mip-list 的性能。

更多有关 mip-list 与 mip-data 联动的内容，请参考[数据驱动与模板渲染](https://www/mipengine.org/docs/interactive-mip/data-driven-and-dom-render.html)

## 属性

### 基本属性

|属性|描述|说明|
|---|---|---|
|id |必选项：否<br>类型：字符串<br>取值范围：满足 JS 变量命名规则的字符串<br>单位：无<br>默认值：无<br>|与 mip-data 类似，当配置 scope 属性时，将作为 mip-list 列表数据存放在 mip-data 里的命名空间|
|scope|必选项：否<br>类型：布尔值<br>取值范围：无<br>单位：无<br>默认值：false|当配置 scope + id 属性时，mip-list 列表数据将可以通过数据驱动机制进行操控|
|template|必选项：否<br>类型：字符串| mustache 模板 id，当模板定义在 mip-list 里面时，template 的值可以为空|

### 异步请求相关属性

|属性|描述|说明|
|----|----|----|
|src |必选项：否<br>类型：字符串<br>取值范围：必须是 HTTPS 并且包含 hostname 的完整 URL<br>单位：无<br>默认值：无<br>|异步请求的数据接口|
|method |必选项：是<br>类型：字符串<br>取值范围：'fetch' 或 'jsonp'<br>单位：无<br>默认值：'jsonp'|指定数据请求的方式为 fetch 还是 fetchJsonp，目前为了兼容老逻辑，因此默认采用了 fetchJsonp 发送请求，但 fetchJsonp 本身并不安全，因此**强烈建议**将 method 配置为 'fetch'。|
|timeout|必选项：否<br>类型：整数<br>取值范围：无<br>单位：ms<br>默认值：5000|请求的超时时间|
|credentials|必选项：否<br>类型：字符串<br>取值范围：`include` 或 `omit`<br>单位：无<br>默认值：无|当使用 fetch 发送请求时，可以配置 credentials 决定发送请求时是否带上 cookie<br>其中 `credentials="include"` 时请求会带上 cookie，`credentials="omit"` 则不会。|

### 分页请求相关属性

|属性|描述|说明|
|----|----|----|
|has-more |必选项：否<br>类型：字符串<br>取值范围：无<br>单位：无<br>默认值：无|是否有点击展开更多功能|
|pn-name|必选项：否<br>类型：字符串<br>取值范围：无<br>单位：无<br>默认值：'pn'|翻页变量名<br>在发送分页数据请求的时候，会自动将 `${pn-name}=${pn}` 作为 Query 拼接到 src 后面|
|pn|必选项：否<br>类型：整数<br>取值范围：无<br>单位：无<br>默认值：1|翻页初始页码，每次请求会自动加 1|
|preload|必选项：否|异步加载数据，如果添加 `preload` 参数，则在初始化时加载第一页内容|

## 可绑定属性

### src

说明：当触发 src 改变时，将会清空 mip-list 的状态和分页数据，并重新去请求当前 src 的第一屏数据并进行列表渲染。

## 事件

### fetch-error

说明：当远程数据加载失败时抛出该事件<br>
数据：错误信息 e

## 方法

### more

说明：当 mip-list 状态为 `init`、`more`、`error` 时，加载下一屏的数据并渲染。<br>
注意：当且仅当 mip-list 配置 `has-more` 时生效。

### refresh

说明：清空 mip-list 的状态和分页数据，并重新去请求当前 src 的第一屏数据并进行列表渲染。<br>
注意：当且仅当 `src` 不为空时生效。


