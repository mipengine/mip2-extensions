# mip-audio 音频播放

音频播放组件，代替原生的 `audio` 标签

标题|内容
----|----
类型|通用
支持布局| N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-audio/mip-audio.js

`mip-audio` 用法和原生标签的用法基本相同，有所不同的是在 MIP 环境下，初始化的时间是由 MIP Runtime 决定，只有当标签在浏览器视窗内才会初始化，也就是所谓的懒加载。

`mip-audio` 接受几种特殊的子元素，如下:

- `source` 标签 - source 标签和 HTML5 规范的标签一样，指定不同的音频源
- 带有 `placeholder` 属性的标签，这是在 audio 未初始化前的占位元素
- 带有 `controller` 属性的标签，这个标签不是必须，开发者可以通过此标签来自定义音频播放器的控制条，参考下面有关 `controller` 属性标签的单独说明

看下面的例子

```html
<mip-audio
  src="https://mip-doc.bj.bcebos.com/guitar.mp3"
  layout="fixed-height"
  height="50">
  <source type="audio/mpeg" src="foo.mp3">
  <source type="audio/ogg" src="foo.ogg">
</mip-audio>
```

## 示例

### 基本示例
`<mip-audio>` 使用方法同 `<audio>` 标签。

[info]由于 MIP-Cache 是 HTTPS 环境，src 要求为 HTTPS 资源。

``` html
<mip-audio
  src="https://mip-doc.bj.bcebos.com/guitar.mp3"
  layout="fixed-height"
  height="50">
</mip-audio>
```

## 自定义控件皮肤

使用 `controller` 属性在 `<mip-audio>` 中声明自定义交互控件。可以任意更改 DOM 位置，通过增加 `class` 及 CSS 为控件添加皮肤。
当使用 `controller` 属性时，`<mip-audio>` 不会默认增加 `class="mip-audio-default-style"`，所有样式需要自己添加。

下列属性涉及到事件绑定，请务必保留：

- `controller` 交互控件最外层，用于判断是否有自定义控件。
- `play-button` 开始/暂停按钮。
- `current-time` 当前播放时间。
- `total-time` 音频总时长。
- `seekbar` 进度条。
- `seekbar-fill` 进度条中已播放，具有特殊颜色。
- `seekbar-btn` 进度条拖动按钮。

[notice] controller, current-time 等属性请务必保留，如果不需要总时间，可以设置 `display:none`。

下列 `class` 为播放时动态添加，可以设置自定义图标:

- `mip-audio-stopped-icon` 图标，暂停时显示的三角图标。
- `mip-audio-playing-icon` 图标，播放时显示的双竖杠图标。

[warning]开发时请关注控制台（Console），避免组件报错。

``` html
<mip-audio
  src="https://mip-doc.bj.bcebos.com/guitar.mp3"
  class="all-pink"
  layout="fixed-height"
  height="50">
  <div controller class="bg-color-pink">
    <i play-button class="mip-audio-stopped-icon"></i>
    <div seekbar>
      <div seekbar-fill class="bg-color-pink2"></div>
      <div seekbar-button class="bg-color-pink3"></div>
    </div>
    <div current-time class="color-gray">00:00</div>
    <div total-time class="color-gray">--:--</div>
  </div>
</mip-audio>
```


## 属性

### audio 相关属性

#### src

如果没有 `source` 标签，那么 `src` 属性就一定要有。

[info] 必须是 HTTPS

#### preload

枚举属性，让开发者自行思考来示意浏览器使用何种加载方式以达到最好的用户体验。可以是以下属性之一：
- `none`: 示意用户可能不会播放该音频，或者服务器希望节省带宽；换句话说，该音频不会被缓存；
- `metadata`: 示意即使用户可能不会播放该音频，但获取元数据 (例如音频长度) 还是有必要的。
- `auto`: 示意用户可能会播放音频；换句话说，如果有必要，整个音频都将被加载，即使用户不期望使用。
- 空字符串: 等效于 `auto` 属性。
假如不设置，默认值就是浏览器定义的了（不同浏览器会选择自己的默认值）， 即使规范建议设置为 `metadata`.

使用备注：
- `autoplay` 属性优先于 `preload` 假如用户想自动播放音频，那么很明显浏览器需要下载音频。同时设置 `autoplay` 和 `preload` 属性在规范里是允许的
- 规范没有强制浏览器去遵循该属性的值；这仅仅只是个提示。

#### autoplay

布尔属性；如果指定（默认值为"false"！）；指定后，音频会马上自动开始播放，不会停下来等着数据载入结束。

说明：移动端部分浏览器会忽视 `autoplay` 参数，禁止自动播放，（[developer.apple.com 从用户体验角度的解释](https://developer.apple.com/library/content/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)）

#### loop

布尔属性，如果有，则音频会循环播放

#### muted

布尔属性，如果存在，默认将 `audio` 标签静音

### Media Session 相关属性

`mip-audio` 标签实现了 [`Media Session API`](https://developers.google.cn/web/updates/2017/02/media-session)，允许开发者指定一些关于音频本身的信息，这些信息会被用于在一些设备播放时显示的通知上，如下图所示

![Media Session Example](https://boscdn.baidu.com/v1/assets/mip-audio-mediasession.png)

#### artwork

PNG/JPG/ICO 图片的路径，如果没有 `artwork` 字段，则会按照如下优先级取对应的图片

1. 去当前页面找到 json-ld 中声明的 `image` 作为图片
2. 找 `meta[property="og:image"]` 的 meta 标签中声明的图片
3. 找当前页面的 favicon 作为图片，`link[rel="shortcut icon"]` 或者 `link[rel="icon"]`

#### artist

字符串，表明当前音频的作者

#### album

字符串，表明当前音频所在的作品集

#### title

字符串，作为该音频的名字显示在通知栏中，如果没有这个字段，则会取页面的 `title` 作为名字

示例：

下面的代码为上面截图中的示例

```html
<mip-audio width="400" height="300"
  src="https://mip-doc.bj.bcebos.com/guitar.mp3"
  layout="fixed-height"
  height="50"
  artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
  title="Snow Fight"
  album="Jan Morgenstern"
  artist="Sintel">
</mip-audio>
```
