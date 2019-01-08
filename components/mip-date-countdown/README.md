# mip-date-countdown 组件

倒计时组件

标题|内容
----|----
类型|通用
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本| https://c.mipcdn.com/static/v1/mip-mustache/mip-mustache.js</br>https://c.mipcdn.com/static/v2/mip-date-countdown/mip-date-countdown.js

## 示例

```html
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>
```

将显示为：
```
591 天, 08 小时, 10 分钟, 58 秒
```
## 时间格式

格式 | 输出示例 | 备注
-- | -- | -
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours} and {m} {minutes} and {s} {seconds} | 4 小时 and 1 分钟 and 45 秒 | -
{d} {days} {h}:{mm} | 1 天 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | -
{d} {days} {h} {hours} {m} {minutes} | 20 天 5 小时 10 分钟 | -
{h} {hours} {m} {minutes} | 240 小时 10 分钟 | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 days 5 hours 10 minutes | `locale='en'`

## 属性

用来指定目标时间的参数：`end-date`, `timestamp-ms`, `timestamp-seconds`，`timeleft-ms`, 至少需要其中一个。

### end-date

ISO 格式的时间，如 `2020-06-01T00:00:00+08:00`

### timestamp-ms

目标时间戳（ms），如 `1590940800000`

### timestamp-seconds

目标时间戳（s），如 `1590940800`

### timeleft-ms

剩余时间（ms），如 `3600000`

### offset-seconds (可选)

距离目标时间的时间偏移量（s），可以是正数或负数，如 `offset-seconds="60"` 表示将目标时间增加 60 秒

### biggest-unit (可选)

设置倒计时的最大时间单位，默认值 `days`。如倒计时时间是 `10 天 10 小时 20 分钟`，若设置 `biggest-unit="hours"`，则时间显示为：`250 小时 20 分钟`

可选值：`days`，`hours`，`minutes`，`seconds`
默认值：`days`

### when-ended (可选)

用于设置倒计时结束（0天0时0分0秒）时，是否停止计时器。默认值 `stop`。设置成 `continue` 时，0 秒后会继续执行倒计时。注意：使用 `timeout` 事件时，必须将 `when-ended` 置为 `stop`。

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

## 事件

事件名称 | 事件描述
-- | --
`timeout` | 标志着倒计时结束，`when-ended` 值必须为默认值 `stop`

如下示例，30秒倒计时结束时，组件将触发 `timeout` 事件，下方的段落文字将自动替换为“时间到了”。

```html
  <mip-data>
      <script type="application/json">
        {
          "status": "倒计时进行中..."
        }
      </script>
  </mip-data>

  <mip-date-countdown timeleft-ms="30000" when-ended="stop" on="timeout:MIP.setData({status:'时间到了'})">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <p m-text="status"></p>
```

## 示例

```html
  <!-- end-date -->
  <h2>end-date</h2>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- timestamp-ms -->
  <h2>timestamp-ms</h2>
  <mip-date-countdown timestamp-ms="1590940800000">
    <template type="mip-mustache">
      <div>
        {{d}} {{days}}, {{h}} {{hours}}, {{m}} {{minutes}}, {{s}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- timestamp-seconds -->
  <h2>timestamp-seconds</h2>
  <mip-date-countdown timestamp-seconds="1590940800">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- timeleft-ms -->
  <h2>timeleft-ms</h2>
  <mip-date-countdown timeleft-ms="3600000">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- offset-seconds -->
  <h2>offset-seconds</h2>
  <mip-date-countdown timeleft-ms="3600000" offset-seconds="-60">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- locale -->
  <h2>locale</h2>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00" locale="en">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00" locale="ko">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00" locale="th">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00" locale="zh-tw">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>

  <!-- biggest-unit -->
  <h2>biggest-unit</h2>
  <mip-date-countdown end-date="2020-06-01T00:00:00+08:00" biggest-unit="hours">
    <template type="mip-mustache">
      <div>
        {{dd}} {{days}}, {{hh}} {{hours}}, {{mm}} {{minutes}}, {{ss}} {{seconds}}
      </div>
    </template>
  </mip-date-countdown>
```
