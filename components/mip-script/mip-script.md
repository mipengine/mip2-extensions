# `mip-script` 自定义 js

允许开发者在 MIP 页面里编写 JS 代码，让编写 MIP 页面更加灵活

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-script/mip-script.js

## 说明

形式上，只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。

> 要求：内容大小不能超过 2KB，否则无法运行


在 `<mip-script>` 中，理论上只允许进行数据相关的操作，不允许直接操作 DOM ，因此在 mip-script 中写的 JS 将会运行在沙盒环境中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行。mip-script 中对开发者的 JS 将用沙盒的 **严格模式** 进行全局变量替换和检测

白名单列表请参考：[严格模式的可用全局变量列表](
https://www.npmjs.com/package/mip-sandbox#%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F%E4%B8%8B%E7%9A%84%E6%B2%99%E7%9B%92%E5%AE%89%E5%85%A8%E5%8F%98%E9%87%8F)

## 示例

```html
<mip-script>
  console.log('mip-script executed')

  MIP.watch('price', function (newVal, oldVal) {
    console.log('price changed')
  })
</mip-script>
```

## 属性

无
