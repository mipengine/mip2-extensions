# mip-other-ad 广告

`<mip-other-ad>` 用于在 MIP 页中引入广告脚本，投放广告。

标题|内容
----|----
类型|通用
支持布局|responsive
所需脚本|https://c.mipcdn.com/static/v2/mip-other-ad/mip-other-ad.js

## 广告类型选择

`<mip-other-ad>` 具有多种类型（`type`），`type` 取值由广告分类决定。

### 1. type=default
| 参数     | 参数值     | 是否必须              |
| -------- | -------- | ------------------------|
| type     | default     | 是                    |
| src | script中src的值 | 是                     |

适用于以下广告格式：
```html
<script type="text/javascript" src="广告js地址"></script>
```
示例：
```html
<mip-other-ad type="default" src="//fzb01.qiushibaike.com/production/sesln1.js?togl=nkpqq"></mip-other-ad>
```

### 2. type=smua
| 参数     | 参数值     | 是否必须              |
| -------- | -------- | ------------------------|
| type     | smua     | 是                    |
| src | script中smua的属性值 | 是                     |

适用于以下广告格式：
```html
<script type="text/javascript" smua="smua属性值" src="//www.smucdn.com/smu0/o.js"></script>
```
示例：
```html
<mip-other-ad type="smua" src="d=m&s=b&u=u3594595&h=330"></mip-other-ad>
```

### 3. type=sogou
| 参数     | 参数值     | 是否必须              |
| -------- | -------- | ------------------------|
| type     | sogou     | 是                    |
| src | 搜狗id | 是                     |
| script | script中src的值 | 否，默认为`//theta.sogoucdn.com/wap/js/aw.js`|

适用于以下广告格式：
```html
<div id="sogou_wap_搜狗id"></div>
<script>
	var sogou_div = document.getElementById("sogou_wap_搜狗id"); 
	window.sogou_un = window.sogou_un || [];
	window.sogou_un.push({id: "搜狗id",ele:sogou_div});
</script>
<script async="async" src="//theta.sogoucdn.com/wap/js/aw.js"></script>
```
示例：
```html
<mip-other-ad type="sogou" src="1000745" script=""></mip-other-ad>
```

### 3. type=sogou_auto
| 参数     | 参数值     | 是否必须              |
| -------- | -------- | ------------------------|
| type     | sogou     | 是                    |
| src | 搜狗id | 是                     |
| w | w值 | 是                     |
| h | h值 | 是                     |
| script | script中src的值 | 否，默认为`//theta.sogoucdn.com/wap/js/aw.js`|

适用于以下广告格式：
```html
<div id="sogou_wap_搜狗id"></div>
<script>
	var sogou_div = document.getElementById("sogou_wap_搜狗id"); 
	window.sogou_un = window.sogou_un || [];
	window.sogou_un.push({id: "搜狗id",ele:sogou_div,w:20,h:5});
</script>
<script async="async" src="//theta.sogoucdn.com/wap/js/aw.js"></script>
```
示例：
```html
<mip-other-ad type="sogou_auto" src="1001690" w="20" h="5" script=""></mip-other-ad>
```
