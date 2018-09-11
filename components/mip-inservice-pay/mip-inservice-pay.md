# `mip-inservice-pay` 极速服务 支付组件

为mip站长 提供支付调起服务组件，支持百付宝、支付宝、微信
![MIP 支付流程图](https://user-images.githubusercontent.com/7043799/41702452-c470f1f8-7562-11e8-82a1-b9accf41f3ff.png)

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-inservice-pay/mip-inservice-pay.js

## 说明
需在传入属性`pay-config`数据配置

## 示例

```html
<mip-data>
  <script type="application/json">
    {
      "payConfig":{
        "subject":"支付商品",
        "fee": 300,
        "sessionId":"c8fbd3e0-a617-4eac-84b3-1f289c5ce857",
        "redirectUrl":"https://api.example.com/pay/verifypay",
        "endpoint":{
          "baifubao":  "https://api.example.com/pay/baifubao",
          "alipay":  "https://api.example.com/pay/alipay",
          "weixin":  "https://api.example.com/pay/weixin"
        },
        "postData":{
          "orderId": 235,
          "token": "xxxx",
          "anydata":"anydata"
        }
      }
    }
  </script>
</mip-data>
<mip-inservice-pay m-bind:pay-config="payConfig" id="payDialog"></mip-inservice-pay>
<button on="tap:payDialog.toggle">确定支付</button>
```

## 属性 `pay-config`
### payConfig.subject
说明：订单名称
必选项：是  
类型：`string`  
示例："蓝犀牛订单"

### payConfig.fee
说明：订单金额
必选项：是  
类型：`number`  
示例：300元


### payConfig.sessionId
说明：会话凭证, 请求支付接口时传入后台进行校验
必选项：是  
类型：`string`  
示例：300元

### payConfig.redirectUrl 
说明：微信内支付成功后跳转链接
必选项：是
类型：`string`  
示例："http://www.baidu.com/"

### payConfig.endpoint  {#endpoint}
说明：后端源站支付接口链接，需要使用 `https://` 或者 `//` 开头的源站地址，需要接口支持 HTTPS ，使用 POST 形式发送数据 
必选项：是
类型：`object`  
示例：{"baifubao":"https://api.example.com/pay.php", alipay:xxx, weixin:xxx}
说明：[后端跨域说明](#cors) 、[后端数据说明](#data) 、[会话凭证 sessionId](#sessionId)



## 注意事项

### 1.怎样 动态配置更改`payConfig`
因数据配置在`mip-data`中以及数据通过 `props`传递给 支付组件，故可通过 `MIP.setData`动态设置`postData`、`sessionId`等数据

<a id="cors" name="cors" href="#cors"></a>
### 2. 后端需要支持 CORS + `withCredentials`

- [CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
- [`withCredentials` 附带身份凭证的请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#%E9%99%84%E5%B8%A6%E8%BA%AB%E4%BB%BD%E5%87%AD%E8%AF%81%E7%9A%84%E8%AF%B7%E6%B1%82)

支付组件（mip-simple-pay）已经在前端发送请求时处理了 `withCredentials` ，需要对应的接口服务响应头设置：

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: 对应请求的 origin`

注意：出于安全考虑请对来源的 `origin` 进行判断，并正确的返回 `Access-Control-Allow-Origin` 字段，不能为 `*` 。

<a id="data" name="data" href="#data"></a>
### 3. 后端数据说明
请求：

名称 | 说明
--- | ---
请求链接 | [payConfig.endpoint](#endpoint)
请求类型 | POST
请求参数 | `{sessionId: '会话凭证', state: '需要在支付完成后回传给 MIP oob 回调链接中', ...}`

异常情况，`status` 非 `0` 时为失败：
```json
{
  "status": 403,
  "msg":"支付错误信息"
}
```

成功：

** 支付类型为 `nomal|alipay` 时**

```json
{
  "status": 0,
  "data": {
    "url": "https://付款链接"
  }
}
```

** 支付类型为 `weixin`时**

- 微信外环境
```json
{
  "status": 0,
  "data": {
    "url": "https://付款链接"
  }
}
```

- 微信内环境

[微信内判断方法](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_5)
```javascript
{
  "status": 0,
  "data": {
    "appId": "wx3dxxxxxxxx",
    "timeStamp": "1527508907",
    "nonceStr": "ASDFWSACSDCDSGA",
    "package": "prepay_id=wx3dxxxxxxxx",
    "signType": "MD5",
    "paySign": "SADF98S0A9D00A9S09A0SDCASD",
    "timestamp": "1527508907"
  }
}
```

注意：付款成功后回调链接应该为源站后端订单处理链接，如：`https://支付链接?callback=urlencode('https://api.mipengine.org/order?id=1')` ，回调链接（`https://api.mipengine.org/order?id=1`）在支付完成后处理完成订单数据后重定向到 `统一支付成功页面`

格式如：
```
https://xiongzhang.baidu.com/opensc/wps/payment?id=熊掌号ID&redirect=显示支付完成页面，必须是MIP页面
```


<a id="sessionId" name="sessionId" href="#sessionId"></a>
### 4. 会话凭证 sessionId

由于在 iOS 对跨域透传 `cooke` 的限制（<https://webkit.org/blog/7675/intelligent-tracking-prevention/>），由登录组件统一记录会话标识，并透传给支付组件，在发送支付请求时携带，后端应该优先使用 `cookie > sessionId` 校验登录状态。

### 4. 百度搜索结果页降级处理

在百度搜索页打开使用该组件页面时，由于有些支付密码输入框在 `iframe` 框架下有问题，在调用[提交支付接口](#action-pay)时做了降级处理，处理方式为跳转源站。包括以下设备、浏览器：
- iOS设备下的手百App
