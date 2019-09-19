# mip-form

标题|内容
----|----
类型|动态内容
支持布局|responsive, fixed-height, fill, container, fixed
所需脚本|https://c.mipcdn.com/static/v2/mip-form/mip-form.js <br/> https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js

## 示例

### 基本使用

`mip-form` 可在 MIP 页面创建 `<form>` 标签用于表单提交。在 `<mip-form>` 内部，通常需要配合其他相关的元素使用，包括 `<textarea>`, `<select>`, `<option>`, `<fieldset>`, `<label>`, `<input type=text>`, `<input type=submit>` 等。

`mip-form` 通过必选项 `method` 设置提交方法，`url` 设置表单提交地址。同时可选项 `validatetarget` 和 `validatetype` 支持对表单中 `input` 进行校验。

```html
<mip-form method="get" url="https://www.mipengine.org?we=123">
  <input type="text" name="username" validatetarget="username" validatetype="must" placeholder="姓名">
  <div target="username">姓名不能为空</div>
  <input type="number" name="age" validatetarget="age" validatetype="must" placeholder="年龄">
  <div target="age">年龄不能为空</div>
  <input type="submit" value="提交">
</mip-form>
```
### 非输入型参数

非输入型参数，比如某些常量、环境变量、当前的某些状态数据等等，可以在 mip-form 内部添加隐藏 `<input>` 标签，然后将数据直接写入 value，或者通过 MIP 数据绑定语法 `m-bind:value` 将数据自动写入：

```xml
<mip-data>
  <script type="application/json">
  {
    "state": 12345
  }
  </script>
</mip-data>

<mip-form url="https://path/to/api">
  <input type="text" placeholder="请输入姓名" name="name">
  <!-- 隐藏表单 1 直接写入 value -->
  <input hidden type="text" value="abcdefg" name="id">
  <!-- 隐藏表单 2 通过数据绑定语法写入 -->
  <input hidden type="text" m-bind:value="state" name="state">
</mip-form>
```

### 表单校验

`mip-from` 提供多种默认校验类型支持前端输入校验，例如设置 `validatetype=“email”`  可以校验输入是否为 email 地址，同时也支持自定义正则校验。支持在校验失败时，设置不同策略反馈校验结果展示给用户。

#### 非空校验

校验用户输入是否为空，可以在用户输入 `<input>` 元素设置属性 `required`（注：原校验方法为设置 `validatetype=“must”` 已废弃，不建议继续使用）

```html
<mip-form method="get" url="https://www.mipengine.org" target="_blank">
  <label>
    <span>搜索</span>
    <input type="search" name="term" required>
  </label>
  <input name="submit-button" type="submit" value="Search">
</mip-form>
```

#### 自定义校验规则

在表单上对用户输入指定自定义校验：

* 将校验类型设置为 `custom ` 即 `validatetype=“custom”`
* 使用属性 `validatereg` 设置正则规则

```html
<mip-form method="get" url="https://www.mipengine.org">
  <input type="text" name="customnumber" validatetarget="customnumber" validatetype="custom" validatereg="^[0-9]*$" placeholder="我是自定义验证规则数字">
  <div class="mip-form-target" target="customnumber"> 请输入正确的数字 </div>
  <input type="submit" value="提交">
</mip-form>
```

#### 校验结果反馈

发生校验错误时需要设置合理的用户提示

* 使用 `validatetarget` 指定目标校验项，同时在对应的校验提示 DOM 设置 `target`。例如示例中，设置目标校验项为 `validatetarget="customnumber"`，校验失败时提示为 `<div target="customnumber">`。

* 一个校验项有多个提示 DOM 时，可以通过 `visible-when-invalid` 指定发生不同错误类型时，展示对应的错误提示。例如示例中，通过 `visible-when-invalid="valueMissing"` 指定输入为空时展示的提示， `visible-when-invalid="patternMismatch" `指定输入与正则不匹配时展示的提示。

提交表单时  `custom-validation-reporting` 可以设置表单校验后反馈用户的策略：

- `show-first-on-submit` 表单验证时在发生第一个验证错误时停止
- `show-all-on-submit` 显示所有无效输入的校验错误
- `as-you-can` 在用户输入交互时反馈验证信息

