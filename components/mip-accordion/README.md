# mip-accordion 折叠节点

折叠隐藏节点，可记录用户上次行为。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-accordion/mip-accordion.js

## 使用说明

mip-accordion 是一个折叠隐藏节点的 MIP 组件，可以对满足特定结构的节点提供隐藏显示的能力。一个简单的 mip-accordin 组件的使用结构如下所示：

```xml
<mip-accordion sessions-key="simple_key">
  <section>
    <div>标题</div>
    <div>内容</div>
  </section>
</mip-accordion>
```

`<mip-accordion>` 内部会将 `<section>` 标签识别为可折叠的块，同时要求 `<section>` 里面必须包含两个子节点，第一个节点将被自动识别为 `title`，在折叠的时候这个 `title` 节点将一直显示，点击 title 将会展开或折叠 `content` 块；第二个节点被识别为 `content`，这个内容块就是能够被展开折叠的块。

[notice] section 块必须存在两个子节点，不然会报错。

[info] title 和 content 块可以是任何形式的内容，包括文本，图片、其他节点

```xml
<mip-accordion sessions-key="key-1">
  <section>
    <div>
      <div>标题1 第一行</div>
      <div>标题1 第二行</div>
    </div>
    <div>
      <div>内容1 第一行</div>
      <div>内容1 第二行</div>
    </div>
  </section>
</mip-accordion>
```

[info] `<mip-accordion>` 会遍历节点内部的所有 `<section>` 块，因此不要求 `section` 必须为 `<mip-accordion>` 的直接子节点，但不建议将 section 嵌套在其他节点内，以避免可能存在的问题。

[info] 如果需要实现嵌套的展开折叠功能，建议通过嵌套 `<mip-accordion>` 实现，而不要直接通过嵌套 `<section>` 实现：

建议：

```xml
<mip-accordion sessions-key="key-1">
  <section>
    <div>标题</div>
    <div>
      <p>内容</p>
      <mip-accordion sessions-key="key-1">
        <section>
          <div>子标题</div>
          <div>
            <p>子内容</p>
          </div>
        </section>
      </mip-accordion>
    </div>
  </section>
</mip-accordion>
```

避免：

```xml
<mip-accordion sessions-key="key-1">
  <section>
    <div>标题</div>
    <div>
      <p>内容</p>
      <section>
        <div>子标题</div>
        <div>
          <p>子内容</p>
        </div>
      </section>
    </div>
  </section>
</mip-accordion>

```

## 示例

### 标题加内容形式

`<section>` 的第一个子节点为按钮，第二个子节点为隐藏目标节点。

[info]页面加载初默认隐藏的节点，需要添加 `class="mip-accordion-content"`。

```html
<mip-accordion sessions-key="mip_1" animatetime='0.24'>
  <section>
    <h4>下拉第一个</h4>
    <p class="mip-accordion-content">我说你是人间的四月天；笑声点亮了四面风；轻灵在春的光艳中交舞着变。你是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，</p>
  </section>
  <section  expanded="open">
    <h4>下拉第二个</h4>
    <p>细雨点洒在花前。那轻，那娉婷，你是，鲜妍百花的冠冕你戴着，你是天真，庄严，你是夜夜的月圆。</p>
  </section>
  <section>
    <h4>下拉第三个</h4>
    <mip-img layout="responsive" width="400" height="200" src="https://www.mipengine.org/static/img/sample_01.jpg" class="mip-accordion-content"></mip-img>
  </section>
</mip-accordion>
```

### 标题加内容形式-手动

```html
<mip-accordion sessions-key="mip_2" type="manual" animatetime='0.24'>
  <section>
    <h4>下拉第一个</h4>
    <p class="mip-accordion-content">我说你是人间的四月天；笑声点亮了四面风；轻灵在春的光艳中交舞着变。你是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，</p>
  </section>
  <section expanded="open">
    <h4>下拉第二个</h4>
    <p>细雨点洒在花前。那轻，那娉婷，你是，鲜妍百花的冠冕你戴着，你是天真，庄严，你是夜夜的月圆。</p>
  </section>
  <section>
    <h4>下拉第三个</h4>
    <mip-img layout="responsive" width="400" height="200" src="https://www.mipengine.org/static/img/sample_01.jpg" class="mip-accordion-content"></mip-img>
  </section>
</mip-accordion>
```

