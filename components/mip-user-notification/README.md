# mip-user-notification 消息通知

消息通知组件。

标题|内容
----|----
类型|通用
支持布局|nodisplay
所需脚本|https://c.mipcdn.com/static/v2/mip-user-notification/mip-user-notification.js

## 示例

### 基本使用

* id 是必写项，这是由于 mip 支持一个页面有多个通知，需要以 id 进行区分。

* `layout="nodisplay"` 和 `class="mip-hidden"` 是必写项，否则刷新页面会发生闪动。

组件的显示与否可以通过 3 种方式进行控制：

1. 添加 `data-show-if-href` 属性。那么，组件渲染之前会先向服务器询问是否需要显示，根据返回结果控制显示与否。

2. 添加省市配置。配置在  `showIn` 城市中的用户会收到通知，配置在 `notShowIn` 城市中的用户收不到通知。没出现在上述两个配置中的城市，默认显示。配置举例如下：

```html
<script type="application/json">
  {
    "notShowIn": [ "北京", "新疆", "西藏"],
    "showIn": [ "山东", "上海"]
  }
</script>
```
省市名称支持简写和全称，如果写全称请保证书写正确。

>注意：该功能的使用需要结合 mip-map 组件，通过 mip-map 获得用户的定位信息。mip-map 使用配置如下:

在 mip-map 组件中需要设置 `getPositionFailed` 和 `getPositionComplete` 事件的回调，用于在获取位置失败或成功后通知 mip-user-notification 组件根据位置信息进行显示，两个回调均需设置。如果在一个页面中添加的多个消息通知组件都需要使用定位信息，则以空格分开，每个组件均需指定 `getPositionFailed` 和 `getPositionComplete` 事件的回调。
```html
<mip-map on="getPositionFailed:myUserNotification.getLocationComplete getPositionComplete:myUserNotification.getLocationComplete" id="myMap">
  <script type="application/json">
    {
      "ak": "hKhuzfFBrcL6zGm4s6b371NDxaUrhFPl",
      "hideMap": true
    }
  </script>
</mip-map>
```

同时，需在 mip-user-notification 组件中指定 `data-show-if-geo` 为 `true`，指定 mip-user-notification 组件 `on="notificationLoaded:myMap.getLocal"`，即在 load 完成后触发 mip-map 的定位功能，

```html
<mip-user-notification
  id="myUserNotification" 
  layout="nodisplay"
  class="mip-hidden"
  data-show-if-geo="true"
  on="notificationLoaded:myMap.getLocal"
  data-dismiss-href="http://localhost:8081/jsonp-test"
  >
  <script type="application/json">
    {
      "notShowIn": [ "北京", "新疆", "西藏"],
      "showIn": [ "山东", "上海"]
    }
  </script>
  <div style="border: 1px solid red">
    请尽快从 mip1 更新到 mip2 ~
    <button style="float: right" on="tap:myUserNotification.dismiss">接受</button>
  </div>
</mip-user-notification>
```

3. 读取本地缓存中用户上一次操作。当用户 dismiss 消息通知时，这一结果会以 `notification:yourNotificationId` 为 `key` 存储在浏览器缓存中，当用户再次打开站点，组件会优先读取缓存数据，一旦用户 dismiss 过，`notification:yourNotificationId` 为 `true`，以后就不再显示该条通知。

4. 不使用 `data-show-if-href` 和 地理位置信息，组件会向所有用户发出通知。


向 `data-show-if-href` 提供的 url 会在消息通知显示之前进行调用，调用返回的结果将会决定消息通知显示与否；向 `data-dismiss-href` 提供的 url 会在用户忽略通知之后调用，用于向指定服务器发送报告。

通过添加 button，并向 button 添加 `on` 事件，可以通过用户操作关闭通知。用户手动关闭通知同样会触发 `data-dismiss-href` 的 get 请求。为了避免浏览器的缓存，建议在 get 请求中添加 timestamp 这样的值作为参数。

当一个页面有多个消息通知时，只有一个会显示，多个消息通知会按照先后顺序排列，当前面的消息被用户忽略后，后面的消息通知才会显示。

