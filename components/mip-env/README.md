# `mip-env` 环境容器

环境容器组件，可将内容仅在指定环境下做展示,否则不展示。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本| [https://c.mipcdn.com/static/v2/mip-env/mip-env.js](https://c.mipcdn.com/static/v2/mip-env/mip-env.js)

## 说明

开发者可以将仅希望在指定的"缓存环境" 、 "平台" 、 "UA" 、 "OS"下展示的内容使用`mip-env`包裹来实现。

## 示例

```html
  <div class='continer'>
    <mip-env scope={"cache":"baidu","dp":"baidu","ua":"uc","os":"ios"} >
      <div>只在符合scope设定的环境中才会展示此内容</div>
    </mip-env>
  </div>
```

## 属性

### scope

说明: scope中以json形式指定期望在哪些环境下才展示`mip-env`中的内容
必选: 否
类型: json字符串

param:

  cache
  说明: 缓存环境
  必选: 否
  取值: 'baidu' , 'sm' // 百度缓存 , 神马搜索缓存
  备注: 所有值不区分大小写。填写了cache键则必须有值才行

  dp
  说明: 分发平台(Distribution platform)
  必选: 否
  取值: 'baidu' , 'sm' // 百度平台 , 神马搜索平台
  备注: 所有值不区分大小写。填写了dp键则必须有值才行

  ua
  说明: userAgent
  必选: 否
  取值: 'baidu' , 'uc' , 'chrome' , 'safari' , 'firefox' , 'qq'
  备注: 所有值不区分大小写。填写了ua键则必须有值才行

  os
  说明: 系统
  必选: 否
  取值: 'ios' , 'android'
  备注: 所有值不区分大小写。填写了os键则必须有值才行


