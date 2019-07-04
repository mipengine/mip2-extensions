# mip-ppkao-shitisearch

mip-ppkao-shitisearch ppkao试题shitisearch

标题|内容
----|----
类型|通用
支持布局|responsive,fixed-height,fill,container,fixed
所需脚本|https://mipcache.bdstatic.com/extensions/platform/v1/mip-ppkao-shitisearch/mip-ppkao-shitisearch.js

## 示例

### 基本用法
```html
<mip-ppkao-shitisearch id="shitisearch" data-class="hide">
    
</mip-ppkao-shitisearch>
```
## 属性

### data-class
说明：单击按钮时添加或删除的类名
必选项：是
类型：字符串
单位：
默认值：'hide'


## 注意事项
在按钮中增加on属性，注意on属性中需要填写对应 mip-ppkao-showsubject 的id。
比如本例中，mip-ppkao-shitisearch id="shitisearch"，on属性需要写成on="tap:shitisearch.toggle"