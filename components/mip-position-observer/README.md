# mip-position-observer 组件

`mip-position-observer` 组件用于在用户滑动屏幕的时候监听元素的位置信息，发出 `enter` `exit` `scroll` 事件，提供给其他 MIP 组件使用。

标题|内容
----|----
类型|通用
支持布局|nodisplay
所需脚本| https://c.mipcdn.com/static/v2/mip-position-observer/mip-position-observer.js

## 示例

### 基本使用

组件本身只会发出事件，不会做其他任何事情，所以需要结合 `mip-animation` 等组件使用。同时，由于组件会监听全局的 `scroll` 事件，尽管做了优化，频繁使用也难免造成性能问题，所以仅推荐结合 `mip-animation` 或 `mip-video` 等组件使用。

目前对于包含多个 iframe 的页面，如果某个 iframe 不可见但仍触发了滚动事件，则仍然会执行回调（主要用在动画中）。

## 属性

### target

说明：监听目标。监听指定 id 的元素，如果没有指定 id，默认为 `mip-position-observer` 组件的父元素

必选项：否

类型：元素 id

默认值：`mip-position-observer` 组件的父元素

### intersection-ratios

说明：目标元素出现在视口指定多少的时候触发 `enter` `exit` `scroll` 事件。取值范围是 [0, 1]，默认值是 0，含义解释如下：

* `intersection-ratios = 0` ，目标元素与视口交集为 0 是事件触发的临界点。目标元素的任一像素进入视口时触发 `enter` 事件，目标元素最后一像素离开视口时触发 `exit` 事件。

* `intersection-ratios = 0.5` ，目标元素与视口交集为元素的 %50 大小是事件触发的临界点。目标元素有 50% 进入视口时触发 `enter` 事件，目标元素在视口中剩余部分不足 50% 时触发 `exit` 事件。

* `intersection-ratios = 1` ，目标元素与视口交集为元素的 %100 大小是事件触发的临界点，即目标元素完全进入视口是临界点。目标元素全部进入视口时触发 `enter` 事件，目标元素任一像素离开视口时触发 `exit` 事件。

* `intersection-ratios = 0 1` 。0 是元素从上面 `enter/exit` 时事件的触发临界点，1 是元素从下面 `enter/exit` 时事件的触发临界点。即，如果目标元素从上面进入，任一元素进入视口触发`enter` 事件，最后一元素离开视口触发 `exit` 事件。如果目标元素从下面进入，目标元素完全进入视口触发`enter` 事件，目标元素任一像素离开视口时触发 `exit` 事件。

必选项：否

类型：数字类型

默认值：0

### viewport-margins

说明：指定事件触发在视口中的范围。

* `viewport-margins = 100px`，在距离视口上下各 100px 范围的时候触发上述事件，即“可见范围”为视口上下各减掉 100px 的范围

* `viewport-margins = 10vh`，在距离视口上下各 10vh 范围的时候触发上述事件，即“可见范围”为视口中间的 80vh 的范围

* `viewport-margins = 100px 10vh`，在距离视口上边缘 100px 和距离视口下边缘 10vh 的时候触发上述事件，即“可见范围”为视口上边减掉 100px，视口下边减掉 10vh 的范围

必选项：否

类型：字符串类型。结构为数字或数字加单位，单位为 px 或 vh。比如 10 或 10px 或 10vh，不加单位则默认是以 px 为单位

默认值：0

### once

说明：是否只触发一次事件，`enter` `exit` `scroll` 事件都只会触发一次。

必选项：否

类型：类似 html 的 disabled 元素，不需要赋值，只要存在即为有效

默认值：无

## 示例

```html
<style mip-custom>
  /* 自定义样式 */
  .placeholder {
    width: 100vw;
    height: 1000px;
  }
  #parent {
    border: 1px black solid;
  }
  .spacing {
    width: 100vw;
    height: 100px;
  }
  .test7 {
    background-color: brown;
    height: 100px;
    width: 100px;
  }
</style>
<div class="placeholder"></div>
<div id="parent">
  <p>7. 测试 viewport-margins：黑框为目标元素，黑框从上边缘进入视口，走到距离上边缘 100px 时事触发 enter 事件，动画播放；黑框走到距离下边缘 10% 的位置，再向下走触发 exit 事件，动画向右定格一段距离</p>
  <div class="test7"></div>
  <mip-animation id="anim7">
    <script type="application/json">
      {
        "selector": ".test7",
        "keyframes": [{
          "transform": "translateX(0px)"
        },
        {
          "transform": "translateX(600px)"
        }],
        "duration": 1200
      }
    </script>
  </mip-animation>
  <mip-position-observer
    intersection-ratios="1"
    viewport-margins="100px 10vh"
    on="enter:anim7.restart exit:anim7.seekTo(300)"
    layout="nodisplay">
  </mip-position-observer>
  </div>

  <div class="spacing"></div>
```
