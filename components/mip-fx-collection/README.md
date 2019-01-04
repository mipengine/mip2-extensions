# `mip-fx-collection`

标题|内容
----|----
类型|通用
支持布局|nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-fx-collection/mip-fx-collection.js](https://c.mipcdn.com/static/v2/mip-fx-collection/mip-fx-collection.js)

## 说明

提供了一系列的滚动动画效果，包括

- parallax（视差滚动）
- fade-in（渐显）
- fade-in-scroll（滚动渐显，随着滚动的距离渐显）
- fly-in-bottom（从下面飞入）
- fly-in-top（从上面飞入）
- fly-in-left（从左侧飞入）
- fly-in-right（从右侧飞入）

可以通过非常方便的方法给页面元素加上这些滚动效果，只需要在需要特效的元素上加上 `mip-fx` 属性，如下面的例子所示

```html
<mip-img
  src="https://www.mipengine.org/static/img/sample_01.jpg"
  height="275" width="414"
  layout="responsive"
  mip-fx="fade-in-scroll"
  data-repeat
  ></mip-img>
```

各特效要求的属性不尽相同，在下面的属性章节会详细说明，另外，`mip-fx` 支持同时使用多个不冲突的特效，如 `mip-fx="fly-in-left fade-in-scroll"`，有些特效之间有冲突，不能一起使用，见下面的列表

特效|不兼容特效
----|----
parallax|fly-in-top, fly-in-bottom
fly-in-top|parallax, fly-in-bottom
fly-in-bottom|parallax, fly-in-top
fly-in-right|fly-in-left
fly-in-left|fly-in-right
fade-in|fade-in-scroll
fade-in-scroll|fade-in


## 示例

```html
<style>
  body {
    background: #d7d7d7;
  }

  .container {
    position: relative;
  }

  .blank {
    height: 1200px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50px;
  }
</style>
<div class="blank">往上滚动</div>
<div class="container">
  <mip-img
    src="https://www.mipengine.org/static/img/sample_01.jpg"
    height="275"
    width="414"
    layout="responsive"
    mip-fx="fly-in-left fade-in-scroll"
    data-duration="1000"
    data-easing="cubic-bezier(0.65, 2, 1, 1)"
    data-repeat
    ></mip-img>
</div>
<div class="blank">往下滚动</div>
```

## 属性

### parallax

`parallax` 视差滚动特效可以让元素滚动的速度比页面滚动快或者慢，造成视差滚动的效果。开发者可以通过 `data-parallax-factor` 参数来控制滚动的相对速度。

#### data-parallax-factor

可以控制页面滚动的相对速度

- 如果为 0，那么元素就会固定在页面上，类似于 fixed 的效果
- 如果大于 0，小于 1，那么元素滚动的速度比页面要慢
- 如果等于 1，元素滚动速度和页面一样，也就是没有效果
- 如果大于 1，元素滚动速度比页面要快

可以看这个例子

```html
<div class="parallax-container">
  <span
    mip-fx="parallax fly-in-top"
    data-parallax-factor="1.3">Parallax</span>
  <mip-img
    src="https://www.mipengine.org/static/img/sample_01.jpg"
    height="275" width="414"
    layout="responsive"></mip-img>
</div>
```

### fly-in-top, fly-in-bottom, fly-in-left, fly-in-right

这四种特效的作用都是让元素第一次出现的时候具有划入页面的动效，从四个不同的方向，包含和上面不一样的属性。

#### data-duration (optional)

控制动画的持续时间，单位为毫秒，可选，默认是 `500ms`。

```html
<div mip-fx="fly-in-top" data-duration="1000"></div>
```

#### data-easing (optional)

控制动画的执行速度，可选，默认是 `ease-out`，可选项的值有如下四种

- `linear` - cubic-bezier(0, 0, 1, 1)
- `ease-in-out` - cubic-bezier(0.8, 0, 0.2, 1)
- `ease-in` - cubic-bezier(0.8, 0, 0.6, 1)
- `ease-out` - cubic-bezier(0.4, 0, 0.4, 1)

或者开发者也可以自定义 `cubic-bezier` 的值，如下

```html
<div
  mip-fx="fly-in-top"
  data-easing="linear"
></div>
<div
  mip-fx="fly-in-bottom"
  data-easing="cubic-bezier(0.65, 2, 1, 1)"
></div>
```

#### data-fly-in-distance (optional)

控制“飞行”的距离，该值为百分比，指的是当前窗口的百分比，`fly-in-bottom` 和 `fly-in-top` 是 `viewport` 的高度的百分比，`fly-in-left` 和 `fly-in-right` 是 `viewport` 的宽度百分比。

参数可选，默认值如下列表

特效|MOBILE|平板|PC
----|------|----|----
fly-in-top|25%|25%|33%
fly-in-bottom|25%|25%|33%
fly-in-left|100%|100%|100%
fly-in-right|100%|100%|100%

如下面的例子，元素将移动 `viewport` 高度的 25% 的距离。

```html
<div mip-fx="fly-in-bottom" data-fly-in-distance="25%"></div>
```

#### data-margin-start (optional)

决定元素滚动到页面什么位置触发特效，为百分值。

参数可选，默认值为 5%，如下面的例子，元素将移到页面 50% 的位置才触发特效。

```html
<div mip-fx="fly-in-bottom" data-margin-start="50%"></div>
```

### fade-in

当元素滚动到 viewport 的“适当”的位置，元素渐渐显示。

#### data-duration (optional)

控制动画的持续时间，单位为毫秒，可选，默认是 `1000ms`。

```html
<div mip-fx="fade-in" data-duration="1500"></div>
```


#### data-easing (optional)

控制动画的执行速度，可选，默认是 `ease-in`，可选项的值有如下四种

- `linear` - cubic-bezier(0, 0, 1, 1)
- `ease-in-out` - cubic-bezier(0.8, 0, 0.2, 1)
- `ease-in` - cubic-bezier(0.8, 0, 0.6, 1)
- `ease-out` - cubic-bezier(0.4, 0, 0.4, 1)

或者开发者也可以自定义 `cubic-bezier` 的值，如下

```html
<div
  mip-fx="fade-in"
  data-easing="linear"
></div>
<div
  mip-fx="fade-in"
  data-easing="cubic-bezier(0.65, 2, 1, 1)"
></div>
```

#### data-margin-start (optional)

决定元素滚动到页面什么位置触发特效，为百分值。

参数可选，默认值为 5%，如下面的例子，元素将移到页面 50% 的位置才触发特效。

```html
<div mip-fx="fade-in" data-margin-start="50%"></div>
```

### fade-in-scroll

元素会随着页面滚动而逐渐显示出来，直到完全显示，默认情况下，元素一旦完全显示之后，不会再次触发特效，除非设置 `data-repeat`。

#### data-margin-start (optional)

`data-margin-start` 决定了元素从 `viewport` 什么位置触发特效。是一个百分比数值，相对于 `viewport` 的高度。

默认值为 `0`。

#### data-margin-end (optional)

`data-margin-end` 决定了在什么位置完全显示元素，和 `data-margin-start` 构成了一个区间，mip 会自动计算位置与透明度的数值。同样，也是一个百分比，相对于 `viewport` 的高度。

`data-margin-end` 必须大于 `data-margin-start`，且必须小于等于 1，默认值为 `50%`。

```html
<div mip-fx="fade-in-scroll" data-margin-start="5%" data-margin-end="80%"></div>
```

#### data-repeat (optional)

默认情况下，元素一旦完全显示不会再触发渐隐渐显效果，而 `data-repeat` 可以让元素可以不断的触发特效，只需要在元素中写上这个属性。

```html
<div
  mip-fx="fade-in-scroll"
  data-margin-start="5%"
  data-margin-end="80%"
  data-repeat></div>
```

