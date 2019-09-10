# mip-autocomplete 组件

`mip-autocomplete` 根据指定数据给予用户输入提示，类似百度搜索的下拉提示。

标题|内容
----|----
类型|通用
支持布局|container
所需脚本| https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js<br>https://c.mipcdn.com/static/v2/mip-form/mip-form.js<br>https://c.mipcdn.com/static/v2/mip-autocomplete/mip-autocomplete.js

## 示例

### 基本使用

当用户在输入框输入字符的时候，相关的提示会自动出现在输入框下面，类似百度搜索的下拉提示。组件基于用户的输入，在提示数据中进行检索，向用户给出提示。

`mip-autocomplete` 组件必须结合 `mip-form` 组件使用，嵌套在 `mip-form` 组件中，同时必须有一个输入框，输入框在 `mip-autocomplete` 组件的内部。使用组件必须指定提示定数据。数据必须是一个包含 `items` 属性的 `JSON` 对象，`items` 属性的值为数组。提示数据可以来自服务器端也可以设置在浏览器端。如果设置在浏览器端，则使用 `script` 标签指定，如果来自服务器端，则在组件中添加 `src` 属性指定请求地址。示例如下：

数据设置在浏览器端：

```xml
<mip-form>
  <mip-autocomplete filter="substring">
    <input type="text">
    <script type="application/json">
      {
        "items": ["apple", "orange", "banana"]
      }
    </script>
  </mip-autocomplete>
</mip-form>
```

数据来自服务器端：

```xml
<mip-form>
  <mip-autocomplete filter="substring"
    src="https://example.tips">
    <input type="text">
  </mip-autocomplete>
</mip-form>
```

数据格式示例：

```js
{
  "items": [{
    "city": "上海",
    "province": "上海市",
    "population": 98251,
    "value": "我是上海"
  }, {
    "city": "北京",
    "province": "北京市",
    "population": 99321,
    "value": "我是北京"
  }, {
    "city": "济南",
    "province": "山东省",
    "population": 84964,
    "value": "我是济南"
  }]
}
```

像如上数据所示，组件默认按照 `value` 属性进行筛选，也支持按照指定属性筛选，如下 `city`:

```html
<p>使用 filter-value 属性进行筛选</p>
<mip-form url="https://path/to/your/api">
  <mip-autocomplete filter="substring"
    filter-value="city">
    <input type="text">
    <script type="application/json">
      {
        "items": [{
          "city": "上海",
          "province": "上海市",
          "population": 98251,
          "value": "我是上海"
        }, {
          "city": "北京",
          "province": "北京市",
          "population": 99321,
          "value": "我是北京"
        }, {
          "city": "济南",
          "province": "山东省",
          "population": 84964,
          "value": "我是济南"
        }]
      }
    </script>
  </mip-autocomplete>
</mip-form>
```

### 结合 `mip-mustache` 组件的 `template` 模板渲染组件使用

>注意：由于 `mip-form` 不支持在其内部写 `div` 元素，所以 `mip-form` 子节点的 `div` 需要使用 `section`、`menu` 等可用元素替代。同时需要在替代元素上指定 `id="template-element"`。

```html
<p>使用 filter-value 属性进行筛选，同时使用 template 模板渲染</p>
<mip-form url="https://path/to/your/api">
  <mip-autocomplete filter="substring"
    filter-value="city">
    <input type="text">
    <script type="application/json">
      {
        "items": [{
          "city": "上海",
          "province": "上海市",
          "population": 98251,
          "value": "我是上海"
        }, {
          "city": "北京",
          "province": "北京市",
          "population": 99321,
          "value": "我是北京"
        }, {
          "city": "济南",
          "province": "山东省",
          "population": 84964,
          "value": "我是济南"
        }]
      }
    </script>
    <template type="mip-mustache"
      id="mip-template-custom">
      <section class="city-item" id="template-element"
        data-value="{{city}}, {{province}}">
        <section>{{city}}, {{province}}</section>
        <section class="custom-population">点赞数: {{population}}</section>
      </section>
    </template>
  </mip-autocomplete>
</mip-form>
```

