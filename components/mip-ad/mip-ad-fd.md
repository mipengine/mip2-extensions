# mip-ad:ad-fd 家庭医生在线广告

mip 广告组件 `<mip-ad>` 的一种类型：家庭医生在线提供的广告。

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, container
所需脚本| [https://c.mipcdn.com/static/v2/mip-ad/mip-ad.js](https://c.mipcdn.com/static/v2/mip-ad/mip-ad.js)

## 示例

### 基本用法

```html
// 代码示例
<mip-ad
  layout="responsive"
  width="100"
  height="30"
  type="ad-fd"
  data-id="143">
</mip-ad>
```

## 属性

### type

**说明**：广告类型

**必选项**：是

**类型**：字符串

**取值**：ad-fd

### data-id

**说明**：广告位 id

**必选项**：是

**类型**：数字