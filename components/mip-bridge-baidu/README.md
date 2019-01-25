# mip-bridge-baidu 百度商桥

引入百度商桥功能。

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-bridge-baidu/mip-bridge-baidu.js

## 说明

引入百度商桥功能，可以通过以下两种方式之一：
1. 通过参数 `site-id` 直接引入商桥
2. 通过百度统计 `token` 引入商桥

## 示例

### 通过参数 `site-id` 直接引入商桥

```html
<mip-bridge-baidu site-id="10400900"></mip-bridge-baidu>
```
### 通过百度统计 `token` 引入商桥

```html
<mip-bridge-baidu token="98fecfe81b36aa1045d94554a4ac34a5"></mip-bridge-baidu>
```

## 属性

### site-id

**说明**：在商桥客户端中获取的站点 `id`

**必填**：否

**类型**：`string`

### token

**说明**：在商桥客户端中，百度统计脚本 `hm.js?` 后的字符串

**必填**：否

**类型**：`string`
