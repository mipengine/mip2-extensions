# mip-fullpage-scroll

mip 全屏滚动组件

| 标题     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 类型     | 通用                                                    |
| 支持布局 | N/A                                                     |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-fullpage-scroll/mip-fullpage-scroll.js |

## 示例

默认横向滑动模式

```html
<mip-fullpage-scroll>
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
```

支持纵向滑动模式

```html
<mip-fullpage-scroll direction="vertical">
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
```

可以配置导航控件

```html
<mip-fullpage-scroll navigateable>
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
```

可以默认指定初始展示 section

```html
<mip-fullpage-scroll navigateable focus="2">
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
```

可以设置可循环模式，并且设置自动播放，以及设置播放的频率

```html
<mip-fullpage-scroll navigateable focus="2" loop autoplay timeout="4000">
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
```

可以通过 on 事件机制外层组件相互通信

```html
<mip-fullpage-scroll
  navigateable
  focus="2"
  loop
  autoplay
  timeout="4000"
  on="change:MIP.setData({
    currentIndex: event.index
  })"
>
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
<mip-data>
  <script type="application/json">
    {
      "currentIndex": 2
    }
  </script>
</mip-data>
<mip-fixed still id="test-nav">
  <p><span>当前页：</span><span m-text="currentIndex">2</span></p>
  <button on = "tap:test.back">上一页</button>
  <button on = "tap:test.goTo(2)">跳转到第二页</button>
  <button on = "tap:test.next">下一页</button>
</mip-fixed>
```

## 事件说明

### Actions

#### goTo

指定进入到哪个 section 页面

用法如下：

```html
<button on = "tap:test.goTo(2)">跳转到第二页</button>
```

#### back

指定切换到上一个 section 页面

用法如下：

```html
<button on = "tap:test.back">上一页</button>
```

#### next

指定切换到下一个 section 页面
用法如下：

```html
<button on = "tap:test.next">下一页</button>
```

### Events

#### change

切换界面的事件回调，其中 event 对象包含数据当前切换的数据，如：`{index: 2}`， 用法如下：

```html
<mip-fullpage-scroll
  on="change:MIP.setData({
    currentIndex: event.index
  })"
>
  <section>section 1 的内容</section>
  <section>section 2 的内容</section>
  <section>section 3 的内容</section>
  <section>section 4 的内容</section>
</mip-fullpage-scroll>
<mip-data>
  <script type="application/json">
    {
      "currentIndex": 2
    }
  </script>
</mip-data>
<mip-fixed still id="test-nav">
  <p><span>当前页：</span><span m-text="currentIndex">2</span></p>
</mip-fixed>
```

> 可用于一些统计相关的事情，注意，所有和 mip-fullpage-scroll 组件配合使用的组件，layout 都必须设置为 "nodisplay"，否则会打乱全屏的布局，在使用时也可以通过 custom style 对 mip-fullpage-scroll 组件进行自定义样式的升级，甚至可以修改切换动画。

## 属性

### direction

说明：标明滚动的方向

必选项：否

类型：`string`

默认值：`horizontal`

### navigateable

说明：是否支持导航控件

必选项：否

类型：`boolean`

默认值：`false`

### focus

说明：指定初始展示的界面

必选项：否

类型：`number`

默认值：`1`

### loop

说明：是否可以循环切换

必选项：否

类型：`boolean`

默认值：`false`

### autoplay

说明：是否自动播放

必选项：否

类型：`boolean`

默认值：`false`

### timeout

说明：自动播放的时间间隔

必选项：否

类型：`number`

默认值：`3000`
