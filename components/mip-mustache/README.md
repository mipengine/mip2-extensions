# mip-mustache

mustache 模板引擎

标题|内容
----|----
类型|通用
支持布局|不使用布局
所需脚本|https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js

## 说明

入口文件中 `MIP.registerTemplate('mip-mustache', Mustache)` 是注册的作用，模板注册和普通组件注册是不一样的，需要手动调用注册函数，注册名就是下述 type 字段的值  

## 示例

所有 template 模板无法单独使用，需要配合 MIP.templates 一起使用，具体示例可参见 [mip-list 的 renderTemplate 方法](https://github.com/mipengine/mip2-extensions/blob/master/components/mip-list/mip-list.js#L77)

## 属性

### type

说明：模板引擎类型，代表本组件封装的模板引擎类型  
必选项：是  
类型：字符串  