```html
<mip-form method="get"
  url="https://www.mipengine.org"
  custom-validation-reporting="show-first-on-submit">
  <input
    type="text"
    name="customnumber"
    validatetarget="customnumber"
    validatetype="custom"
    validatereg="^[0-9]*$"
    placeholder="输入数字"
    required>
  <div target="customnumber" visible-when-invalid="valueMissing">数字不能为空</div>
  <div target="customnumber" visible-when-invalid="patternMismatch">请输入正确的数字</div>
  <input type="email"
    name="email"
    validatetarget="email"
    validatetype="custom"
    validatereg="^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$"
    placeholder="邮箱"
    required>
  <div target="email" visible-when-invalid="valueMissing">email 不能为空</div>
  <div target="email" visible-when-invalid="patternMismatch">请输入正确的 email 地址</div>
  <input type="submit" value="提交">
</mip-form>
```

### 异步请求更新页面

`mip-form` 通过 `fetch-url` 属性支持异步提交表单，配合模版组件 `mip-mustache` 可以方便的更新渲染页面。使用模版渲染更新页面方法如下：

* 在页面中引入 [mip-mustache](https://www.mipengine.org/v2/components/dynamic-content/mip-mustache.html) 组件 `<script src="https://c.mipcdn.com/static/v2/mip-mustache/mip-mustache.js"></script>`。
* 在 `<mip-form>` 任意子元素上声明以下表格所示响应属性。
* 在使用响应属性的元素中，通过模版 `<template type="mip-mustache"></template>` 创建对应的需要被渲染的内容。
* 服务器返回合法的 JSON 对象给 `submit-success `和 `submit-error` 用于模版渲染。注意服务器响应 header 包括 `Content-Type: application/json`。

| 属性             | 描述                                 |
| ---------------- | ------------------------------------ |
| `submit-success` | form 提交响应成功展现信息            |
| `submit-error`   | form 提交响应失败展现信息            |
| `submitting`     | 可以用来在 form 表单被提交时展现信息 |

下面是一个示例，提交表单过程中，成功或失败后都有对应不同的 DOM 展示。

```html
<mip-form
  method="POST"
  fetch-url="./mock.json">
  <input type="text" name="name" placeholder="姓名" validatetarget="name" required>
  <div target="name">输入不能为空</div>
  <input type="submit" value="提交">
  <div submitting>
    <template type="mip-mustache">
      <p>正在提交申请，请耐心等待</p>
    </template>
  </div>
  <div class="mip-example-submit-results" submit-success>
    <template type="mip-mustache">
      <p>{{name}} 提交成功！用户信息如下: </p>
      <p>年龄{{age}}</p>
      <p>邮箱{{email}}</p>
      <p>电话{{telephone}}</p>
    </template>
  </div>
  <div submit-error>
    <template type="mip-mustache">
      Sorry, 请求发生了一点错误
    </template>
  </div>
</mip-form>
```

### 加清空按钮

`<mip-form>` 添加 `clear` 属性可以对表单中 `<input>` 添加清空按钮。

```html
<mip-form method="get" url="https://www.mipengine.org" clear>
  <input type="text" name="username2" validatetarget="username2" validatetype="must" placeholder="姓名">
  <div target="username2">姓名不能为空</div>
  <input type="number" name="age2" validatetarget="age2" validatetype="must" placeholder="年龄">
  <div target="age2">年龄不能为空</div>
  <input type="submit" value="提交">
</mip-form>
```
## 事件

`mip-form` 支持以下 event，对应说明如下表所示：

|事件| 描述| 数据|
|----|:---|----|
|`submit`| form 表单被提交时触发||
|`valid`| form 输入校验合法||
|`invalid`| form 输入校验不合法 ||
|`submitSuccess`| form 提交完成并且响应成功时触发| `event.response` 响应 JSON 数据|
|`submitError`| form 提交完成并且响应失败时触发| `event.response` 响应 JSON 数据|

下面举例说明各事件的使用方法：

```html
<mip-data>
  <script type="application/json">
  {
    "valid": null,
    "status": null,
    "submit": null
  }
  </script>
</mip-data>

<mip-form
  method="get"
  fetch-url="https://path/to/404/api"
  on="
    submit:MIP.setData({
      submit: true,
      status: null,
      valid: null
    });
    valid:MIP.setData({
      valid: true,
      status: null
    });
    invalid:MIP.setData({
      valid: false,
      status: null
    });
    submitSuccess:MIP.setData({ status: 'success' });
    submitError:MIP.setData({ status: 'fail' });
  "
>
  <input type="text" name="num" validatetype="custom" validatereg="^[0-9]{5}$" placeholder="请输入 5 个数字">
  <input type="submit" value="提交">
</mip-form>

<br>
<p>当前数据提交的阶段：</p>
<br>
<ul>
  <li m-bind:style="{
    color: submit == null ? '#666' : 'green'
  }">提交</li>
  <li m-bind:style="{
    color: valid == null
      ? '#666'
      : valid === true
        ? 'green' : 'red'
  }">校验</li>
  <li m-bind:style="{
    color: status === null
      ? '#666'
      : status === 'success' ? 'green' : 'red'
  }">结束</li>
</ul>
```

## 行为

`mip-form` 支持以下 action

行为| 描述
----| ---
`submit`| 提交表单
`clear` | 清空表单，如果表单元素上写有默认 value，则恢复为默认 value

下面举例说明 submit 方法的使用：

```xml
<mip-form id="a-simple-form" xxxxx >
  <!-- 表单内容 -->
</mip-form>

<button on="tap:a-simple-form.submit">点击提交表单</button>
```

点击清空表单：

```html
<mip-form method="get" id="a-simple-form" url="https://www.mipengine.org">
  <input name="name" value="李雷" type="text">
  <input name="nickname"  type="text">
</mip-form>

<button on="tap:a-simple-form.clear">[点击清空表单]</button>
```

可以看到点击下方清空表单之后，第一个输入框恢复为 `李雷`，而第二个输入框则直接清空。


## 属性

### target

说明：设置表单  url 提交 后，在何处进行回复。目前仅支持两种值，默认值为 `_blank`。

* `target=_blank` 在新窗口中打开
* `target=_top` 在当前窗口中打开

必选项：否

### method

说明：具体说明提交表单的 HTTP 方法，如 `method=GET` 或 `method=POST`。出于安全考虑，表单提交方法如果为 `post`，必须使用 HTTPS 地址。

必选项：是

### url

说明：设置表单提交至服务端的接口，必须是 https 开头的绝对地址或 // 开头的相对地址

必选项: 是

### fetch-url

说明: 配置该属性后组件会发送异步请求提交表单，使用 Fetch API 发送异步请求，不会打开新页面或者重新加载当前页面。详细的使用方法可参考异步请求更新页面，需要特别注意，使用异步请求功能时，服务端接口需要返回 JSON 对象并实现 CORS 安全策略。

必选项：否

### validatetarget

说明:  验证提示对应 DOM，用于指定错误时的显示对应的提示 DOM

必选项：否

### validatetype

说明：验证类型, 用于支持简单的验证。目前提供  `email`, `phone`, `idcard`, `custom`。当类型为 `custom` 时则需要填写 `validatereg` 实现自定义校验。

可选：

* `must` (已废弃) 输入非空
* `custom` 自定义校验，需配合 validatereg 使用
* `email` 输入电子邮件，默认正则 `/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/`
* `phone` 输入电话号码，默认正则  `/^1\d{10}$/`
* `idcard` 输入身份证号，默认正则 `/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/`

### validatereg

说明: 自定义验证，补充站长个性化的验证规则。如果 `validatetype` 为 `custom` 时需填写相应验证规则。这个 validatereg 的值会通过 `new RegExp(validatereg)` 生成正则。

必选项：否

### custom-validation-reporting

说明：声明校验反馈的策略，可取值包括 `show-first-on-submit` ，`show-all-on-submit`，`as-you-go`

### visible-when-invalid

说明：校验发生错误时，指定需要展示的用户提示类型

可选：

* `valueMissing` 值为空
* `patternMismatch` 正则不匹配

### clear

说明: 表单中 `<input>` 清空输入按钮开关
