# mip-select-item

标题|内容
----|----
类型|
支持布局|
所需脚本| [https://c.mipcdn.com/static/v2/mip-select-item/mip-select-item.js](https://c.mipcdn.com/static/v2/mip-select-item/mip-select-item.js)

## 说明

组件功能说明

tab选项卡下拉列表，下拉列表对应很多种情况

## 示例

示例说明

```
// 代码示例
```

## 必要的class

### mip-select-item

**说明**：tab选项卡的class

### select-fixed-popup
**说明**：tab下拉时，背景蒙版不显示的时候的class
### select-fixed-popup-active
**说明**：背景蒙版显示的时候的class

### select-wrapper
**说明**：组件内tab最外层的div的class

### more-bottom-close
**说明**：tab下拉列表里面的【清空】按钮class

### area_list
**说明**：切换面积点击事件，需要替换的html的div的class

## 属性

### modal

**说明**：tab选项卡根据该属性，找到对应的下拉列表class，进行显示隐藏操作

**必选项**：必选项

### expend

**说明**：tab选项卡的显示或者隐藏状态标识，tab选项卡根据该属性进行显示隐藏操作

**必选项**：必选项

**默认值**：close

### is-background
**说明**：tab下拉时是否需要背景蒙版
**默认值**：true（字符串）

### is-top
**说明**：点击tab选项卡时，是否需要置顶
**默认值**：false（字符串）

### is-district

**说明**：判断是否为地区列表三级联动的标识

### is-industry

**说明**：类型二级列表，二级联动

### fetch-url

**说明**：地区三级联动的请求地址，jsonp请求方式，在is-district，is-industry为true的时候，该参数必须存在，否则不会请求数据的
