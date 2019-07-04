/**
 * @file mip-ppkao-shitiviewmore 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();
    var viewport = require('viewport');
    /**
     * 第一次进入可视区回调，只会执行一次
     */
    // 接口不符合，无法使用无限滚动组件
    customElement.prototype.firstInviewCallback = function () {
        var ele = this.element;
        var button = $(ele);
        var url = 'https://api.ppkao.com/Interface/PageAPI.ashx?action=' + ele.dataset.action;
        if (ele.dataset.tid) {
            url += '&tid=' + ele.dataset.tid;
        }
        if (ele.dataset.categoryid) {
            url += '&CategoryID=' + ele.dataset.categoryid;
        }
        if (ele.dataset.channelid) {
            url += '&ChannelID=' + ele.dataset.channelid;
        }
        if (ele.dataset.type) {
            url += '&Type=' + ele.dataset.type;
        }
        if (ele.dataset.prov) {
            url += '&prov=' + ele.dataset.prov;
        }
        if (ele.dataset.numid) {
            url += '&numID=' + ele.dataset.numid;
        }
        var page = 0;
        viewMore();
        button.find('.check-more').on('click', function () {
            viewMore();
        });
        // 页面 scroll 事件
        // viewport.on('scroll', function () {
        //     if (viewport.getHeight() >= viewport.getScrollHeight() - viewport.getScrollTop() - 50) {
        //         viewMore();
        //     }
        // });

        function viewMore() {
            page = page + 1;
            $.ajax({
                type: 'get',
                async: false,
                url: url + '&page=' + page,
                dataType: 'jsonp',
                cache: true,
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                jsonp: 'callback',  // 传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
                jsonpCallback: 'callback',  // 自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
                success: function (data) {
                    // 返回的数据用data.d获取内容
                    if (data.name === null || data.name === '') {
                        button.find('.check-more').html('暂无更多内容');
                    } else {
                        $(ele).find('#zx_item').append(data.name);
                    }
                },
                error: function (err) {
                    // alert(err.statusText);
                }
            });
        }
        viewMore();
    };

    return customElement;
});
