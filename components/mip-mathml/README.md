# `mip-mathml`

标题|内容
----|----
类型|
支持布局| responsive, fixed-height, fill, container, fixed
所需脚本| [https://c.mipcdn.com/static/v2/mip-mathml/mip-mathml.js](https://c.mipcdn.com/static/v2/mip-mathml/mip-mathml.js)

## 说明

这个扩展组件会创建一个 iframe 并且渲染 MathML 公式

## 示例

示例：二次公式

```html
<mip-mathml layout="container" formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"></mip-mathml>
```

示例：柯西积分公式

```html
<mip-mathml layout="container" formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]"></mip-mathml>
```

示例：余弦的双角公式

```html
<mip-mathml layout="container" formula="\[ \cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ) \]"></mip-mathml>
```

示例：内敛公式

```html
这个例子  <mip-mathml layout="container" inline formula="\[ \cos(θ+φ) \]"></mip-mathml> 让这个公式内敛在文本当中
```

## 属性

### formula

说明：指定要渲染的公式 
必填：是    
格式：字符串      
单位：无   
默认值：无  
使用限制：无

### inline

说明：这个公式需要内敛
必填：否
格式：布尔      
单位：无   
默认值：false  
使用限制：无

### mathjaxConfig

说明: mathjax 配置参数，参考 http://docs.mathjax.org/en/latest/config-files.html#common-configurations
必填：否
格式：字符串     
单位：无   
默认值：TeX-MML-AM_CHTML （包含最全的数学公式支持）  
使用限制：无