```html
<mip-user-notification
  layout="nodisplay"
  id="mip-user-notification1"
  data-show-if-href="https://foo.com/api/show-api?timestamp=TIMESTAMP"
  data-dismiss-href="https://foo.com/api/dismissed">
  通过下方的 on 事件支持用户手动忽略消息。
  <button on="tap:mip-user-notification1.dismiss">已收到</button>
</mip-user-notification>
```

## 属性

### data-show-if-href

说明：消息通知显示前调用，在指定了此 url 之后，MIP 会向指定的 url 发出跨域的 get 请求，通过请求返回的值决定消息通知显示与否。不可和 `data-show-if-geo` 同时存在，二者选一。

必选项：否

类型：url 字符串

默认值：无

注意：MIP 会在请求后自动添加 `elementId` 作为请求参数。

如果 `data-show-if-href` 属性没有指定值，MIP 会读取本地缓存中记录的用户操作取向。如果本地存储中也没用相应的数据（发生在用户首次看见通知且未提供 url 的时候），通知会默认显示。

如果用户忽略过通知，操作会被缓存在本地，这时即使 `data-show-if-href` 返回 `showNotification` 为 true，仍然不会显示。

跨域 get 请求的的参数示例：

```text
https://example/show-notification?timestamp=1234567890&elementId=notification1
```

请求的返回值格式应为：

```json
{ "showNotification": true }
```

请求需要返回包含 `showNotification` 属性的 JSON 对象，如果属性值为 `true`，通知会显示，否则不显示。

这里通过 cors 实现跨域请求，服务端返回的请求头中需设置 `Access-Control-Allow-Origin`、`Access-Control-Allow-Methods` 和 `Access-Control-Allow-Headers` 字段。比如：

```js
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  if ('OPTIONS' === req.method) {
    res.send(200)
  }
```

### data-dismiss-href

说明：消息通知被用户点击忽略后调用，用于向指定服务器发送报告。

必选项：否

类型：url 字符串

默认值：无

注意：当指定了此 url，MIP 会向该 url 发起跨域的 post 请求，在用户同意的情况下，会发送 `elementId` 参数。

如果 `data-dismiss-href` 属性没有指定值，MIP 在用户忽略通知后不会发送报告，只会将用户忽略通知的操作以 `notification:yourNotificationId` 的形式存储在本地缓存中。

请求的格式应为：

```json
{ "elementId": "yourNotificationId"}
```

请求应该返回 HTTP 200，同时不应该返回其他数据。

### data-persist-dismissal

说明：若明确指定为 `false`，MIP 将不会记住用户的选择。此时如果 `data-show-if-href` 的返回值为 `true`，消息通知将总会显示。如果 `data-show-if-href` 没有指定 url，消息通知也总会默认显示。

必选项：否

类型：布尔

默认值：true

### enctype

说明：可以改变请求的编码类型，支持 `application/x-www-form-urlencoded`

必选项：否

类型：字符串类型

默认值：`application/json;charset=utf-8`

### data-show-if-geo

说明：根据定位的省份决定消息通知是否显示，不可和 `data-show-if-href` 同时存在，二者选一

必选项：否

类型：布尔类型

默认值：false

注意：需配合 mip-map 组件使用，参照基本使用中的控制方式 2。

## JSON 字段

* elementId：字符串类型，`mip-user-notification` 组件的 id
* showNotification：布尔类型，决定消息通知组件是否显示。

## 行为

以下情况组件会显示：
1. 本地存储中没有读取到用户曾经忽略消息的记录
2. 指定了 `data-show-if-href` 且返回值为 `{"showNotification": true}`

当用户忽略消息时会：
1. MIP 将用户的操作存储在本地，一旦用户忽略过消息，消息将不再显示
2. 当指定了 `data-dismiss-href`，会向服务器端报告用户的操作情况
3. 当前定位的省市在 `showIn` 配置项中

## 行为

dismiss：用户手动关闭消息通知，使用 MIP 的 on 方法调用