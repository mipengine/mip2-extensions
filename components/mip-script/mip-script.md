# `mip-script` 自定义 js

允许开发者在 MIP 页面里编写 JS 代码，让编写 MIP 页面更加灵活

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|

## 说明

只需要在 `<mip-script></mip-script>` 内正常书写 JS 代码即可。

JS 代码会运行在沙盒环境中，仅开放部分全局对象供开发者使用，非白名单内的对象的行为将不能正常执行

白名单列表：
```javascript
// window 下允许访问的变量
[
  'Array',
  'ArrayBuffer',
  'Blob',
  'Boolean',
  'DOMError',
  'DOMException',
  'Date',
  'Error',
  'File',
  'FileList',
  'FileReader',
  'Float32Array',
  'Float64Array',
  'FormData',
  'Headers',
  'Image',
  'ImageBitmap',
  'Infinity',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'JSON',
  'Map',
  'Math',
  'MutationObserver',
  'NaN',
  'Notification',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'ReadableStream',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Request',
  'Response',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'URIError',
  'URL',
  'URLSearchParams',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'WritableStream',
  'addEventListener',
  'cancelAnimationFrame',
  'clearInterval',
  'clearTimeout',
  'console',
  'createImageBitmap',
  'decodeURI',
  'decodeURIComponent',
  'devicePixelRatio',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'fetch',
  'getComputedStyle',
  // 待定
  'history',
  'innerHeight',
  'innerWidth',
  'isFinite',
  'isNaN',
  'isSecureContext',
  'localStorage',
  // 待定
  'location',
  'length',
  'matchMedia',
  'navigator',
  'outerHeight',
  'outerWidth',
  'parseFloat',
  'parseInt',
  'removeEventListener',
  'requestAnimationFrame',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scroll',
  'scrollBy',
  'scrollTo',
  'scrollX',
  'scrollY',
  'scrollbars',
  'sessionStorage',
  'setInterval',
  'setTimeout',
  'undefined',
  'unescape',
  'webkitCancelAnimationFrame',
  'webkitRequestAnimationFrame'
]

// 沙盒中的全局变量
[
  'document',
  'window',
  'MIP'
]

// 保留字段
[
  'arguments',
  'MIP',
  'require',
  'module',
  'exports',
  'define'
]

// document 下允许访问的变量
[
  'head',
  'body',
  'title',
  'cookie',
  'referrer',
  'readyState',
  'documentElement',
  'createElement',
  'createDcoumentFragment',
  'getElementById',
  'getElementsByClassName',
  'getElementsByTagName',
  'querySelector',
  'querySelectorAll'
]
```

## 示例

```html
<mip-script>
  MIP.watch('price', function (newVal, oldVal) {
    console.log('price changed')
  })
</mip-script>
```

## 属性

无
