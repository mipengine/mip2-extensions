/**
 * @file mip-ppkao-zixun 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = this.element;
        $(document).ready(function () {
            var jsonstr = document.getElementById('tongjidata').text;
            if (jsonstr !== null && jsonstr !== '' && jsonstr !== 'undefined') {
                var json = JSON.parse(jsonstr);
                var Id = json.Id;
                var CategoryID = json.CategoryID;
                $.ajax({
                    type: 'get',
                    async: false,
                    url: '//newapi.ppkao.com/api/ArticlePraiseApi/GetAddClicksCount?id=' + Id + '&cid='
                    + CategoryID,
                    dataType: 'jsonp',
                    cache: true,
                    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                    jsonp: 'callbackClicksCount',
                    jsonpCallback: 'callbackClicksCount',
                    success: function (data) {
                    }
                });
            }
        });
    };

    return customElement;
});
