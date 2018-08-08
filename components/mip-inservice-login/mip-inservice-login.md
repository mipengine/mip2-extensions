[TOC]

# `mip-inservice-login`

## 说明

登录授权组件


### 使用登录授权前的准备

登录授权能力基于熊掌号的网页授权机制，开发者进行登录授权开发前，需先成为熊掌号开发者：

1. 若您是熊掌号主体，请开启开发者模式，参看[开发者接入说明](http://xiongzhang.baidu.com/open/wiki/chapter1/section1.0.html?t=1526461611082)
2. 若您是第三方平台，
    * [接入熊掌号开发者平台](https://xiongzhang.baidu.com/open/wiki/chapter5/section5.0.html?t=1526461611082)
    * [获得熊掌号授权](https://xiongzhang.baidu.com/open/wiki/chapter5/section5.3.html?t=1526461611082)


### 配置网页授权域名

为确保验证授权过程的安全，开发者必须在平台预先注册应用所在的域名或URL，作为OAuth2.0检验授权请求中的"redirect_uri"参数。以便保证OAuth2.0在回调过程中，会回调到安全域名。

在`熊掌号运营中心-开发-开发者设置`（[地址](https://xiongzhang.baidu.com/site/devsetting)）添加三个网页授权域名：

1. 网站主域名 - 需要在登录组件的域名
2. MIP-Cache 域名：`mipcache.bdstatic.com`
3. MIP-Cache 站点域名，规则：`域名（.换成-）.mipcdn.com`，如：
    - `www.mipengine.org` -> `www-mipengine-org.mipcdn.com`
    - `demo.www.mipengine.org` -> `demo-www-mipengine-org.mipcdn.com`

<img src="https://BabyLillian.github.io/images/网页回调地址.png"  alt="网页授权域名配置" align=center width="500"/>


### 网页授权流程

1. 引导用户进入授权页面同意授权，获取code；
2. 通过code换取网页授权access_token；
3. 刷新接口调用凭据access_token，避免过期；
4. 获取用户基本信息。

若需了解百度账号授权流程的更多内容，请参看[熊掌号主体流程说明](https://xiongzhang.baidu.com/open/wiki/chapter2/section2.0.html?t=1526461611082)、[第三方平台流程说明](http://xiongzhang.baidu.com/open/wiki/chapter5/section5.4.html?t=1526461611082)

## 组件

### 引入组件

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-inservice-login/mip-inservice-login.js

**注意：** 登录授权组件与`mip-bind`配合使用，且`无需`在页面额外引入`mip-bind`组件的脚本。


### 名词解释

* 百度账号登录：用户在当前浏览器环境下登录了百度账号
* 百度账号登出：用户在当前浏览器环境下登出了百度账号
* 百度账号授权：用户在访问第三方站点时，第三方站点可以通过百度账号登录授权机制，来获取用户基本信息，进而实现自身业务功能。账号授权存在有效期，失效后需要重新授权。
* 第三方站点登录：用户在当前浏览器环境下登录了第三方站点。当百度账号授权成功后，第三方站点可以使用百度用户的基本信息作为一次站点登录，按照业务逻辑对该登录用户进行管理
* 第三方站点登出：用户在当前浏览器环境下登出了第三方站点，站点不再持有用户的登录信息
* 后端：指使用登录授权组件的第三方站点的后端
* 前端: 指使用登录授权组件的第三方站点的前端


### 组件样式

当触发组件的`登录`功能时，根据用户的状态，有以下几种样式形态：

* 登录授权弹窗：用户在当前浏览器下进行过`百度账号登录`，但还未在第三方站点进行`百度账号授权`，当触发组件的`登录`功能时，将在站点页面上出现`登录授权弹窗`

<img src="https://BabyLillian.github.io/images/授权弹窗.png"  alt="授权弹窗" align=center width="200"/>

* 登录授权页面：用户在当前浏览器下`未`进行`百度账号登录`，且未在第三方站点进行`百度账号授权`，当触发组件的`登录`功能时，将跳转打开`登录授权页`

<img src="https://BabyLillian.github.io/images/授权登录.png"  alt="授权登录" align=center width="300"/>

* 无样式：
  * 已登录第三方站点
  * 用户曾经使用百度账号授权登录过第三方站点，后来登出了，但未登出百度账号，且授权关系未失效，这时触发组件的`登录`，将直接返回授权`code`，没有样式



### 组件流程

#### 流程简易说明

<img src="https://BabyLillian.github.io/images/授权组件简易流程.png"  alt="授权组件简易流程" align=center />

#### 具体场景流程说明


* 当用户`打开或刷新`第三方页面时，执行`同步登录`

<img src="https://BabyLillian.github.io/images/授权登录组件同步流程.png"  alt="同步登录" align=center />

* 当用户在第三方页面`点击按钮、链接`等交互元素触发登录行为时，执行`异步登录`

<img src="https://BabyLillian.github.io/images/授权登录组件异步流程.png"  alt="异步登录" align=center />

* 当开启了组件的自动登录（config属性的`autologin`为`true`），若访问第三方站点页面的用户未登录，则将执行自动登录逻辑

<img src="https://BabyLillian.github.io/images/授权登录组件自动登录流程.png"  alt="自动登录" align=center />


**注意：** `同步登录` 和 `异步登录` 是针对发生`向后端请求用户数据`这一操作的`时机`而言


#### 渲染和触发事件逻辑

- 页面加载完成 - 因未登录，空的用户数据（`{}`）渲染页面
- 页面请求用户信息
    - 有 `code` - 发送登录数据
        + 错误 - 触发 `error` 事件
        + 成功
            - 使用 `response.data` 重新渲染页面
            - 触发 `login` 事件
    - 无 `code`
        - 未登录 - 忽略
        - 已登录
            - 使用 `response.data` 重新渲染页面
            - 触发 `login` 事件
- 页面触发 `登录组件ID.login` 事件
    + 未登录 - 跳转登录授权页面
    + 已登录 - 忽略
- 页面触发  `登录组件ID.logout` 事件
    - 未登录 - 忽略
    - 已登录
        - 后端返回 `response.data.url`
            * 跳转到 `response.data.url`
        - 后端没有返回 `response.data.url`
            - 触发 `logout` 事件
            - 使用空数据（`{}`）渲染模板


### 组件属性

#### config

说明：组件初始化所必须的配置数据

必选项：是

类型： `Object`

示例：通过`m-bind:config="配置数据"`将该属性传入组件，配置数据的示例说明如下，

```json
{
  "appid": "12345678", // 熊掌号id，string, 必须
  "clientId": "R6HzvBSGAvkFMUrhELUZayfH2No86t1k", // 熊掌号开发者client_id， string，必须
  "id": "info", // 数据的键名（key），当登录信息发生变更时，将更新mip-data里以该值为键名（`key`）的对象数据
  "isGlobal": false, // 需要更新的mip-data里已id为键名的对象数据是否为 全局数据，默认值false
  "autologin": false, // 页面打开后未登录状态下自动跳转登录，常用于必须登录状态下才可以访问的页面, boolean, 默认值false
  "endpoint": "https://api.example.com/user/info.php", // 后端源站数据接口链接，需要使用 `https://` 或者 `//开头的源站地址，需要接口支持 HTTPS ，使用 POST 形式发送数据 , 必须
  "redirectUri": "https://example.com/xxx.html" // 登录成功后的重定向地址，不传默认跳回原页面
}
```

其中，`endpoint`为第三方后端提供的数据接口，组件将通过该接口，查询登录状态、获取用户信息等。

### 组件方法和事件

#### 登录方法 - `<div on="tap:登录组件id.login(redirectUri, origin)">`

在其他元素中绑定点击或其他动作时调起登录。

该方法接收两个参数：

*  `redirectUri`:  string，非必须，登录成功后的跳转地址，要求是站内页面。当页面运行在不同环境时（搜索或者原站），跳转链接的形式会不一样，需要开发者自己处理。
*  `origin`： string，非必须，执行`登录`时，标识发起登录操作的动作来源，在接受到登录成功的事件里，需要判断触发登录操作的是不是指定动作来源。当同一个页面存在多个触发登录的元素时，设置origin是必要的，因为每个元素在登录后的业务逻辑很可能是不一样的。


调用组件方法时的正确传递参数的方式是`<div on="tap:登录组件id.login(参数a,参数b,参数c)></div>`。所有参数之间使用`英文逗号`连接，不要有空格，如果某一个参数为空，就写成`<div on="tap:登录组件id.login(,参数b,参数c)></div>`。所有参数都会转成`字符串`传入组件的方法。


注意：

1. 该方法会根据当前用户`登录百度账号`的状态而打开登录弹层（已登录）或者 重新打开一个登录页面（未登录），在非搜索环境下，如果是打开登录页， 意味着这将导致当前页面未存储的数据丢失，如：表单用户填写内容。
2. 在已经登录成功的情况下，再次触发login方法，该方法不会执行。


#### 登出方法 - `<div on="tap:登录组件id.logout">`

在其他元素中绑定点击或其他动作时请求登出接口。

注意：该方法不会跳转页面，异步的调用 `endpoint` 接口去退出，并触发登录组件元素中的 `logout:其他组件id.其他组件行为` 事件。

#### 登录成功事件 - `<mip-inservice-login on="login:其他组件id.其他组件行为">`

登录事件包含`同步登录成功`和`异步登录成功`两种状态：

* 同步登录成功： 打开页面或者刷新页面时组件能够获取到用户数据
* 异步登录成功： 由某个交互（如点击按钮）触发的登录操作，登录后当前页面不刷新

可以在登录成功时调用其他组件的组件行为。

#### 登录失败事件 - `<mip-inservice-login on="error:其他组件id.其他组件行为">`

在登录请求后端返回值错误时触发。

#### 登出成功事件 - `<mip-inservice-login on="logout:其他组件id.其他组件行为">`

在退出登录时（由 `on="tap:组件id.logout"` 调用触发）调用其他组件的组件行为。


### 后端数据说明


以下为后端需要处理的和用户登录操作相关的几个场景下的请求。

#### 页面打开时检查用户数据

执行时机： 每次打开页面时，如果url上没有和授权相关的查询参数（code，redirect_uri），都会发送`type=check`的请求，向后端查询当前用户的登录状态和数据。

请求：

| 名称   | 说明                                   |
| ---- | ------------------------------------ |
| 请求链接 | `config.endpoint`，必须支持`https`        |
| 请求类型 | POST                                 |
| 请求参数 | `{type: 'check', sessionId: '会话凭证'}` |

未登录返回值说明：

```json
{
  "status": 0,
  "sessionId": "会话凭证，必须返回",
  "data": null
}
```

已登录返回值，整个返回值的 `data` 字段将认为是用户数据，并使用MIP.setData到`config`属性配置的存放用户数据的对应字段里，如`info.userInfo`，在页面渲染时使用该数据渲染：

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

注意：上面 `data.nickname` 只是示例，具体什么数据请前、后端统一约定。

#### 百度账号登录

执行时机： 1）在当前页面的url地址的查询参数上能正确获取到`code`和`redirect_uri` 2）异步登录接口返回了`code`和`redirect_uri`的数据。只要满足以上条件，都会发起`type=login`的请求。

请求：

| 名称   | 说明                                       |
| ---- | ---------------------------------------- |
| 请求链接 | `config.endpoint`，必须支持`https`            |
| 请求类型 | POST                                     |
| 请求参数 | `{type: 'login', code: '熊掌号授权code', redirect_uri: '回调链接', sessionid: '会话凭证'}` |

源站后端服务需要使用 `code` 和 `redirect_uri` 参数去请求 [获取网页授权 access_token](http://xiongzhang.baidu.com/open/wiki/chapter2/section2.2.html?t=1522129995153) 、[获取授权用户信息](http://xiongzhang.baidu.com/open/wiki/chapter2/section2.4.html?t=1522129995153) 接口，并和源站的用户关联、记录用户登录状态。

其中，`sessionid`为可选字段，如果能从本地缓存里取到该数据都会带上，后端应结合sessionid和code逻辑 做登录处理，具体请参看`常见问题-后端相关`部分

处理成功，认为已登录，整个返回值的 `data` 字段将认为是用户数据，并使用MIP.setData到`config`属性配置的存放用户数据的对应字段里，如`info.userInfo`，在页面渲染时使用该数据渲染：

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

| 名称   | 说明                            |
| ---- | ----------------------------- |
| 请求链接 | `config.endpoint`，必须支持`https` |
| 请求类型 | POST                          |
| 请求参数 | `{type: 'logout'}`            |

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


#### 其他

##### 会话凭证 sessionId

由于在 iOS 对跨域透传 `cooke` 的限制（<https://webkit.org/blog/7675/intelligent-tracking-prevention/>），在前端组件请求后端接口时（`type=check` 和 `type=login`），由后端生成当前会话唯一凭证并记录到服务端，把凭证返回前端 `response.sessionId`，前端组件将在 `localStorage` 中缓存下来，在下次发后端接口请求时携带该凭证，后端就当优先使用 `cookie/session` 验证，不存在时获取 `POST` 参数中的 `sessionId` 去校验。

注意：本地 `localStorage` 是以 `config.endpoint` 为粒度去缓存。


##### 后端需要支持 `CORS` + `withCredentials`

- [CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
- [`withCredentials` 附带身份凭证的请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#%E9%99%84%E5%B8%A6%E8%BA%AB%E4%BB%BD%E5%87%AD%E8%AF%81%E7%9A%84%E8%AF%B7%E6%B1%82)

登录组件（mip-inservice-login）已经在前端发送请求时处理了 `withCredentials` ，需要对应的接口服务响应头设置：

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: 对应请求的 origin`

**注意：** 出于安全考虑请对来源的 `origin` 进行判断，并正确的返回 `Access-Control-Allow-Origin` 字段，不能为 `*` 。


### 使用组件示例

#### 基本用法

* 在`html`中使用登录组件

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
        isGlobal: false,
        redirectUri: ''
      }
    }
  </script>
</mip-data>
<mip-my-example id="example" m-bind:info="info"></mip-my-example>

<mip-inservice-login
  id="log"
  m-bind:config="config"
  on="login:example.customLogin logout:example.customLogout"
>
</mip-inservice-login>

<script src="https://c.mipcdn.com/static/v2/mip.js"></script>
<script src="https://c.mipcdn.com/static/v2/mip-inservice-login/mip-inservice-login.js"></script>
<script src="https://c.mipcdn.com/extensions/platform/v2/your.site.com/mip-my-example/mip-my-example.js"></script>

```

`mip-my-example`组件代码示例：

```html
<template>
  <div class="wrap">
    <h3>这是一个渲染片段示例</h3>
    <p>默认未登录，由用户交互（如点击按钮）触发登录/登出</p>
    <hr />
    <div v-if="info.isLogin">hi，{{info.userInfo.nickname}}，欢迎回来！<span style="color:#f00;" on="tap:log.logout">退出</span></div>
    <div v-else>你没有<span style="color:#f00;" on="tap:log.login">登录</span>哦。</div>
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
    this.$on('customLogin', event => {
      // 这里可以输出登录之后的数据

      // 获取用户信息
      event.userInfo;
      // 后端交互会话标识
      event.sessionId;
    });
    // 自定义exit事件
    this.$on('customLogout', event => {
      console.log('登出了');
    });
  }
}
</script>
```

* 在`vue组件`里使用登录组件

```html
<!--先在html里配置数据，引入相关组件-->
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
        isGlobal: false,
        redirectUri: ''
      }
    }
  </script>
