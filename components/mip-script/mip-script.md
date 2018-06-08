# `mip-script` 自定义 js

允许开发者在 MIP 页面里编写 JS 代码，让编写 MIP 页面更加灵活

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-script/mip-script.js

## 说明

只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。

JS 代码会运行在沙盒环境中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行

[可用全局变量列表](
https://www.npmjs.com/package/mip-sandbox#%E5%8F%AF%E7%94%A8%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F)

## 示例

```html
<mip-script>
  MIP.watch('price', function (newVal, oldVal) {
    console.log('price changed')
  })
</mip-script>
```

## 属性

无
