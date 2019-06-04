# mip-group-selection 分组选择

`<mip-group-selection>` 分组选择组件，可用于城市分组，英文名分组，颜色分组等。

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-group-selection/mip-group-selection.js<br/>https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js

## 行为

- `<mip-group-selection>` 可以单独使用，也可以结合 `<mip-form>` 使用。单独使用时默认隐藏，需要通过调用 `show` 方法来进行显示。在 `<mip-form>` 中，组件表现为输入框，用户点击输入框才会弹出选择列表，所选数据会直接填入到输入框中，可以更方便地获取和提交数据。

- 数据取自用户所选元素的 `dataset`。

- 用户点击选择项时，会通过 `MIP.setData` 保存数据，也会触发 `selected` 事件，数据保存在 `event.data` 中。

- 当组件关闭时，会触发 `close` 事件，数据保存在 `event.data` 中。

- 暴露 `show`、`hide` 方法，分别用于显示和关闭组件。

## 示例

### 结合 <mip-form>

按照如下示例配置数据（使用本地数据）。

结合 `<mip-form>` 通过表单提交所选数据，在 `<mip-form>` 中，组件表现为输入框，用户点击输入框才会弹出模版内容。

可添加组件属性 `name`、`placeholder`、`data-id` 分别指定输入框的 `name`、`placeholder`、`id` 属性，`field` 属性指定输入框获取数据的字段，`closable` 属性设置是否显示默认关闭按钮，`multiple` 属性设置是否多选。

[notice]需要引入 `mip-form.js`

```html
<mip-form method="get" url="https://www.mipengine.org?we=123">
  <p>选择城市：</p>
  <mip-group-selection name="citySelection" placeholder="select city" data-id="city" field="city" closable multiple>
    <!-- 在 application/json 中配置全部城市 -->
    <script type="application/json">
      {
        "list": [{
          "key": "热门",
          "cities": [
            { "city": "北京", "pinyin": "beijing", "code": "1" },
            { "city": "上海", "pinyin": "shanghai", "code": "2" },
            { "city": "广州", "pinyin": "guangzhou", "code": "3" },
            { "city": "深圳", "pinyin": "shenzhen", "code": "4" },
            { "city": "重庆", "pinyin": "chongqing", "code": "5" }
          ]
        }, {
          "key": "A",
          "cities": [
            { "city": "澳门", "pinyin": "aomen", "code": "7" },
            { "city": "安庆", "pinyin": "anqing", "code": "8" },
            { "city": "安泽", "pinyin": "anze", "code": "9" }
          ]
        }, {
          "key": "B",
          "cities": [
            { "city": "宝清", "pinyin": "baoqing", "code": "10" },
            { "city": "宝鸡", "pinyin": "baoji", "code": "11" },
            { "city": "巴东", "pinyin": "badong", "code": "12" }
          ]
        }, {
          "key": "C",
          "cities": [
            { "city": "重庆", "pinyin": "chongqing", "code": "13" },
            { "city": "成都", "pinyin": "chengdu", "code": "14" },
            { "city": "苍山", "pinyin": "cangshan", "code": "15" }
          ]
        }, {
          "key": "D",
          "cities": [
            { "city": "大庆", "pinyin": "daqing", "code": "16" },
            { "city": "大理", "pinyin": "dali", "code": "17" },
            { "city": "东莞", "pinyin": "dongguan", "code": "18" }
          ]
        }, {
          "key": "E",
          "cities": [
            { "city": "鄂尔多斯", "pinyin": "eerduosi", "code": "19" },
            { "city": "峨眉山", "pinyin": "emeishan", "code": "20" }
          ]
        }, {
          "key": "F",
          "cities": [
            { "city": "阜阳", "pinyin": "fuyang", "code": "21" },
            { "city": "福州", "pinyin": "fuzhou", "code": "22" },
            { "city": "防城港", "pinyin": "fangchenggang", "code": "23" }
          ]
        }, {
          "key": "G",
          "cities": [
            { "city": "广州", "pinyin": "guangzhou", "code": "24" },
            { "city": "贵阳", "pinyin": "guiyang", "code": "25" }
          ]
        }]
      }
    </script>
    <!-- 选择组件依赖的 DOM 结构，不建议自行删除结构 -->
    <template type="mip-mustache">
      <div class="mip-group-selection-content">
        {{#list}}
          <div class="mip-group-selection-group mip-group-selection-part-letter">
            <div class="mip-group-selection-title" data-anchor="{{key}}">{{key}}</div>
            {{#cities}}
              <p class="mip-group-selection-item" data-code="{{code}}" data-pinyin="{{pinyin}}" data-city="{{city}}">{{city}}</p>
            {{/cities}}
          </div>
        {{/list}}
      </div>
      <mip-fixed class="mip-group-selection-sidebar-wrapper" type="right" top="10px">
        <div class="mip-group-selection-sidebar">
          {{#list}}
            <div class="mip-group-selection-link" data-target-anchor="{{key}}">{{key}}</div>
          {{/list}}
        </div>
      </mip-fixed>
    </template>
  </mip-group-selection>
  <input type="submit" value="提交">
</mip-form>
<script src="https://c.mipcdn.com/static/v2/mip-group-selection/mip-group-selection.js"></script>
<script src="https://c.mipcdn.com/static/v2/mip-form/mip-form.js"></script>
<script src="https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js"></script>
```

