# mip-timeago 组件

用于将指定时间转换为 `*** time ago` 的形式，例如，3天前，2月前，31年后，5 years ago

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本| https://c.mipcdn.com/static/v2/mip-timeago/mip-timeago.js

## 示例

```html
  <mip-timeago datetime="1539477453809"></mip-timeago>
  <mip-timeago datetime="1519628552201" locale="zhCN"></mip-timeago>
  <mip-timeago datetime="1519628552201" locale="ja"></mip-timeago>
  <mip-timeago datetime="1519628552201" locale="ko"></mip-timeago>
  <mip-timeago datetime="1519628552201" locale="en" cutoff="3600">2018-2-26</mip-timeago>
```

## 属性

### datetime (必须)

需要转换的目标时间，时间戳(ms)，如 1539477453809

### locale (可选)

显示语言，默认中文，值为 `zhCN`，可以指定如下语言：

<ul>
  <li>ar (Arabic)</li>
  <li>be (Belarusian)</li>
  <li>bg (Bulgarian)</li>
  <li>ca (Catalan)</li>
  <li>da (Danish)</li>
  <li>de (German)</li>
  <li>el (Greek)</li>
  <li>en (English)</li>
  <li>enShort (English - short)</li>
  <li>es (Spanish)</li>
  <li>eu (Basque)</li>
  <li>fi (Finnish)</li>
  <li>fr (French)</li>
  <li>he (Hebrew)</li>
  <li>hu (Hungarian)</li>
  <li>inBG (Bangla)</li>
  <li>inHI (Hindi)</li>
  <li>inID (Malay)</li>
  <li>it (Italian)</li>
  <li>ja (Japanese)</li>
  <li>ko (Korean)</li>
  <li>ml (Malayalam)</li>
  <li>nbNO (Norwegian Bokmål)</li>
  <li>nl (Dutch)</li>
  <li>nnNO (Norwegian Nynorsk)</li>
  <li>pl (Polish)</li>
  <li>ptBR (Portuguese)</li>
  <li>ro (Romanian)</li>
  <li>ru (Russian)</li>
  <li>sv (Swedish)</li>
  <li>ta (Tamil)</li>
  <li>th (Thai)</li>
  <li>tr (Turkish)</li>
  <li>uk (Ukrainian)</li>
  <li>vi (Vietnamese)</li>
  <li>zhCN (Chinese)</li>
  <li>zhTW (Taiwanese)</li>
</ul>

### cutoff (可选)

如果当前时间和目标时间的距离（秒）大于 cutoff 的值（秒），则显示组件的默认内容（textContent）。
