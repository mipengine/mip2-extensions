# mip-ppkao-showlistindex

mip-ppkao-showlistindex 显示隐藏导航

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://mipcache.bdstatic.com/extensions/platform/v1/mip-ppkao-showlistindex/mip-ppkao-showlistindex.js

## 示例

### 基本用法
```html
<mip-ppkao-showlistindex data-closetext="收起">
    
</mip-ppkao-showlistindex>
```

## 属性

### data-showlistindex
说明：上滑时显示文字
必选项：否
类型：字符串
取值范围：{取值范围}
单位：
默认值：''


## 注意事项
在按钮中增加on属性，注意on属性中需要填写对应 mip-ppkao-showlistindex 的id。
比如本例中，mip-ppkao-showlistindex id="showmore01"，on属性需要写成on="tap:showmore01.toggle"