### 配置远程数据

按照如下示例配置数据（使用远程数据）。

[notice]`data-src`属于前后端交互请求。由于 MIP-Cache 为 HTTPs 环境，`data-src` 要求支持 HTTPs.

```html
<mip-group-selection data-src="https://xxx/cities.json">
  <!--存在 data-src 时，本地数据配置不生效-->
  <!-- 选择组件依赖的 DOM 结构，不建议自行删除结构 -->
  <template type="mip-mustache">
    <!-- ... -->
  </template>
</mip-group-selection>
```

### 配合数据绑定

当选择某个元素，如`{ "city": "广州", "pinyin": "guangzhou", "code": "24"}`时，页面中数据会发生变化，配合 [mip-bind 数据绑定组件](https://www.mipengine.org/examples/mip-extensions/mip-bind.html) 可以将数据显示出来。

本例中数据取自所选元素的 `dataset`，也就是 `<p>` 的 `data-code`、`data-pinyin`、`data-city`，对应的 `dataset` 为 `{code:*, pinyin:*, city:*}`，因此 `mip data` 需要包含这三个属性才能正确保存数据。

```html
<h3>这里使用了 mip-bind 组件</h3>
<mip-data>
  <script type="application/json">
    {
      "code": "",
      "pinyin": "",
      "city": ""
    }
  </script>
</mip-data>
<p class="selected-p">
  城市代号：<span m-text="code" class="selected-text"></span>，
  城市拼音：<span m-text="pinyin" class="selected-text"></span>，
  城市中文：<span m-text="city" class="selected-text"></span>
</p>
<button on="tap:select.show">显示选择</button>
<mip-group-selection id="select">
  <!-- ... -->
    <p class="mip-group-selection-item" data-code="{{code}}" data-pinyin="{{pinyin}}" data-city="{{city}}">{{city}}</p>
  <!-- ... -->
</mip-group-selection>
```

### 配合事件绑定

当用户选择某个元素时，分组选择组件会抛出名为 `selected` 的事件，使用组件[事件通信机制](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html)可以监听这个事件，并与其他组件/数据交互（action）。

如下方示例，当分组选择组件 `mip-group-selection` 中 `selected` 事件（event）被触发时，调用 id 为 `mytoggle1` 组件的 `toggle` 作为响应（action）。

```html
<mip-group-selection
  on="selected:mytoggle1.show(1000)"
  >
  <!--内容略-->
</mip-group-selection>

<mip-fixed type="right" bottom="10px">
  <mip-toggle id="mytoggle1">
    <!--内容略-->
  </mip-toggle>
</mip-fixed>
```

## 属性说明

### data-src

说明：用于指向远程数据地址，异步加载并渲染。指明`data-src`后，配置在`<script type="application/json">`本地的数据不再生效。

使用限制：异步加载数据属于前后端交互请求。由于 MIP-Cache 为 HTTPs 环境，`data-src` 要求支持 HTTPs.

### name

说明：在 `mip-form` 下生效，作为输入框的 `name` 属性

格式：string

### placeholder

说明：在 `mip-form` 下生效，作为输入框的 `placeholder` 属性

格式：string

### data-id

说明：在 `mip-form` 中生效，作为输入框的 `id` 属性

格式：string

### field

说明：在 `mip-form` 中生效，作为输入框获取数据的字段

格式：string

### closable

说明：是否使用默认关闭按钮，如果不使用，点击选项后组件直接关闭

格式：boolean

### multiple

说明：是否可以多选，多选会使用默认关闭按钮

格式：boolean

## 注意事项

- mip-group-selection 分组选择组件依赖 `mip-mustache`，必须引用对应的 javascript 脚本。如果结合表单，还需要引入 `mip-form` 的脚本