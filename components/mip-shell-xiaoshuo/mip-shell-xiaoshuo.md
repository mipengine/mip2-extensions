# `mip-shell-xiaoshuo`

## 说明
为极速小说阅读器定制的 mip-shell

## 示例
```html
<mip-shell-xiaoshuo mip-shell>
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
                "pattern": "./mip-shell-xiaoshuo.html",
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
</mip-shell-xiaoshuo>
```

## 属性

### isId
说明：熊掌号ID
必选项：是
类型：`string`  
示例："123456678"

### routes 
[参考mip-shell用法](https://github.com/mipengine/mip2/blob/master/docs/page/shell.md)