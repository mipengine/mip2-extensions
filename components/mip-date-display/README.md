# mip-date-display 组件

时间显示组件，支持不同地区语言、格式和时区

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本| https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js<br>https://c.mipcdn.com/static/v2/mip-date-display/mip-date-display.js

`mip-date-display` 组件用于在 MIP 页面中显示不同格式的时间。只需要在组件的标签上配置特定的时间属性，组件将会计算出一系列的时间值，配合 `mip-mustache` 组件，就可以把这些值按照特定的需求渲染出来。如下示例：

## 示例

```html
  <mip-date-display datetime="2019-04-29T11:33:03.214Z">
    <template type="mip-mustache">
      <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
    </template>
  </mip-date-display>
```

将显示为：
```
year:2019; month:4; monthName:四月; day:29; dayName:星期一; dayNameShort:周一; hour:19; minute:33; second:3; iso:2019-04-29T11:33:03.214Z; yearTwoDigit:19; monthTwoDigit:04; dayTwoDigit:29; hourTwoDigit:19; hour12:7; minuteTwoDigit:33; secondTwoDigit:03; dayPeriod:pm;
```
## 时间格式

格式 | 输出示例 | 备注
-- | -- | -
{year}-{month}-{day} {hour}:{minute}:{second} | 2019-4-29 19:33:3 | -
{yearTwoDigit}-{monthTwoDigit}-{dayTwoDigit} {hourTwoDigit}:{minuteTwoDigit}:{secondTwoDigit} | 2019-04-29 19:33:03 | -
{monthName} {dayName} {dayNameShort} | 四月 星期一 周一 | `locale='zh-cn'`
{iso} | 2019-04-29T11:33:03.214Z | -
{hour12} {dayPeriod}| 7 pm | -

## 属性

用来指定目标时间的参数：`datetime`, `timestamp-ms`, `timestamp-seconds`, 至少需要其中一个。

### datetime

ISO 格式的时间，如 `2019-04-29T11:33:03.214Z`

### timestamp-ms

目标时间戳（ms），如 `1556537583214`

### timestamp-seconds

目标时间戳（s），如 `1556537583`

### offset-seconds (可选)

距离目标时间的时间偏移量（s），可以是正数或负数，如 `offset-seconds="60"` 表示将目标时间增加 60 秒

### display-in (可选)

如果设置为值utc，则display-in属性会将给定日期转换为UTC。

### locale (可选)

设置时间单位显示的语言，默认值 `zh-cn`（简体中文）

locale 值 | 语言
-- | --
de | German
en | English
es | Spanish
fr | French
id | Indonesian
it | Italian
ja | Japanese
ko | Korean
nl | Dutch
pt | Portuguese
ru | Russian
th | Thai
tr | Turkish
vi | Vietnamese
zh-cn | 简体中文
zh-tw | Chinese Traditional

## 示例

```html
    <!-- display with datetime -->
  <mip-date-display datetime="2019-04-29T11:33:03.214Z">
    <h2>Date: 2019-04-29T11:33:03.214Z</h2>
    <template type="mip-mustache">
       <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
    </template>
  </mip-date-display>

  <!-- display in utc -->
  <mip-date-display datetime="2019-04-29T11:33:03.214Z" display-in="utc">
      <h2>Date: 2019-04-29T11:33:03.214Z</h2>
      <template type="mip-mustache">
         <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
      </template>
  </mip-date-display>

  <!-- display with timestamp-ms -->
  <mip-date-display timestamp-ms="1556537583214">
      <h2>timestamp-ms: 1556537583214</h2>
      <template type="mip-mustache">
         <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
      </template>
  </mip-date-display>

  <!-- display with timestamp-seconds -->
  <mip-date-display timestamp-seconds="1556537583">
      <h2>timestamp-seconds: 1556537583</h2>
      <template type="mip-mustache">
         <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
      </template>
  </mip-date-display>

  <!-- display with timestamp-seconds and offset-seconds -->
  <mip-date-display timestamp-seconds="1556537583" offset-seconds="600">
      <h2>timestamp-seconds: 1556537583; offset-seconds: 600</h2>
      <template type="mip-mustache">
         <div>
        year:{{year}}; month:{{month}}; monthName:{{monthName}}; day:{{day}}; dayName:{{dayName}}; dayNameShort:{{dayNameShort}}; hour:{{hour}}; minute:{{minute}}; second:{{second}}; iso:{{iso}}; yearTwoDigit:{{yearTwoDigit}}; monthTwoDigit:{{monthTwoDigit}}; dayTwoDigit:{{dayTwoDigit}}; hourTwoDigit:{{hourTwoDigit}}; hour12:{{hour12}}; minuteTwoDigit:{{minuteTwoDigit}}; secondTwoDigit:{{secondTwoDigit}}; dayPeriod:{{dayPeriod}};
      </div>
      </template>
  </mip-date-display>
```
