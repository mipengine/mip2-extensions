# `mip-script` 自定义 js

允许开发者在 MIP 页面里编写 JavaScript 代码，使编写 MIP 页面更加灵活。

开发者可以在 `mip-script` 中通过自定义 JavaScript 代码，或调用数据观察方法 `MIP.watch` 轻松实现组件间的通信、或异步获取数据再通过数据修改方法 `MIP.setData` 来重新渲染页面、或在合适的时机发送业务日志等等，无法在组件做的事情，在允许的范围内都可以考虑使用 `mip-script` 编写自定义代码实现。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-script/mip-script.js

## 说明

形式上，只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。如同在 `<script></script>` 中写代码一样。如：

```html
<mip-script>
  console.log('mip-script executed')
</mip-script>
```

#### 要求：

1. 内容大小不能超过 2KB，否则无法运行

2. 全局变量限制使用
在 `<mip-script>` 中，理论上只允许进行数据相关的操作，不允许直接操作 DOM 。
因此在 mip-script 中写的 JS 代码将会运行在沙盒环境中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行。
mip-script 中对开发者的 JS 将用沙盒的 **严格模式** 进行全局变量替换和检测
白名单列表请参考：[严格模式的可用全局变量列表](
https://www.npmjs.com/package/mip-sandbox#%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F%E4%B8%8B%E7%9A%84%E6%B2%99%E7%9B%92%E5%AE%89%E5%85%A8%E5%8F%98%E9%87%8F)

## 示例一
基础用法，例如：

开发者编写的 JS 代码：

```html
<mip-script>
  console.log('mip-script executed')
  console.log(document.cookie)
  window.location.href = '/'
  var ele = document.getElementById('test')
</mip-script>
```

运行时的 JS 代码（沙盒环境包裹）：

```html
<script class="mip-script">
  console.log('mip-script executed');
  console.log(MIP.sandbox.strict.document.cookie);
  MIP.sandbox.strict.window.location.href = '/';
  var ele = MIP.sandbox.strict.document.getElementById('test');
</script>
```

可以看出，`console` 是安全的全局变量，可以正常使用；`window` 是受限制的全局变量，具体行为取决于 `MIP.sandbox.strict.window` 的开放程度（同理有 `document`）。

以上代码片段运行后，由于 `document.getElementById` 已被列为危险行为（涉及 DOM 操作），在沙盒中没有对应实现，因此运行时会报错，开发者需从代码中删除此语句，不允许调用该 API。

`mip-script` 组件执行后，（以 Chrome 浏览器为例），开发者可以在 Elements 面板中查找 DOM 节点树中 `class="mip-script"`  的 script 节点，查看运行在沙盒环境中的 JS 代码。

## 示例二
通过 `mip-script` 编写 JS 代码，观察 price 的数据变化，从而触发 title 的更新。同时利用 fetch API 异步获取数据，更新页面

```html
<mip-data>
  <script type="application/json">
    {
      "price": 20,
      "title": "初始值 Price = 20",
      "userList": []
    }
  </script>
</mip-data>

<p m-text="title" class="header"></p>
    
输入数字，单击回车可改变 price 的值<br />（price = input.value * price）:
<input type='text' on="change:MIP.setData({price:DOM.value*m.price})">

<p class="header">以下是异步获取的数据列表：</p>
<ul>
  <li m-text="userList[0]"></li>
  <li m-text="userList[1]"></li>
  <li m-text="userList[2]"></li>
</ul>

<mip-script>
  console.log('mip-script executed')

  MIP.watch('price', (newVal, oldVal) => {
    MIP.setData({
      title: `price = ${newVal}`
    })
  })

  fetch('./list.json')
    .then(data => {
      return data.json()
    })
    .then(data => {
      MIP.setData({
        userList: data.userList
      })
    })  
    .catch(e => {
      console.error(e.message); 
    })
</mip-script>
```

## 属性

无
