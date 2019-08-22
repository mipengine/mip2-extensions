# mip-aio

手百端能力调起服务，注入此组件脚本后可访问 Box 对象。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-aio/mip-aio.js

## 使用方式

在开发 MIP 组件时如需要手百端能力的时候，可通过引用该组件获取相关的端能力服务，无法单独使用。

### 1. 脚本引入

在需要使用 Box 对象的页面 HTML 当中引入脚本:

`<script type="text/javascript" src="https://c.mipcdn.com/static/v2/mip-aio/mip-aio.js"></script>`

### 2. 使用

在开发 MIP 组件时，需要在组件的生命周期钩子里通过 `MIP.Services.getServicePromise('mip-aio')` 方法异步获得手百端能力服务。然后通过 `getBox()` 方法获得 Box 对象，`version` 为资源版本号，比如 `http://s.bdstatic.com/common/openjs/aio.js?v=201602` 中的 `201602`。

```js
const servicePromise = MIP.Services.getServicePromise('mip-aio')

servicePromise.then(service => {
  // getBox(version)
  service.getBox('201602').then(Box => {
    console.log(Box.version)
    console.log(Box.share)
  })
})
```

### 示例

在开发组件时可以参照如下方式使用此组件的手百端能力服务:

```js
export default MIPExample extends MIP.CustomElement {
  async build () {
    let aioService = await MIP.Service.getServicePromise('mip-aio')
    let box = await service.getBox()
    console.log(box.version)
  }
}
```
