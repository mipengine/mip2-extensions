# mip-html-os 操作系统

根据操作系统来区分应该显示的内容，支持 Andriod 和 iOS。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-html-os/mip-html-os.js

仅当操作系统与 `os` 属性值匹配时显示内容。如果没有指定 `os` 属性值，隐藏内容。

## 示例

```html
<mip-html-os os="android"><p>This Is Android</p></mip-html-os>
<mip-html-os os="ios"><p>This Is Ios</p></mip-html-os>
```

## 属性

### os

指定操作系统，取值范围是 `android` 和 `ios`。