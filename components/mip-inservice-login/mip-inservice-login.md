# `mip-inservice-login`

## 说明

MIP网站中百度pass账号的登录&授权

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-inservice-login/mip-inservice-login.js

## 流程图

![mip-inservice-login 登录组件流程图](https://user-images.githubusercontent.com/3872051/38136969-6a2639b4-3454-11e8-8761-dd551d3b4692.png)


## 示例

### 基本用法

与`mip-bind`配合，在html中使用`mip-data`

```html
<mip-data>
    <script type="application/json">
        {
            "info": {},
            "config": {
                appid: '熊掌号id',
                clientId: '熊掌号开发者id',
                id: 'info',
                autologin: false,
                endpoint: 'https://www.example.com/api/userinfo.php',
                isGlobal: false
            }
        }
    </script>
</mip-data>
<mip-my-example id="example" m-bind:info="info"></mip-my-example>

<mip-inservice-login
    id="log"
    m-bind:config="config"
    on="login:example.login logout:example.exit"
>
</mip-inservice-login>

<button on="tap:log.login">登录</button>
<button on="tap:log.logout">退出</button>

```

`mip-my-example`组件代码示例：

```html
<template>
    <div class="wrap">
        <h3>这是一个渲染片段示例</h3>
        <p>默认未登录，由用户交互（如点击按钮）触发登录/登出</p>
        <hr />
        <div v-if="info.isLogin">hi，{{info.userInfo.nickname}}，欢迎回来！<span  style="color:#f00;" on="tap:log.logout">退出</span></div>
        <div v-else>你没有<span  style="color:#f00;" on="tap:log.login">登录</span>哦。</div>
    </div>
</template>


<script>
export default {
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    mounted () {
        // 自定义login事件
        this.$element.customElement.addEventAction('login', event => {
            // 这里可以输出登录之后的数据

            // 获取用户信息
            event.userInfo;
            // 后端交互会话标识
            event.sessionId;
        });
        // 自定义exit事件
        this.$element.customElement.addEventAction('exit', event => {
            console.log('登出了');
        });
    }
}
</script>
```

和`mip-bind`配合使用注意：

1. 必须在`mip-inservice-login`组件的`config`属性里设置`id` 的值，该值与组件id的值可以不一样， 如示例中的`info`。
2. 必须在 `<mip-data>` 配置数据中设置一个以`mip-inservice-login`的`config`属性里的`id` 为键名（`key`）的对象数据， 如示例中的`info`。
3. 如果这个数据是全局共享数据，需要设置`mip-inservice-login`的`config`里的`isGlobal`为`true`。共享数据的个用法，请参照文档[MIP 2.0 的数据和应用](https://github.com/mipengine/mip2/blob/master/docs/components/data-and-method.md)。
4. 在请求登录（`type=login`）、检查是否登录（`type=check`）、退出（`type=logout`）成功时，会调用 `MIP.setData` 设置数据，数据结构为：

```json
{
    "id": {
        "isLogin": Boolean,
        "userInfo": Response.data,
        "sessionId": String
    }
}
```


### 实现个人中心

个人中心需要自动登录的功能


```html
<mip-data>
    <script type="application/json">
        {
            "info": {
                userInfo: {
                    "nickname": "",
                    "province": ""
                }
            },
            "config": {
                appid: '熊掌号id',
                clientId: '熊掌号开发者id',
                id: 'info',
                autologin: true,
                endpoint: 'https://www.example.com/api/userinfo.php',
                isGlobal: false
            }
        }
    </script>
</mip-data>

<mip-inservice-login id="log" m-bind:config="config"></mip-inservice-login>

<ul>
    <li>
        hi，<span m-text="info.userInfo.nickname"></span>，你上次登录地点为 <span m-text="info.userInfo.province"></span>。
    </li>
    <li>
        <a href="/order/list.html" data-type="mip">订单中心</a>
    </li>
    <li>
        <div on="tap:log.logout">退出</div>
    </li>
</ul>

```

说明：

1. 将`mip-inservice-login`组件的`config`属性里，`autologin`设置为`true`。

## 属性

### config

说明：组件初始化所必须的配置数据

必选项：是

类型： `Object`

示例：通过`m-bind:config="配置数据"`将该属性传入组件，配置数据的示例说明如下，

```json
{
    "appid": "12345678", // 熊掌号id，string, 必须
    "clientId": "R6HzvBSGAvkFMUrhELUZayfH2No86t1k", // 熊掌号开发者client_id， string，必须
    "id": "demo", // 数据的键名（key），当登录信息发生变更时，将更新mip-data里已该值为键名（`key`）的对象数据
    "isGlobal": false, // 需要更新的mip-data里已id为键名的对象数据是否为 全局数据，默认值false
    "autologin": false, // 页面打开后未登录状态下自动跳转登录，常用于必须登录状态下才可以访问的页面 , boolean, 默认值false
    "endpoint": "https://api.example.com/user/info.php", // 后端源站数据接口链接，需要使用 `https://` 或者 `//` 开头的源站地址，需要接口支持 HTTPS ，使用 POST 形式发送数据 , 必须
}

```
其中，`endpoint`的说明，请参阅[后端跨域说明](#cors) 、[后端数据说明](#data) 、[会话凭证 sessionId](#sessionId)



## 方法和事件

### 登录方法 - `<div on="tap:登录组件id.login(redirectUrl, replace)">`

在其他元素中绑定点击时打开登录弹层/跳转登录页面。

该方法接收两个参数：

* `redirectUrl`: string, 登录成功后的跳转地址，该地址必须与当前页面`同源`，不传默认跳转回当前页。
* `replace`: boolean，登录成功后的跳转地址是否replace当前页，默认会替换，即当前页将不产生历史记录。目前，replace的设置只在`登录弹层`的情况下生效。

注意：

1. 该方法会根据当前用户`登录百度账号`的状态而打开登录弹层（已登录）或者 重新打开一个熊掌号登录页面（未登录），在登录成功后会透传 `code` 跳转到指定的页面，组件重新使用 `code` 参数去请求后端接口，这将导致当前页面未存储的数据丢失，如：表单用户填写内容。
2. 在已经登录成功的情况下，再次触发login方法，该方法不会执行。

### 登出方法 - `<div on="tap:登录组件id.logout">`

在其他元素中绑定点击时请求退出接口。

注意：该方法不会跳转页面，异步的调用 `endpoint` 接口去退出，并触发登录组件元素中的 `logout:其他组件id.其他组件行为` 事件。

### 登录成功事件 - `<mip-inservice-login on="login:其他组件id.其他组件行为">`

在登录成功时调用其他组件的组件行为。

### 登录失败事件 - `<mip-inservice-login on="error:其他组件id.其他组件行为">`

在登录请求后端返回值错误时触发。

### 登出成功事件 - `<mip-inservice-login on="logout:其他组件id.其他组件行为">`

在退出登录时（由 `on="tap:组件id.logout"` 调用触发）调用其他组件的组件行为。

## 注意事项

### 1. 配置百度熊掌号-网页授权域名

在[熊掌号运营管理平台](https://xiongzhang.baidu.com/mp/dashboard/devsetting)添加两个网页授权域名：

1. 网站主域名 - 需要在登录组件的域名
2. MIP-Cache 域名：`mipcache.bdstatic.com`
3. MIP-Cache 站点域名，规则：`域名（.换成-）.mipcdn.com`，如：
    - `www.mipengine.org` -> `www-mipengine-org.mipcdn.com`
    - `demo.www.mipengine.org` -> `demo-www-mipengine-org.mipcdn.com`

<a id="cors" name="cors" href="#cors"></a>
### 2. 后端需要支持 CORS + `withCredentials`

- [CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
- [`withCredentials` 附带身份凭证的请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#%E9%99%84%E5%B8%A6%E8%BA%AB%E4%BB%BD%E5%87%AD%E8%AF%81%E7%9A%84%E8%AF%B7%E6%B1%82)

登录组件（mip-inservice-login）已经在前端发送请求时处理了 `withCredentials` ，需要对应的接口服务响应头设置：

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: 对应请求的 origin`

**注意：** 出于安全考虑请对来源的 `origin` 进行判断，并正确的返回 `Access-Control-Allow-Origin` 字段，不能为 `*` 。

<a id="data" name="data" href="#data"></a>
### 3. 后端数据说明

#### 页面加载完成检查用户数据

请求：

名称 | 说明
--- | ---
请求链接 | `config.endpoint`，必须支持`https`
请求类型 | POST
请求参数 | `{type: 'check', sessionId: '会话凭证'}`

未登录返回值说明：

```json
{
    "status": 0,
    "sessionId": "会话凭证，必须返回",
    "data": null
}
```

已登录返回值，整个返回值的 `data` 字段将认为是用户数据，在模板渲染时使用该数据渲染：

```json
{
    "status": 0,
    "sessionId": "会话凭证，必须返回",
    "data": {
        "nickname": "mipengine",
        "key2": "value2"
    }
}
```

注意：上面 `data.name` 只是示例，具体什么数据请前、后端统一约定。

#### 百度账号登录&授权

请求：

名称 | 说明
--- | ---
请求链接 | `config.endpoint`，必须支持`https`
请求类型 | POST
请求参数 | `{type: 'login', code: '熊掌号授权code', redirect_uri: '回调链接'}`

源站后端服务需要使用 `code` 和 `redirect_uri` 参数去请求 [获取网页授权 access_token](http://xiongzhang.baidu.com/open/wiki/chapter2/section2.2.html?t=1522129995153) 、[获取授权用户信息](http://xiongzhang.baidu.com/open/wiki/chapter2/section2.4.html?t=1522129995153) 接口，并和源站的用户关联、记录用户登录状态。

处理成功，认为已登录，整个返回值的 `data` 字段将认为是用户数据，在模板渲染时使用该数据渲染：

```json
{
    "status": 0,
    "sessionId": "会话凭证，必须返回",
    "data": {
        "nickname": "mipengine",
        "key2": "value2"
    }
}
```

如果 `status` 不为 `0` 触发 `error` 事件，如：
```json
{
    "status": 403
}
```

#### 退出

请求：

名称 | 说明
--- | ---
请求链接 | `config.endpoint`，必须支持`https`
请求类型 | POST
请求参数 | `{type: 'logout'}`

返回值说明：

```json
{
    "status": 0,
    "data": {
        "url": "https://www.example.com 退出成功跳转的链接地址 可选",
        "title": "主页 自定义标题 可选"
    }
}
```

<a id="sessionId" name="sessionId" href="#sessionId"></a>
### 4. 会话凭证 sessionId

由于在 iOS 对跨域透传 `cooke` 的限制（<https://webkit.org/blog/7675/intelligent-tracking-prevention/>），在前端组件请求后端接口时（`type=check` 和 `type=login`），由后端生成当前会话唯一凭证并记录到服务端，把凭证返回前端 `response.sessionId`，前端组件将在 `localStorage` 中缓存下来，在下次发后端接口请求时携带该凭证，后端就当优先使用 `cookie/session` 验证，不存在时获取 `POST` 参数中的 `sessionId` 去校验。

注意：本地 `localStorage` 是以 `config.endpoint` 为粒度去缓存。

### 5. 组件内部模板 `<template>` 渲染和触发事件

渲染和触发事件逻辑：

- 页面加载完成 - 因未登录，使用空数据（`{}`）渲染模板
- 页面请求用户信息
    - 有 `code` - 发送登录数据
        + 错误 - 触发 `error` 事件
        + 成功
            - 使用 `response.data` 重新渲染模板
            - 触发 `login` 事件
    - 无 `code`
        - 未登录 - 忽略
        - 已登录
            - 使用 `response.data` 重新渲染模板
            - 触发 `login` 事件
- 页面触发 `登录组件ID.login` 事件
    + 未登录 - 跳转熊掌号登录授权页面
    + 已登录 - 忽略
- 页面触发  `登录组件ID.logout` 事件
    - 未登录 - 忽略
    - 已登录
        - 后端返回 `response.data.url`
            * 跳转到 `response.data.url`
        - 后端没有返回 `response.data.url`
            - 触发 `logout` 事件
            - 使用空数据（`{}`）渲染模板