</mip-data>

<mip-my-example m-bind:info="info" m-bind:config="config" id="example"></mip-my-example>

<script src="https://c.mipcdn.com/static/v2/mip.js"></script>
<script src="https://c.mipcdn.com/static/v2/mip-inservice-login/mip-inservice-login.js"></script>
<script src="https://c.mipcdn.com/extensions/platform/v2/your.site.com/mip-my-example/mip-my-example.js"></script>
```

`mip-my-example`组件代码示例：

```html
<template>
  <div class="wrap">
    <mip-inservice-login
      id="log"
      :config="config"
      on="login:example.customLogin logout:example.customLogout"
    >
    </mip-inservice-login>
    <h3>这是一个渲染片段示例</h3>
    <p>默认未登录，由用户交互（如点击按钮）触发登录/登出</p>
    <hr />
    <div v-if="info.isLogin">hi，{{info.userInfo.nickname}}，欢迎回来！<span style="color:#f00;" on="tap:log.logout">退出</span></div>
    <div v-else>你没有<span  style="color:#f00;" on="tap:log.login">登录</span>哦。</div>
  </div>
</template>


<script>
export default {
  props: {
    info: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  mounted () {
    // 自定义login事件
    this.$on('customLogin', event => {
      // 这里可以输出登录之后的数据

      // 获取用户信息
      event.userInfo;
      // 后端交互会话标识
      event.sessionId;
    });
    // 自定义exit事件
    this.$on('customLogout', event => {
      console.log('登出了');
    });
  }
}
</script>
```


和`mip-bind`配合使用注意：

1. 必须在`mip-inservice-login`组件的`config`属性里设置`id` 的值，该值与组件id的值可以不一样， 如示例中的`info`。
2. 必须在 `<mip-data>` 配置数据中设置一个以`mip-inservice-login`的`config`属性里的`id` 为键名（`key`）的对象数据， 如示例中的`info`。
3. 如果这个数据是全局共享数据，需要设置`mip-inservice-login`的`config`里的`isGlobal`为`true`。共享数据的用法，请参照文档[MIP 2.0 的数据和应用](https://github.com/mipengine/mip2/blob/master/docs/components/data-and-method.md)。
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


#### 实现个人中心

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



#### 综合示例

定制登录成功后的行为

* 点击`用户名`，触发登录，登录后回到原页面
* 点击`我的订单`，触发登录，登录后跳转到订单页面`order.html`
* 点击`确认下单`，触发登录，登录后执行自定义业务逻辑

代码如下：

* html

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
        isGlobal: false,
        redirectUri: ''
      }
    }
  </script>
</mip-data>

<mip-example-container m-bind:info="info" m-bind:config="config"></mip-example-container>

<script src="https://c.mipcdn.com/static/v2/mip.js"></script>
<script src="https://c.mipcdn.com/static/v2/mip-inservice-login/mip-inservice-login.js"></script>
<script src="https://c.mipcdn.com/extensions/platform/v2/your.site.com/mip-example-container/mip-example-container.js"></script>
<script src="https://c.mipcdn.com/extensions/platform/v2/your.site.com/mip-example/mip-example.js"></script>
```


* `mip-example-container`代码

```html
<template>
  <div class="wrap">
    <mip-inservice-login
      id="log"
      :config="config"
      on="login:example.customLogin logout:example.customLogout"
    ></mip-inservice-login>
    <mip-example
      id="example"
      :info="info"
      on="actionPay:log.login(,asynLog) actionOrder:log.login actionName:log.login actionExit:log.logout"
    ></mip-example>
  </div>
</template>


<script>
export default {
  props: {
    info: {
      type: Object,
      required: true,
      default () {
          return {};
      }
    },
    config: {
      type: Object,
      required: true,
      default () {
          return {};
      }
    }
  },
  mounted () {
    // ...
  }
}
</script>

```



* `mip-example`代码

```html
<template>
  <div class="wrapper">
    <div>
      <p @click="jumpDefault" class="text">{{name}}</p>
      <p @click="jumpRedirect" class="text">我的订单</p>
      <p @click="logout" class="text">退出</p>
    </div>
    <div>
      <p><input type="text" v-model="test" class="input"/></p>
      <div @click="jumpCustom" class="text">确认下单</div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}
.text {
  height: 32px;
  line-height: 32px;
  font-size: 18px;
  margin-bottom: 5px;
}
.input {
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  border: 1px solid #f0f0f0;
}
</style>

<script>
export default {
  props: {
    info: {
      type: Object,
      required: true,
      default () {
          return {};
      }
    }
  },
  data: function () {
    return {
      test: ''
    }
  },
  computed: {
    name () {
      if (this.info.isLogin) {
        return this.info.userInfo.nickname
      }
      else {
        return '未登录'
      }
    }
  },
  mounted () {
    // 监听login
    this.$on('customLogin', (e) => {
      // 判断当前收到登录成功事件是来自哪个动作触发的
      if (e.origin === 'asynLog') {
        this.alertTip();
      }
    });
    // 监听logout
    this.$on('customLogout', (e) => {
      console.log('用户登出了');
    });
  },
  methods: {
    jumpDefault () {
      if (!this.info.isLogin) {
        // 设置登录组件的config属性中，重定向地址:redirectUri为空
        MIP.setData({
          config: {
            redirectUri: ''
          }
        });
        // 在下一个执行时机触发事件
        this.$nextTick(function () {
          this.$emit('actionName');
        });
      }
    },
    jumpRedirect () {
      // 如果已经登录，自己处理跳转
      if (this.info.isLogin) {
        window.MIP.viewer.open('./order.html', {isMipLink: true});
      }
      else {
        // 设置登录组件的config属性中，重定向地址:redirectUri为订单页地址
        MIP.setData({
          config: {
            redirectUri: './order.html'
          }
        });
        // 在下一个执行时机触发事件
        this.$nextTick(function () {
          this.$emit('actionOrder');
        });
      }
    },
    jumpCustom () {
      // 如果已经登录，自己处理跳转
      if (this.info.isLogin) {
        this.alertTip();
      }
      else {
        // 设置登录组件的config属性中，重定向地址:redirectUri为空
        MIP.setData({
          config: {
            redirectUri: ''
          }
        });
        // 在下一个执行时机触发事件
        this.$nextTick(function () {
          this.$emit('actionPay');
        });
      }
    },
    alertTip () {
      if (this.test !== '') {
        alert('现在我可以跳转到下个页面了');
      }
      else {
        alert('输入框不能为空!')
      }
    },
    logout () {
      // 触发登出事件
      this.$emit('logout');
    }
  }
}
</script>

```


**注意：**

1. 可以在调用登录组件的`login`方法时，直接传入重定向地址。本示例通过设置登录组件配置的方式，来修改重定向地址。
2. 在`已登录`的情况下，业务方需要自己处理逻辑，登录组件不会再回调或者跳转到指定地址。
3. 在`nextTick`里抛出自定义组件事件，是因为修改配置后，会触发一次dom渲染，但`登录组件`持有的数据没有更新，所以需要在dom渲染后的下个时间点再执行操作。


## 常见问题

### 后端相关

1. 使用登录组件需要后端介入吗？

答： 需要

2. 后端需要完成哪些工作？

答： 后端需要 1）接入熊掌号`网页授权`，能够获取到百度用户的基本信息 ;2）提供一个供登录组件使用的、支持`CORS` + `withCredentials`的接口; 3）对用户在第三方站点的登录信息进行管理（用户名、登录状态）。

3. 在哪配置网页授权回调地址？支持配置多个回调地址吗？

答： 熊掌号运营中心-开发-开发者设置-网页授权域名（[地址](https://xiongzhang.baidu.com/site/devsetting)）。支持。

4. endpoint的作用是什么？是必须的吗？

答：endpoint是后端提供给组件的一个获取用户信息、登录状态的接口，是`必须`的。


5. 用户数据来自哪里？

答：当访客在第三方站点进行`百度账号登录授权`后，组件将使用授权code和redirect_uri，向第三方后端接口`endpoint`发起登录请求，后端使用code换取网页授权`access_token`，再使用`access_token`获取百度用户信息

6. 用户数据存在哪？

答：用户数据存在第三方数据库，组件只负责向后端发起请求，获取用户数据和登录状态，组件本身不存储任何用户数据。

7. sessionid的作用是什么，为什么需要它？

答：由于在 iOS 对跨域透传 `cooke` 的限制（<https://webkit.org/blog/7675/intelligent-tracking-prevention/>），在组件请求后端接口时（`type=check` 和 `type=login`），由后端生成当前会话唯一凭证并记录到服务端，把凭证返回前端 `response.sessionId`，前端组件将在 `localStorage` 中缓存下来，在下次发后端接口请求时携带该凭证，后端就当优先使用 `cookie/session` 验证，不存在时获取 `POST` 参数中的 `sessionId` 去校验。

8. 为什么发起`type=login`的请求时，还携带有`sessionid`?

答：发起`type=login`的条件是1）在当前页面的url地址的查询参数上能正确获取到`code`和`redirect_uri` 2）异步登录接口返回了`code`和`redirect_uri`的数据。只要满足以上条件，都会发起`type=login`的请求。所以，当用户从百度登录授权页返回到第三方页面后，将执行`type=login`，后端成功返回用户信息后，sessionid有值，此时刷新当前页面（因为url上依然有code信息），又会再次发起`type=login`，并携带`sessionid`。

所以，type=login时后端处理的逻辑应该是：

sessionid是否存在，
    * 如果存在，sessionid是否已过期，
        * 如果没过期，直接返回用户数据，
        * 如果过期，使用code+redirect_uri发起换取access_token的操作，成功获取百度用户信息后，更新sessionid，并将最新数据返回给组件
    * 如果不存在，使用code+redirect_uri发起换取access_token的操作，成功获取百度用户信息后，将最新数据返回给组件


9. 为什么`type=login`时，也有`code+redirect_uri`值，但还是返回`invalid redirecturi`?

答：发起授权时生成`code`的重定向地址，与后端现在换取`accesstoken`使用的`redirect_uri`不一致


10. 回调地址里有特殊字符怎么办？

答：组件传给后端的`redirect_uri`，使用的是原始值（例如，在组件配置参数里设置的重定向地址），组件不会再做encode处理，如果含有特殊字符（中文、& 等），需要后端自己完成encode，再去换取access_token


### 前端相关

1. 前端怎么获取到用户数据？

答： 1) 监听组件抛出的login事件，该事件会返回用户数据 2) 通过`mip-data`里设置的存储用户数据的字段获取，如示例中的`info.userInfo.nickname`和`info.isLogin`。

