# mip-counter 组件

mip-counter 组件是一个可以实现与服务端通信的计数组件，可以用于点赞、投票等功能

标题|内容
----|----
类型|通用
支持布局| responsive, fixed-height, fill, container, fixed
所需脚本| https://c.mipcdn.com/static/v2/mip-counter/mip-counter.js

## 示例

```html
<mip-counter layout="fixed" height="50" width="100" src="./data.js">
  <div class="mip-counter-wrapper">
    <!-- 可以通过 template 方式随意的设置自己的 dom 结构和样式， 样式在 custom style 中进行处理 -->
    <template type="mip-mustache">
      <div class="mip-counter-button">
        <mip-img src="./imgs/like.png" width="20" height="20" layout="fixed"></mip-img>
        <p>赞 {{ counter }}</p>
      </div>
    </template>
  </div>
</mip-counter>
```

## 属性

### src

说明：服务端计数接口，为 jsonp 格式  
必选项：是  
类型：字符串

### timeout

说明：单位`ms`, 用来延时发送计数请求，当设置 timeout 为 500 ms 时，在 500 ms 内点击不会发送请求给服务端，只会在客户端计数，500 ms 后将请求发送给服务端
必选项：否  
类型：字符串  
取值范围：默认 `300` ms  

## 注意事项

src 参数必须为 jsonp 格式接口的返回值如下：

```json
{
  "status": 0,
  "data": {
    "counter": 123
  }
}
```

status 为 0 代表请求成功，请求失败时返回格式如下：

```json
{
  "status": 1001,
  "msg": "错误描述"
}
```

在用户完成点击计数后，mip-counter 组件会将当前的新的计数通过 `&countet=xxx` 参数添加到 src 配置后重新请求接口，服务端需要将新的 counter 进行存储
