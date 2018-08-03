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

## 说明
为极速小说阅读器定制的 mip-shell-xiaoshuo 目录页传入格式
```
<mip-shell-xiaoshuo mip-shell="" id="xiaoshuo-shell">
        <script type="application/json">
            {
            "routes": [{
                "pattern": "mipx-xiaoshuo-(\\d)+-(\\d)+.html",
                "meta": {
                    "header": {
                        "show": true,
                        "title": "神武天帝"
                    },
                    "footer": {
                        "actionGroup": [
                            {"name": "catalog", "text": "目录"},
                            {"name": "darkmode", "text": "夜间模式", "text2": "白天模式"},
                            {"name": "settings", "text": "更多设置"}
                        ],
                        "hrefButton": {
                            "previous": "上一页",
                            "next": "下一页"
                        }
                    },
                    "book": {
                        "title": "将夜",
                        "chapterNumber": "已完结&nbsp;&nbsp;共1347章"
                    },
                    "catalog": [
                        {
                            "name": "第1章 灵魂重生",
                            "link": "mipx-xiaoshuo-1-1.html",
                            "pages": [
                                "mipx-xiaoshuo-1-1.html",
                                "mipx-xiaoshuo-1-2.html",
                                "mipx-xiaoshuo-1-3.html"
                            ]
                        }
                    ]
                }
            }]}
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