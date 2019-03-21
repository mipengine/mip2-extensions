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
  src="http://boscdn.baidu.com/v1/assets/mipengine/app_logo.png"
  texttip= "['搜索+资讯（有图版）','下载百度App','下载百度App']"
  downbtntext="立即使用"
  other-downsrc="https://downapp.baidu.com/baidusearch/AndroidPhone/11.3.0.13/1/757b/20190108123357/baidusearch_AndroidPhone_11-3-0-13_757b.apk"
  android-downsrc="https://downapp.baidu.com/baidusearch/AndroidPhone/11.3.0.13/1/757b/20190108123357/baidusearch_AndroidPhone_11-3-0-13_757b.apk"
  ios-downsrc="itms-apps://itunes.apple.com/app/id382201985">
</mip-appdl>
```

### 固定位置

使用悬浮组件支持

```html
<mip-fixed type="bottom">
  <mip-appdl
    src="http://boscdn.baidu.com/v1/assets/mipengine/app_logo.png"
    texttip= "['搜索+资讯（有图版）','下载百度App','下载百度App']"
    downbtntext="立即使用"
    other-downsrc="https://downapp.baidu.com/baidusearch/AndroidPhone/11.3.0.13/1/757b/20190108123357/baidusearch_AndroidPhone_11-3-0-13_757b.apk"
    android-downsrc="https://downapp.baidu.com/baidusearch/AndroidPhone/11.3.0.13/1/757b/20190108123357/baidusearch_AndroidPhone_11-3-0-13_757b.apk"
    ios-downsrc="itms-apps://itunes.apple.com/app/id382201985">
  </mip-appdl>
</mip-fixed>
```


## 属性

### src

说明：图片地址

必填：否

格式：字符串

取值：URL 类型

### texttip

说明：显示文字

必填：否

格式：字符串

使用限制：最多显示两项

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

## 注意事项

组件可能会被浏览器的广告过滤策略屏蔽