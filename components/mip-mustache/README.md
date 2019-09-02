

# mip-mustache mustache 模板

mip-mustache 模板引擎，是 MIP 封装了 Mustache.js 而形成的模板，以此来对用户提供定义模板的功能。

标题|内容
---|---
类型|通用
支持布局|不使用布局
所需脚本|https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js

## 定义 mip-mustache 模板

mip-mustache 模板需要通过 `<template type="mip-mustache">` 标签块进行定义，其中 template 是模板标签，`type="mip-mustache"` 用来标识此模板使用的模板引擎是 mip-mustache:

```html
<template type="mip-mustache">
  <div>你好，{{name}}</div>
</template>
```

mip-mustache 在 mustache.js 渲染结果的基础上增加了 MIP-HTML 规则校验和过滤，会将不符合规范的节点、属性直接过滤掉，以确保编译产出的 HTML 满足 MIP-HTML 规范。

比如下面的示例当中，style 标签在编译生成的 HTML 当中会直接被过滤掉：

```html
<template type="mip-mustache">
  <style>
    .hello { color: red; }
  </style>
  <div class="hello">你好，{{name}}</div>
</template>

<!-- 经 mip-mustache 编译后的产物为 -->
<div class="hello">你好，李雷</div>
```

MIP-HTML 规范中禁止了哪些标签和属性，请阅读文章：[MIP-HTML](https://www.mipengine.org/v2/docs/mip-standard/mip-html-spec.html)。

## Mustache 语法

Mustache 模板语法的详细用法可以参见[官网](https://github.com/janl/mustache.js/)，简单示例如下：

- `{{word}}` 变量 word 会在页面上显示一个 HTML 转义后的值
- `{{#section}}{{/section}}` 首先检测变量 section 是否存在，如果是数组就进行迭代
- `{{^section}}{{/section}}` 与上面的情况正相反，这是用来校验空值
- `{{{unescaped}}}` 页面上展示不转义的内容，不过这在使用过程中会有所限制
- `{{.}}` 将数据项的内容转义输出

## mip-mustache 使用方法

mip-mustache 定义好模板之后可能会有疑问，如何给模板传入数据？如何渲染？

在这里需要说明的是，mip-mustache 并不能单独使用，而应该作为其他组件的模板定义存在，这些组件使用了 mip-mustache 提供的 API，并且由这些组件自行决定如何传入数据，以及如何渲染。

比如在官方组件当中，以下组件都有使用到 mip-mustache:

- [mip-list](https://www.mipengine.org/v2/components/dynamic-content/mip-list.html) 列表组件，利用 mip-mustache 定义列表项模板；
- [mip-infinityscroll](https://www.mipengine.org/v2/components/dynamic-content/mip-infinityscroll.html) 无限滚动加载列表组件，利用 mip-mustache 定义列表项模板；
- [mip-modal](https://www.mipengine.org/v2/components/dynamic-content/mip-modal.html) 模态框组件，利用 mip-mustache 定义对话框的显示布局；

以 mip-list 为例，可以在其组件内部定义列表项的渲染模板：

```html
<mip-list>
  <script type="application/json">
  {
    "items": [
      {
        "name": "李雷"
      },
      {
        "name": "韩梅梅"
      }
    ]
  }
  </script>
  <template type="mip-mustache">
    <div>你好，{{name}}</div>
  </template>
</mip-list>
```
