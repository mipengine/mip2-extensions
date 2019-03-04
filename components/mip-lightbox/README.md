# mip-lightbox 弹出层

由用户控制展现或关闭的全屏浮层组件，组件全屏覆盖。

标题|内容
----|----
类型|通用
支持布局|N/A
所需脚本|https://c.mipcdn.com/static/v2/mip-lightbox/mip-lightbox.js

组件支持 `open`， `close`， `toggle` 三种类型的事件，分别对应 `显示`，`关闭`，`切换`的操作。我们可以通过在按钮元素上绑定 tap 事件，并指定对应的 lightbox 组件 id 进行控制，如下示例。

## 示例

### 基本使用

```html
<button on="tap:my-lightbox.open" id="btn-open" role="button" tabindex="0">
    Open lightbox
</button>

<mip-lightbox
  id="my-lightbox"
  layout="nodisplay"
  class="mip-hidden">
  <div class="lightbox">
    <h1>Hello, World!</h1>
    <p> this is the lightbox</p>
    <span on="tap:my-lightbox.toggle" class="lightbox-close">关闭弹层</span>
  </div>
</mip-lightbox>
```

### 配置内容区可滚动

可用于展示搜索结果，用户协议等长内容。添加 `content-scroll` 属性可配置内容滚动。

```html
<button on="tap:my-lightbox2.toggle" id="btn-open" role="button" tabindex="0">
    打开用户协议
</button>

<mip-lightbox
  id="my-lightbox2"
  layout="nodisplay"
  class="mip-hidden"
  content-scroll>
  <div class="lightbox">
    <span on="tap:my-lightbox2.toggle" class="lightbox-close">忽略</span>
    <h1>Hello, World!</h1>
    <p> this is the lightbox</p>
    <p> this is the lightbox</p>
    <p> this is the lightbox</p>
    <p> this is the lightbox</p>
    <p> this is the lightbox</p>
    <p> this is the lightbox</p>
    <span on="tap:my-lightbox2.toggle" class="lightbox-close">我知道了</span>
  </div>
</mip-lightbox>
```

### 自动关闭

[notice] 此属性与 `class` 为 `mip-lightbox-seconds` 的标签配套使用

```html
<button on="tap:my-lightbox3.toggle" id="btn-open" role="button" tabindex="0">
    Open lightbox
</button>

<mip-lightbox
  autoclosetime="5"
  id="my-lightbox3"
  layout="nodisplay"
  class="mip-hidden">
  <div class="lightbox">
    <h1>Hello, World!</h1>
    <p> this is the lightbox</p>
    <div class="mip-lightbox-countdown">倒计时<span class="mip-lightbox-seconds"></span>秒关闭</div>
  </div>
</mip-lightbox>
```

## 属性

### id

说明：组件 `id`
必选项：是
类型：字符串

### layout

说明：布局
必选项：是
类型：字符串
取值：`nodisplay`

### autoclose

说明：自定义倒计时，自动关闭，需要与 `class="mip-lightbox-seconds"` 的标签配套使用，`class="mip-lightbox-countdown"` 的标签可自定义倒计时样式及文字内容
必选项：否
类型：字符串
取值：数字，单位秒

### content-scroll
说明：配置内容区域可以滚动，如果不填则内容不可滚动。
必选项：否

## 注意事项

- `<mip-lightbox>` 默认是隐藏的，作为打开开关的 DOM 节点需设置 `on` 属性，如需打开弹层，可设置 `on` 的属性值为 "tap:组件ID.open"。

- `<mip-lightbox>` 可以设置一个 `<div>` 子节点，用于自定义弹层的内容。如需设置关闭按钮，关闭按钮节点并且必须有 `on` 属性，属性值为 "tap:组件ID.close"。
