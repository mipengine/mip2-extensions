# `mip-shell-inservice`

## 说明
极速服务 mip-shell定制化

标题|内容
----|----
类型|通用
支持布局|N/S
所需脚本|https://c.mipcdn.com/static/v2/mip-shell-inservice/mip-shell-inservice.js



## 示例
```html
<mip-shell-inservice mip-shell>
    <script type="application/json">
        {
        "routes": [
            {
                "pattern": "./index.html",
                "meta": {
                    "header": {
                        "show": true
                    },
                    "view":{
                        "isIndex": true
                    }
                }
            },
            {
                "pattern": "./mip-shell-inservice.html",
                "meta": {
                    "header": {
                        "show": true,
                        "title": "微咖啡PAGE2"
                    },
                    "view":{
                    "isIndex": false
                    }
                }
            },
            {
                "pattern": "*",
                "meta": {
                    "header": {
                        "show": true
                    }
                }
            }
        ],
        "isId":"156786663788884"
    }
    </script>
</mip-shell-inservice>
```

## 属性

### isId
说明：熊掌号ID
必选项：是
类型：`string`  
示例："123456678"

### routes 
[参考mip-shell用法](https://github.com/mipengine/mip2/blob/master/docs/new-doc/all-sites-mip/5-mip-shell.md)
