# mip-orientation-observer 组件

用于监听设备移动的方向信息，发出 `alpha` `beta` `gamma` 事件，提供给其他 MIP 组件使用。

标题|内容
----|----
类型|通用
支持布局|nodisplay
所需脚本| https://c.mipcdn.com/static/v2/mip-orientation-observer/mip-orientation-observer.js

## 示例

### 基本使用

组件本身只会发出事件，不会做其他任何事情，所以需要结合 `mip-animation` 等组件使用。

截止到 2019 年 6 月，组件的兼容性如下：

![deviceOrientationCompatibility190604](https://boscdn.baidu.com/v1/assets/mip/temp/deviceOrientation190604.png)

可见，Safari 浏览器暂时不提供支持。同时，不同版本的手机操作系统和浏览器，以及不同的应用程序中内置的浏览器对 deviceorientation 事件的支持不尽相同。尤其在Android平台上，可能会出现有的设备正常工作，有的则毫无反应的情况。

所以，mip-orientation-observer 仅推荐结合 `mip-animation` 或 `mip-video` 等媒体组件使用。

## 属性

### alpha-range

说明：指定仅对设备绕 z 轴旋转指定范围角度内触发事件。当设备逆时针旋转时，alpha 值增加，当设备顺时针旋转时，alpha 值由 360 开始减少。

>注意：alpha 增加是逆时针旋转

![orientationZ](https://boscdn.baidu.com/v1/assets/mip/temp/orientationZ-deg.png)

必选项：若监听 `alpha` 事件必写，监听其他事件不必须

类型：2 个数值以空格连接，比如 alpha-range =“0 180”

默认值：0 到 360 度

### beta-range

说明：指定仅对设备绕 x 轴旋转指定范围角度内触发事件。当设备的顶部和底部与地球表面等距时 beta 值为 0°。当设备的顶部远离地球表面时，此值增加，当设备的顶部倾向地球表面时，此值减少，为负数。

![orientationX](https://boscdn.baidu.com/v1/assets/mip/temp/orientationX-deg.png)

必选项：若监听 `beta` 事件必写，监听其他事件不必须

类型：2 个数值以空格连接，比如 alpha-range =“0 180”

默认值：-180 到 180 度

### gamma-range

说明：指定仅对设备绕 y 轴旋转指定范围角度内触发事件。当设备的左右边缘与地球表面等距时 gamma 值为 0°。 当设备的右侧倾向地球表面时，此值增加，当设备的左侧倾向地球表面时，此值减少，为负数。

![orientationY](https://boscdn.baidu.com/v1/assets/mip/temp/orientationY-deg.png)

必选项：若监听 `gamma` 事件必写，监听其他事件不必须

类型：2 个数值以空格连接，比如 alpha-range =“0 180”

默认值：-90 到 90 度

### duration

说明：指明动画持续时间，与 `mip-animation` 的 `duration` 值相同

必选项：使用 `mip-animation` 的 `seekTo` 功能时，必须写明动画持续时间，用于组件计算并返回 `seekToTime`

类型：数字

默认值：无，不写则 `seekTo` 不生效

## 注意

### 关于角度范围

组件顺时针取弧长，作为触发范围。比如：

若 `alpha-range = "330 30"`，则取 330 度到 360 度和 0 度到 30 度的弧长作为事件触发范围，360 度与 0 度重合

若 `alpha-range = "90 30"`，则取 90 度到 360 度和 0 度到 30 度的弧长作为事件触发范围，即 30 度顺时针到 90 度的弧不触发事件

若 `beta-range = "-30 30"`，则取 -30 度到 0 度和 0 度到 30 度的弧长作为事件触发范围

若 `beta-range = "120 -120"`，则取 120 度到 180 度和 -180 度到 -120 度的弧长作为事件触发范围，180 度与 -180 度重合

若 `gamma-range = "-30 30"`，则取 -30 度到 0 度和 0 度到 30 度的弧长作为事件触发范围

`gamma-range` 仅支持 -90 度到 0 度和 0 度到 90 度的顺时针弧长监听

### 事件参数

`alpha` `beta` `gamma` 事件传出数据形如：

```js
orientData = {
  'angle': 30,
  'percent': 0.2333,
  'seekToTime': 120
}
```

可以在 `on` 事件中获取：

```html
<mip-orientation-observer
  on="alpha:anim1.seekTo(event.seekToTime)"
  layout="nodisplay">
</mip-orientation-observer>
```

### 关于为什么角度设置感觉和正常想象的不一样

组件的时间和角度设置与原生 `deviceorientation` 事件保持一致，组件可以实现为更符合人操作的方向和角度。但是为了使开发者使用原生事件时不发生混淆，所以与原生事件保持一致。

## 示例

```html
<p>alpha-range="330 30"，监听范围为手机顺时针和逆时针旋转各 30 度。手机放平，起始状态指向为 0 度，逆时针向左转 30 度到达 330，顺时针向右转 30 到达 30。动画初始状态为动画执行到一半时的状态，逆时针转动手机，alpha 值增大，方块向右移动；顺时针转动手机，alpha 值减小，方块向左。
</p>
<div class="test1"></div>
<mip-animation id="anim1" trigger="visibility">
  <script type="application/json">
    {
      "selector": ".test1",
      "keyframes": [{
        "transform": "translateX(100px)"
      },
      {
        "transform": "translateX(200px)"
      }],
      "duration": 120
    }
  </script>
</mip-animation>
<mip-orientation-observer
  alpha-range="330 30"
  duration="120"
  on="alpha:anim1.seekTo(event.seekToTime)"
  layout="nodisplay">
</mip-orientation-observer>

<div class="spacing"></div>

<p> beta-range="-30 30"，监听范围为手机顶部向下旋转和向上旋转各 30 度。手机放平，起始状态指向为 0 度，手机顶部向上 30 度到达 30，向下 30 到达 -30。动画初始状态为动画执行到一半时的状态，手机顶部向上转动，beta 值增大，方块向右移动；手机顶部向下转动，beta 值减小，方块向左。
</p>
<div class="test2"></div>
<mip-animation id="anim2" trigger="visibility">
  <script type="application/json">
    {
      "selector": ".test2",
      "keyframes": [{
        "transform": "translateX(100px)"
      },
      {
        "transform": "translateX(200px)"
      }],
      "duration": 120
    }
  </script>
</mip-animation>
<mip-orientation-observer
  beta-range="-30 30"
  duration="120"
  on="beta:anim2.seekTo(event.seekToTime)"
  layout="nodisplay">
</mip-orientation-observer>

<div class="spacing"></div>

<p> gamma-range="-30 30"，监听范围为手机右侧向下旋转和向上旋转各 30 度。手机放平，起始状态指向为 0 度，手机右侧向下 30 度到达 30，向上 30 到达 -30。动画初始状态为动画执行到一半时的状态，手机右侧向下转动，gamma 值增大，方块向右移动；手机右侧向上转动，gamma 值减小，方块向左。
</p>
<div class="test3"></div>
<mip-animation id="anim3" trigger="visibility">
  <script type="application/json">
    {
      "selector": ".test3",
      "keyframes": [{
        "transform": "translateX(100px)"
      },
      {
        "transform": "translateX(200px)"
      }],
      "duration": 120
    }
  </script>
</mip-animation>
<mip-orientation-observer
  gamma-range="-30 30"
  duration="120"
  on="gamma:anim3.seekTo(event.seekToTime)"
  layout="nodisplay">
</mip-orientation-observer>
```
