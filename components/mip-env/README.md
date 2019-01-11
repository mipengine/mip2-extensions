# `mip-env` 环境容器

环境容器组件，可将内容仅在指定环境下做展示,否则不展示。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本| [https://c.mipcdn.com/static/v2/mip-env/mip-env.js](https://c.mipcdn.com/static/v2/mip-env/mip-env.js)

## 说明

开发者可以将仅希望在指定的"缓存环境" 、 "平台" 、 "UA" 、 "OS"下展示的内容使用`mip-env`包裹来实现。

1、scope中所有value都支持多值,以逗号分隔
eg: scope={"ua":"uc,chrome","os":"!android,!ios"}

2、scope中所有value都支持"!"语法
eg: scope={"dp":"!baidu"} 表示在非百度平台下会展示出指定内容

3、多个“!”值的关系是且(&&),多个没有叹号值的关系是或(||)
eg:
scope={"ua":"!uc,!qq"}  => 当不是UC浏览器和qq浏览器时会展示出指定内容
scope={"ua":"uc,qq"} => 当是UC浏览器或qq浏览器时会展示出指定内容

4、当value中"!"与没有叹号同时存在时,以没叹号值为准
eg:
scope={"ua":"uc,qq,!baidu,!qq,!chrome"} 最终会被认为是 scope={"ua":"uc,qq"}

5、当需要判断的组件为`mip-fixed`的组件，需要添加targetId属性来标识`mip-fixed`组件，targetId值为`mip-fixed`的id值

## 示例

```html
  <div class='continer'>
    <mip-env scope={"cache":"baidu","dp":"baidu","ua":"!uc,!qq","os":"ios"} >
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
  备注: 
  1、所有值不区分大小写。填写了cache键则必须有值才行
  2、所有取值均可在前面加"!",表示非xx

  dp
  说明: 分发平台(Distribution platform)
  必选: 否
  取值: 'baidu' , 'sm' // 百度平台 , 神马搜索平台
  备注: 
  1、所有值不区分大小写。填写了dp键则必须有值才行
  2、所有取值均可在前面加"!",表示非xx

  ua
  说明: userAgent
  必选: 否
  取值: 'baidu' , 'baidubrowser', 'wechat', 'uc' , 'chrome' , 'safari' , 'firefox' , 'qq'
  备注: 
  1、所有值不区分大小写。填写了ua键则必须有值才行
  2、所有取值均可在前面加"!",表示非xx
  3、baidu表示百度app, baidubrowser表示百度浏览器

  os
  说明: 系统
  必选: 否
  取值: 'ios' , 'android'
  备注: 
  1、所有值不区分大小写。填写了os键则必须有值才行
  2、所有取值均可在前面加"!",表示非xx

### targetId

说明: 当scope判断不符合规则的元素为`mip-fixed`的组件时，需要添加targetId属性来标识`mip-fixed`组件，targetId值为`mip-fixed`的id值；
必选: 否
类型: string