2. 打开页面就能获取到用户数据吗？

答： 不能，组件每次都是异步向后端查询用户数据，所以页面本身应该做`有数据`和`没数据`时的显示效果兼容，已达到更好的用户体验。

3. 只有设置为自动登录才能获取到用户数据吗？

答： 不是，组件每次初始化都会像后端查询用户数据，如果后端成功返回了登录态和数据，都会抛出`login`事件，并更新`mip-data
`里对应的用户数据。当设置为自动登录，但后端返回为`未登录`状态时，组件就会主动发起登录百度账号的操作。

4. 一个页面能够有多个登录组件吗？

答：不可以，只允许一个登录组件。

5. 一个页面内允许多个操作触发登录吗？

答：可以。

6. 能够指定登录之后的跳转地址吗？

答：可以，1）可以在调起登录`login()`方法的时候传入`redirectUri`; 2）修改`config`配置里的`redirectUri`。

7. 能够指定登录之后除了跳转外的其他行为吗？

答：可以，如果成功登录之后，会抛出`login`事件，前端可以监听该事件，然后执行自己的逻辑（需要设置`origin`参数，具体参加文档）。

8. 为什么控制台显示`invalid redirecturi`？

答：当前配置的`授权回调`地址不合法，请核对当前的域名或者跳转地址是否已在`网页授权回调地址`的配置里。


9. 能够定制登录之后的操作行为吗？

答：可以，如果成功登录之后，会抛出`login`事件，前端可以监听该事件，然后执行自己的逻辑。


10. 为什么发起登录操作时，没有任何显示效果，就跳转页面并且登录成功了呢？

答：因为该用户曾经在第三方网站使用百度账号登录成功过，之后退出了第三方站点（比如sessiond被清除），但没有退出百度账号，授权关系也依然有效，则不需要用户再次操作的情况下，组件就能够获取到授权`code`，然后携带code信息跳转到 前端设置的`登录后的跳转地址`。


11. 为什么已经成功登录的情况下（userInfo里有用户数据），再次刷新页面，有时有用户数据，有时候没有？

答：组件只有进入视窗内才会被初始化，`强烈建议`把登录组件尽量靠近`<body>`标签放置。


### 其他

1. 如何取消授权？

答：访问该[地址](https://passport.baidu.com/accountbind?tpl=)，解除应用绑定关系。


2. 能够只登录不授权吗？

答：暂时不支持该功能。

3. 支持在mip1页面下使用吗？

答：不支持。
