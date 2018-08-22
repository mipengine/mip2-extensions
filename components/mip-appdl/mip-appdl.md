# mip-appdl App 下载

App 下载，可区分 Android 和 iOS。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-appdl/mip-appdl.js

## 示例

### 有图样式

```html
<mip-appdl
  tpl="imageText"
  src="http://ms0.meituan.net/touch/css/i/logo.png"
  texttip= "['积分能当钱花了','下载百度浏览器','下载百度浏览器']"
  downbtntext="立即使用"
  other-downsrc="http://sqdd.myapp.com/myapp/qqteam/AndroidQQ/mobileqq_android.apk"
  android-downsrc="http://sqdd.myapp.com/myapp/qqteam/AndroidQQ/mobileqq_android.apk"
  ios-downsrc="itms-apps://itunes.apple.com/app/id452186370" postiontye="fixed">
</mip-appdl>
```

### 固定位置

使用悬浮组件支持

```html
<mip-fixed type="bottom">
  <mip-appdl
    tpl="imageText"
    src="http://ms0.meituan.net/touch/css/i/logo.png"
    texttip= "['积分能当钱花了','下载百度浏览器','下载百度浏览器']"
    downbtntext="立即使用"
    other-downsrc="http://sqdd.myapp.com/myapp/qqteam/AndroidQQ/mobileqq_android.apk"
    android-downsrc="http://sqdd.myapp.com/myapp/qqteam/AndroidQQ/mobileqq_android.apk"
    ios-downsrc="itms-apps://itunes.apple.com/app/id452186370" postiontye="fixed"
  ></mip-appdl>
</mip-fixed>
```


## 属性

### tpl (废弃)

### src

说明：图片地址
必填：是（`tpl` 为 `imageText` 的场景）
格式：字符串
取值：URL 类型

### texttip

说明：显示文字
必填：是
格式：字符串

### android-downsrc

说明：安卓下载路径
必填：否
格式：字符串
取值：URL 类型
使用限制：直接下载需要传递 apk 直接下载路径否则可传下载页路径，如果对应系统没有下载链接则显示默认链接

### ios-downsrc

说明：iOS 下载路径
必填：否
格式：字符串
取值：URL 类型
使用限制：必须填写 appStore 下载路径（如：itms-apps://itunes.apple.com/app/id452186370）或者下载页路径，如果对应系统没有下载链接则显示默认链接

### other-downsrc

说明：其他设备下载路径
必填：否
格式：字符串
取值：URL 类型
使用限制：如果对应系统没有下载链接时显示默认链接
