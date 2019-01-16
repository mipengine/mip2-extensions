# mip-iqiyi-video

方便用户嵌入爱奇艺视频的组件（只适用于爱奇艺网站的视频），一般是用户在爱奇艺网站上点击分享后，根据复制出来的“通用代码”来组装 mip-iqiyi-video 组件。

| 标题     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| 类型     | 通用                                                              |
| 支持布局 | fixed, fixed-height, responsive                                   |
| 所需脚本 | https://c.mipcdn.com/static/v2/mip-iqiyi-video/mip-iqiyi-video.js |

## 示例

### 基本使用

```html
<mip-iqiyi-video
  layout="fixed-height"
  width="600"
  height="400"
  src="http://open.iqiyi.com/developer/player_js/coopPlayerIndex.html?vid=6fd208b91bff953cab5218f1c8db68c4&tvId=10110320309&accessToken=2.f22860a2479ad60d8da7697274de9346&appKey=3955c3425820435e86d0f4cdfe56f5e7&appId=1368&height=100%&width=100%"
>
</mip-iqiyi-video>
```

### 使用 data-param-\* 参数

```html
<mip-iqiyi-video
  layout="fixed-height"
  width="600"
  height="400"
  data-vid="6fd208b91bff953cab5218f1c8db68c4"
  data-tvId="10110320309"
  data-param-accessToken="2.f22860a2479ad60d8da7697274de9346"
  data-param-appKey="3955c3425820435e86d0f4cdfe56f5e7"
  data-param-appId="1368"
  data-param-height="100%"
  data-param-width="100%"
>
</mip-iqiyi-video>
```

> 注意：
> 1、由于爱奇艺没有对外提供 iframe player API，所以不能像 `<video>` 一样对这个组件进行视频控制
> 2、目前看来，分享爱奇艺视频的 iframe 链接中 vid 和 tvId 是必须的，其他的可以不填，如果组件标签的 src 里包含这些内容了，那其他属性也可以都不需要填了，如果不填 src ，那么上述二者是必须的
> 3、目前爱奇艺提供的链接在 Safari 和苹果手机上都是提示需要下载 flash 插件，并且移动端较新的 Chrome 会因为 Mixed Content 而不显示视频
