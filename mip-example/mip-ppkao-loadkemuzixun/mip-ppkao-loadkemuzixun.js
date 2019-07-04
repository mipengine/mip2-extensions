/**
 * @file mip-ppkao-loadkemuzixun 组件
 * @author
 */

define(function (require) {
    'use strict';
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = $(this.element);
        var questionsContainer = ele.find('.questions-container');
        var xscs = true;
        var url = '//data.api.ppkao.com/Interface/PageAPI.ashx?action=GetSpecialsTJZD';
        this.addEventAction('loadkemuevent', function (event, str) {
            getInfoClick();
            function getInfoClick() {
                if (xscs) {
                    questionsContainer.html(
                        '<div class=\'loading\'>'
                    +        '<mip-img src=\'http://static.ppkao.com/phone/new/image/sx.gif\'></mip-img> 正在加载...'
                    +    '</div>'
                    );
                    viewMore();
                }
            }
            function viewMore() {
                xscs = false;
                $.ajax({
                    url: url + str,
                    type: 'POST',
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        xscs = true;
                        var list = data;
                        if (list.List === '') {
                            return;
                        }
                        questionsContainer.html(list.List);
                    }
                });
            }
        });
    };

    return customElement;
});
