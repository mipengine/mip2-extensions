

# mip-mustache 部分

mip-mustache 模板引擎，mip-mustache 是 MIP 封装了 Mustache.js 而形成的模板，以此来对用户提供模板功能

入口文件中 `MIP.registerTemplate('mip-mustache', Mustache)` 是注册的作用，模板注册和普通组件注册是不一样的，需要手动调用注册函数，注册名就是下述 template 中 type 字段的值

标题|内容                                                        
---|---
类型|通用
支持布局|不使用布局
所需脚本|https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js

## Mustache 语法

Mustache 模板语法的详细用法可以参见[官网](https://github.com/janl/mustache.js/)，简单示例如下：

- `{{word}}` 变量 word 会在页面上显示一个 HTML 转义后的值
- `{{#section}}{{/section}}` 首先检测变量 section 是否存在，如果是数组就进行迭代
- `{{^section}}{{/section}}` 与上面的情况正相反，这是用来校验空值
- `{{{unescaped}}}` 页面上展示不转义的内容，不过这在使用过程中会有所限制

## templates 用法

模板的使用比想象中的要复杂，在这里简单做一下说明

- 下述示例代码是一个简单的模板代码，模板类型是 mip-mustache（type 字段指出类型）
- mip-mustache 是 MIP 封装了 Mustache 而形成的模板，以此来对用户提供模板功能
- 用户可以自己封装某种模板，然后将 type 改为相应的值即可使用
- 模板的使用少不了数据的驱动，数据如何呈现到页面上，将在下面进行说明

### templates 的 type 属性

说明：模板引擎类型  

必选项：是  

类型：字符串

## 使用示例

```html
<template type="mip-mustache">
  Hello {{world}}!
</template>
<script src="https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js"></script>
```

所有 template 模板（虽然目前就一种 mip-mustache ）都无法单独使用，需要配合 MIP.templates 一起使用。调用 MIP.templates 的一些方法就可以找到页面中的 template 元素，并把数据给到模板，最后再呈现到页面上。具体示例可参见 [mip-list 的 renderTemplate 方法](https://github.com/mipengine/mip2-extensions/blob/master/components/mip-list/mip-list.js#L77)

## 限制

模板的书写需要具有一定的规范，不合规范的模板将不会生效，目前 mip-mustache 不允许模板中使用以下标签：applet、audio、base、embed、form、frame、frameset、iframe、img、link、meta、object、script、style、svg、template、video

因此 template 是不能嵌套 template 的

## 注意点

### 单引号和双引号的问题

```html
<mip-data>
  <script type="application/json">
    {
      "count": 0
    }
  </script>
</mip-data>
<template type="mip-mustache">
  <p>当前按钮点击次数：<span m-text="count"></span></p>
  <button on="tap:MIP.setData({count: '{{variable}}'})">点我</button>
</template>
```

上述简单示例中，variable 变量如果是一个字符串，并且含有单引号，那么上述代码将不能正常运行，因为模板解析后的 HTML 代码不是正确的 on 语法代码。如果有合适的解决方案，欢迎来提 issue

### 文本 {{ 的显示问题

这个问题是指单纯想在模板代码里展示 `{{`、`{{{` 的情况，由于模板会对此做特殊处理，即使用户使用 `&lcub;&lcub;` 来代替也无法在模板中输出两个大括号。所以对于这种文本建议使用其他符号代替
