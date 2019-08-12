# mip-aio

手百端能力调起服务，注入此组件脚本后可访问 Box 对象。第三方脚本写到 window 上的对象由于不在 sandbox 白名单中而无法使用，此处进行封装。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-aio/mip-aio.js

## 使用方式

此组件是一个服务不可单独使用，需要结合其他组件使用。

### 1. 脚本引入

在需要使用 Box 对象的组件中引入:

`<script type="text/javascript" src="https://c.mipcdn.com/static/v2/mip-aio/mip-aio.js"></script>`

### 2. 使用

通过 `MIP.Services.getServicePromise('mip-aio')` 异步获得服务。通过 `getBox()` 方法获得 Box 对象，`version` 为资源版本号，比如 `http://s.bdstatic.com/common/openjs/aio.js?v=201602` 中的 `201602`。

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
