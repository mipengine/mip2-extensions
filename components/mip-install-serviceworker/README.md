# mip-install-serviceworker

`<mip-install-serviceworker>` 是实现离线可用的组件，帮助安装 Service Worker。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-install-serviceworker/mip-install-serviceworker.js

## 示例

### 基本用法

```
<mip-install-serviceworker
  layout="nodisplay"
  class="mip-hidden"
  src="/sw.js"
  data-iframe-src="https://mipexample.org/sw.html"
  data-no-service-worker-fallback-url-match=".*\.html"
  data-no-service-worker-fallback-shell-url="https://mipexample.org/shell/"
></mip-install-serviceworker>
<a href="https://mipexample.org/some/path/index.html">mip example link1</><br/>
<a href="http://mipexample.org/some/path/index.html">mip example link2</a><br/>
<a href="https://another.mipexample.org/some/path/index.html">mip example link3</>
```

## 属性

### src

说明：Service Worker 文件的路径，如果不在缓存路径下打开，会采用 `src` 注册 Service Worker

必选项：否

类型：字符串

### data-iframe-src

说明：安装 Service Workder 的页面地址，在缓存下打开，由于不同域，无法直接注册，所以采用 `<iframe>`

必选项：否

类型：字符串

### data-no-service-worker-fallback-url-match

说明：当前环境不支持 Service Worker 的时候，可以通过制定一个特殊的同源 shell 页面，提前加载这个 shell 页面进行浏览器缓存，可以通过 `data-no-service-worker-fallback-url-match` 属性指定需要跳转到该 shell 页面的规则，该属性为正则表达式

必选项：否

类型：正则表达式

### data-no-service-worker-fallback-shell-url

说明：指定的 shell 页面的 url, 需要和 mip 页面保持同源，当该 shell 页面加载完成之后，有必须通过 url hash 后的参数 redirect 到原页面的逻辑

必选项：否

类型：字符串

## 工作机制

在这个组件里，提供了 `src` 和 `data-iframe-src` 两个属性，如果要让 Service Worker 能顺利注册，两个属性都需要填写，因为 MIP 页不仅在搜索环境下打开，还可以被直接访问。

如果是直接通过 MIP 页的地址访问，以为着 Service Worker 的域名和当前站点一致，可以直接注册，这个时候我们需要 `src` 属性，会直接进行注册，如下：

```javascript
navigator.serviceWorker.register(src)
```

但是，MIP 页不仅能直接访问，还能被百度搜索缓存在 MIP CDN 上，如果通过百度搜索结果页打开，那么这个这个页面的域名就不是站点本身的域名，无法通过 `navigator.serviceWorker.register` 直接注册，在这里我们通过嵌入站点自身的 iframe 来解决域名不同的问题，通过 iframe 来注册 Service Worker，提前缓存站点资源，这个 iframe 的地址就是 `data-iframe-src` 属性， iframe 页面内容可以很简单，如下：

```html
<script>
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}
</script>
```

## Shell URL 改写

当 Service Worker 无法使用时，可以配置 URL 重写规则将页面定向到 Shell 页面，使用这个方法，用户点击页面上的链接会跳转到 `data-no-service-worker-fallback-shell-url` 地址，而不是原地址。

> Shell URL 只在源站上才能使用，如果是从百度、神马分发的网页无法使用 URL Rewrite

Shell URL 改写是通过 `data-no-service-worker-fallback-url-match` 和 `data-no-service-worker-fallback-shell-url` 来完成的，可以看下面的例子

```html
<mip-install-serviceworker layout="nodisplay"
  src="https://www.your-domain.com/serviceworker.js"
  data-no-service-worker-fallback-url-match=".*\.mip\.html"
  data-no-service-worker-fallback-shell-url="https://pub.com/shell">
</mip-install-serviceworker>
```

1. `data-no-service-worker-fallback-shell-url` 指定了 MIP + PWA 的 Shell 地址，这个地址的 origin 需要和站点的 origin 相同
2. `data-no-service-worker-fallback-url-match` 是 JS 的正则表达式，可以通过它来区分哪些地址是需要改写的

URL 改写是这样工作的：

1. `<mip-install-serviceworker>` 写明需要的参数
2. MIP 核心会尝试安装 Service Worker
3. 如果 Service Worker 没有安装，或者无法安装，MIP 会采用降级策略，采用 iframe 来预先加载 `data-no-service-worker-fallback-shell-url` 配置的 Shell URL
4. `<mip-install-serviceworker>` 会拦截 MIP 页面里的链接点击，匹配 `data-no-service-worker-fallback-url-match` 规则的会跳转到对应的 shell url

链接会按照这个规则去改写：`shell-url#href={encodeURIComponent(href)}`. 如下面的例子：

```
https://pub.com/doc.mip.html
--->
https://pub.com/shell#href=%2Fdoc.mip.html
```

除了 URL 改写之外，`<mip-install-serviceworker>` 也会尝试预先加载 shell，同样也是通过创建 iframe 的方式来加载的，如下：

```html
<iframe src="https://pub.com/shell#preload" hidden sandbox="allow-scripts allow-same-origin"></iframe>
```

为了最佳效果，当然，shell 的返回应该能够有比较合适的 HTTP 缓存策略。