组件为 `mip-autocomplete` 下的 `input` 元素设置了默认样式，开发者可以通过覆盖 `mip-autocomplete > input` 样式进行修改。

## 属性

### filter

说明：根据用户输入进行过滤，过滤后的结果以数据检索到的顺序进行显示，过滤在浏览器端进行，不涉及服务器端筛选。支持以下过滤模式：

* substring：如果用户输入的字符包含在某条数据中，则向用户提示这条数据

* prefix：如果用户输入的字符是某条数据的前缀，则向用户提示这条数据

* none：不做筛选。如果提供了 `max-entries` 属性，则最多只显示 `max-entries` 条提示。

必选项：是

类型：字符串

默认值：无

### filter-value 

说明：数据为 JSON 对象时，指定按照哪个字段在提示数据中进行筛选

必选项：否，如果 `filter = none`，则此项无效

类型：字符串

默认值：`value`

### min-characters

说明：触发筛选提示的用户输入最小字符串的长度

必选项：否

类型：数字

默认值：0

### max-entries 

说明：向用户显示的提示项的最大条目数，如果未指定，则全部显示，条目超长则滚动显示

必选项：否

类型：数字

默认值：无

### submit-on-enter

说明：若为 `true` 则用户点击 `enter` 键时选中该项并触发表单提交行为。若为 `false` 则用户点击 `enter` 键时选中该项，不触发表单提交行为，若此时无提示项，则出触发默认行为

`mip-form` 会将 `input` 的 `name` 属性作为参数名，将填的值作为参数进行提交，若发现无参数提交，请检查 `input` 的 `name` 属性是否设置，参考如下：

```js
<p>更多功能 -- submit-on-enter="true"</p>
<mip-form method="GET" fetch-url="https://path/to/api">
  <mip-autocomplete filter="substring" submit-on-enter="true">
    <input name="name">
    <script type="application/json">
      {
        "items": ["apple", "orange", "banana"]
      }
    </script>
  </mip-autocomplete>
</mip-form>
```

必选项：否

类型：布尔

默认值：false

### src

说明：从服务器端获取提示信息的地址，`src` 需要是 `https` 或 `//` 协议开头，否则在 HTTPS 环境下会无法正常加载

当使用这种方式获取异步数据时，请注意：**需要开发者服务端配置 CORS 跨站访问**，具体步骤如下：

- 接收到请求后，判断请求头中的 `origin` 是否是允许的，其中需要允许的域名包括：`https://mipcache.bdstatic.com`、开发者的站点`origin` 、`https://站点域名转换的字符串.mipcdn.com` 。站点域名转换的字符串是指开发者的站点origin通过一定的规则（点.转换为中横线-）转换的字符串，如下面代码中的origins数组所示：origins[1]为开发者的站点origin，origins[2]为转换后的 origin；
- 如果 `origin` 在指定的列表中则设置 `response header` 中的 `Access-Control-Allow-Origin` 为请求接收到的 `origin`，以 Node.js 举例，如下所示：

```javascript
let origins = {
  'https://mipcache.bdstatic.com': 1,
  'https://www-mipengine-org.mipcdn.com': 1,
  'https://www.mipengine.org': 1
}
app.get('/data', function (req, res) {
  let ori = req.headers.origin
  if (origins[ori]) {
    res.header('Access-Control-Allow-Origin', ori)
    res.json({})
  }
})
```

必选项：否

类型：string

默认值：无

## 事件

事件名称 | 事件描述
-- | --
`select` | 提示被选中时触发，传出选中项的数据

示例如下：

```html
<h2>更多功能 -- select 事件</h2>
<mip-form method="GET" fetch-url="https://path/to/mockSubmit.json" on="select:toast1.show(event.value)">
  <mip-autocomplete filter="substring" submit-on-enter="true">
    <input name="name">
    <script type="application/json">
      {
        "items": ["apple", "orange", "banana"]
      }
    </script>
  </mip-autocomplete>
</mip-form>
<mip-toast
  id= "toast1"
  station = "top">
</mip-toast>
```