### 标题切换形式

```html
<mip-accordion sessions-key="mip_3" animatetime='0.24'>
  <section>
    <h4>
      <span class="show-more">显示更多</span>
      <span class="show-less">收起</span>
    </h4>
    <p class="mip-accordion-content">显示显示收起收起显示显示收起收起显示显示收起收起显示显示收起收起</p>
  </section>
</mip-accordion>
```

### 配置只展开一个节点

```html
<mip-accordion sessions-key="mip_4" expaned-limit>
  <section>
    <h4>下拉第一个</h4>
    <p class="mip-accordion-content">我说你是人间的四月天；笑声点亮了四面风；轻灵在春的光艳中交舞着变。你是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，</p>
  </section>
  <section  expanded>
    <h4>下拉第二个</h4>
    <p>细雨点洒在花前。那轻，那娉婷，你是，鲜妍百花的冠冕你戴着，你是天真，庄严，你是夜夜的月圆。</p>
  </section>
  <section>
    <h4>下拉第三个</h4>
    <mip-img
      layout="responsive"
      width="400"
      height="200"
      src="https://www.mipengine.org/static/img/sample_01.jpg" class="mip-accordion-content">
    </mip-img>
  </section>
</mip-accordion>
```

### 进行嵌套

```html
<mip-accordion sessions-key="mip_5">
  <section>
    <h2>下拉第一个</h2>
    <div>我说你是人间的四月天；笑声点亮了四面风；轻灵在春的光艳中交舞着变。你是四月早天里的云烟，黄昏吹着风的软，星子在无意中闪，
      <section>
        <h3>点击第一处进行下拉</h3>
        <div>雪化后那片鹅黄，你像；新鲜初放芽的绿，你是；柔嫩喜悦,水光浮动着你梦期待中的白莲。
          <section>
            <h4>再次点击进行下拉</h4>
            <div>你是一树一树的花开，是燕在梁间呢喃，——你是爱，是暖，是希望，你是人间的四月天！</div>
          </section>
        </div>
      </section>
      <section>
        <h3>点击第二处进行下拉</h3>
        <div>雪化后那片鹅黄，你像；新鲜初放芽的绿，你是；柔嫩喜悦,水光浮动着你梦期待中的白莲。</div>
      </section>
      <section>
        <h3>点击第三处进行下拉</h3>
        <div>雪化后那片鹅黄，你像；新鲜初放芽的绿，你是；柔嫩喜悦,水光浮动着你梦期待中的白莲。</div>
      </section>
    </div>
  </section>
  <section>
    <h2>下拉第二个</h2>
    <div>细雨点洒在花前。那轻，那娉婷，你是，鲜妍百花的冠冕你戴着，你是天真，庄严，你是夜夜的月圆。</div>
  </section>
  <section>
    <h2>下拉第三个</h2>
    <mip-img layout="responsive" width="400" height="200" src="https://www.mipengine.org/static/img/sample_01.jpg"></mip-img>
  </section>
</mip-accordion>
```

## 属性

### sessions-key

说明：组件唯一标识符，用于区分同个页面中多个 `<mip-accordion>` 以还原用户上次操作

必选项：是

类型：字符串

### type

说明：类型，区分自动根据 `<session>` 记录展开节点，还是手动配置默认展开节点

必选项：否

类型：字符串

单位：无

取值：`automatic`, `manual`

默认值：`automatic`

### expanded

说明：默认展开的 `<mip-accordion>` 子节点需要配置此属性，只有在 `<mip-accordion>` 的 `type` 属性值为 `manual` 时才会生效

必选项：否

类型：字符串

单位：无

取值：无

默认值：无

### expaned-limit

说明：默认可以同时展开多个节点，有此属性时，同时只展开一个节点

必选项：否

类型：字符串

单位：无

取值：无

默认值：无

### animatetime

说明：展开收起动画时间，最大为 1 秒，建议为 0.24 秒

必选项：否

类型：数字（小数）

单位：秒

默认值：0.24
