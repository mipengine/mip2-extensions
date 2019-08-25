#
## 属性

<!-- ### inputId

说明：要绑定的 input 的 id，通过 html 的 id 属性设置，不写无法绑定 input

必选项：是

类型 ：字符串

默认值：无 -->

### mode

说明：选择器模式。date-picker | range-picker: 日期选择或者范围选择

必选项：是

类型 ：字符串

默认值：date-picker

### minDate

### maxDate

### selectedDate

### hilightDate

说明：默认选中日期

必选项：否

类型：字符串，格式为 `YYYY-MM-DD` 如：2019-08-18

默认值：当前日期

### dayOffset

说明：日历默认最左侧为周日，即 `日 一 二 三 四 五 六`，可以通过 `dayOffset` 调整是从周几开始

必选项：否

类型：数字

默认值：0

### format

说明：input 框里显示的日期的格式。`y`表示年，`M`表示月，`d`表示日，`h`表示小时，`m`表示分钟，`s`表示秒，`S`表示毫秒,`q`表示季度，字母大小写敏感，请注意大小写问题。

必选项：否

类型：字符串

默认值：yyyy-MM-dd
