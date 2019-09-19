# mip-action-macro MIP 交互行为拓展

为 MIP on 表达式拓展 1）行为封装 2）方法执行前置判断 3）有限运算能力 等功能。

标题|内容
----|----
类型|
支持布局| nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-action-macro/mip-action-macro.js](https://c.mipcdn.com/static/v2/mip-action-macro/mip-action-macro.js)

## 示例

mip-action-macro 能够将 MIP on 表达式当中的行为部分封装起来，供多个事件监听调用。

### 基本使用

它的基本使用方法如下所示：

```html
<mip-action-macro
  id="simple-macro-id"
  on="execute:MIP.navigateTo(url='https://www.baidu.com', target='_blank')"
></mip-action-macro>

<button on="tap:simple-macro-id.execute">点击跳转百度首页</button>
```

可以看到，`<mip-action-macro>` 对外暴露了 `execute` 方法，因此可以在 on 表达式里面通过 `id.execute()` 来执行通过 `<mip-action-macro>` 封装起来的其他行为。`execute` 方法会触发 `<mip-action-macro>` 的 `execute` 事件，因此可以通过定义 `<mip-action-macro>` 的 on 表达式来进行行为的封装。在上面的例子当中，我们将 `MIP.navigateTo()` 方法封装了起来，因此我们只需要执行 `simple-macro-id.execute` 就可以触发页面跳转。

### 参数传递

`<mip-action-macro>` 的 `execute` 方法可以传入参数，其参数的格式与 `MIP.navigateTo`、`MIP.scrollTo` 等方法的格式保持一致。传参的方法及参数的使用如下所示：

```html
<mip-action-macro
  id="simple-macro-id"
  on="execute:MIP.navigateTo(url=event.url, target='_blank')"
></mip-action-macro>

<button on="tap:simple-macro-id.execute(url='https://www.baidu.com')">点击跳转百度首页</button>
<button on="tap:simple-macro-id.execute(url='https://www.mipengine.org')">点击跳转 MIP 官网首页</button>
```

可以看到，我们在调用 `simple-macro-id.execute` 方法的时候传入了 `url='xxx'` 的参数，这个参数的值可以在 `<mip-action-macro>` 的事件回调当中通过 `event.url` 获取。也就是说，`<mip-action-macro>` 可以传入一个对象作为参数，这个对象可以在事件回调里面通过 `event` 关键字获取。

[notice] `<mip-action-macro>` 的参数只支持按值传递，不支持按引用传递。


### 前置判断

`<mip-action-macro>` 提供了 `condition` 属性来进行行为触发的前置判断。`condition` 可以传入一个符合 [MIP 表达式规范](https://www.mipengine.org/v2/docs/interactive-mip/expression.html) 的表达式，在调用 execute 方法时，会首先计算该表达式，只有当运算结果为真（true, 1, '123' 等等 `!!val === true` 的结果）时，才会继续触发 `execute` 事件，反之则触发 `mismatch` 事件。

```html
<mip-data id="simpleData" scope>
  <script type="application/json">
  {
    "baidu": "https://www.baidu.com",
    "mipengine": "https://www.mipengine.org"
  }
  </script>
</mip-data>
<mip-action-macro
  id="simple-macro-id"
  on="execute:MIP.navigateTo(url=event.url, target='_blank')"
  condition="event.url === simpleData.mipengine"
></mip-action-macro>

<button on="tap:simple-macro-id.execute(url=simpleData.baidu)">点击跳转百度首页</button>
<button on="tap:simple-macro-id.execute(url=simpleData.mipengine)">点击跳转 MIP 官网首页</button>

```

在这个例子当中，我们设置了条件 `event.url === simpleData.mipengine`，因此点击跳转百度首页时会不执行，只有当点击跳转 MIP 官网首页时才会执行。

### 有限运算能力

`<mip-action-macro>` 支持在 on 事件回调当中进行有限的运算，除了原先就支持的 `MIP.setData` 内部支持 MIP 表达式进行运算之外，目前还开放了 [全局元素方法](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html#%E5%85%A8%E5%B1%80%E5%85%83%E7%B4%A0%E6%96%B9%E6%B3%95) 和 [全部特殊对象方法](https://www.mipengine.org/v2/docs/interactive-mip/event-and-action.html#%E7%89%B9%E6%AE%8A%E5%AF%B9%E8%B1%A1%E6%96%B9%E6%B3%95) 的运算能力。

以 `MIP.navigateTo` 为例，我们可以在 `<mip-action-macro>` 当中进行一些简单的运算：

```html
<mip-data id="simpleData" scope>
  <script type="application/json">
  {
    "protocol": "https://",
    "baidu": "www.baidu.com"
  }
  </script>
</mip-data>
<mip-action-macro
  id="simple-macro-id"
  on="execute:
    MIP.navigateTo(
      url=simpleData.protocol + event.url,
      target='_blank'
    )"
></mip-action-macro>

<button on="tap:simple-macro-id.execute(url=simpleData.baidu)">点击跳转百度首页</button>

```

可以看到，`MIP.navigateTo` 的 `url` 参数由 `simpleData.protocol + event.url` 字符串拼接而成，点击按钮仍然能正常跳转到百度首页，由此可见有限的计算能力得到了支持。事实上，只要计算表达式满足 [MIP 表达式](https://www.mipengine.org/v2/docs/interactive-mip/expression.html)的要求，同时计算的结果满足方法的参数数据要求时，就可以正常工作了。

## 属性

### id

说明：节点 ID<br>
必选项：是<br>
类型：字符串<br>

### condition

说明：触发事件的前置判断条件<br>
必选项：否<br>
类型：字符串<br>
取值范围：符合 MIP 表达式的字符串<br>

## 事件

### execute

说明：调用该组件 `execute` 方法时默认触发的事件，当定义了 `contition` 条件时，则会在 `condition` 表达式执行结果为`真`时触发。<br>
数据：调用该组件 `execute` 方法时传入的对象。

### mismatch

说明：当定义了 `condition` 属性，并且其执行 `condition` 表达式的结果为`非真`时触发。<br>
数据：调用该组件 `execute` 方法时传入的对象。


## 方法

### execute

说明：执行 `<mip-action-macro>` 所封装的方法，可传入一个对象作为参数，这个对象能够在 `<mip-action-macro>` 的事件回调和 `condition` 表达式中通过 `event` 对象获取。<br>
注意：传入的参数仅支持按值传递，不支持按引用传递。传入的值会通过 JSON.stringify 和 JSON.parse 进行序列化和反序列化，得到的结果才能够通过 `event` 对象获取。



