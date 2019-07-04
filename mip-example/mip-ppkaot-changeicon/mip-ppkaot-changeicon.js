/**
 * @file mip-ppkaot-changeicon 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = $(this.element);
        var textT = ele.find('.toggle_text_in span');
        var zkIcon = ele.find('.toggle_text_in i');
        textT.on('click', function () {
            if (textT.text() === '收起') {
                zkIcon.removeClass('ss_icon');
            } else {
                zkIcon.addClass('ss_icon');
            }
        });
    };

    return customElement;
});
