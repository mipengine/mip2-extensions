# mip-linksubmit

自动推送组件。

标题|内容
----|----
类型|通用
支持布局|nodisplay
所需脚本| [https://c.mipcdn.com/static/v2/mip-linksubmit/mip-linksubmit.js](https://c.mipcdn.com/static/v2/mip-linksubmit/mip-linksubmit.js)

## 说明

在页面被访问时，页面 URL 将立即被推送给百度。百度自动推送相关[文档说明](https://ziyuan.baidu.com/college/courseinfo?id=267&page=2)

## 示例

```html
<mip-linksubmit type="baidu" layout="nodisplay"></mip-linksubmit>
```

## 属性

### type

说明：自动推送类型

必选项：是

类型：字符串

取值：'baidu'