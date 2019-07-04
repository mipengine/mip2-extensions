/**
 * @file mip-ppkao-showsubject 组件
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
        var closetext = ele.dataset.closetext;
        var showmore = $(ele);
        var button = showmore.find('.toggle');
        var opentext = button.text();
        if (showmore.find('ul li').length <= 18) {
            button.hide();
        }
        button.on('click', function () {
            showmore.find('ul li:nth-of-type(n+19)').toggle(400);
            if (button.hasClass('active')) {
                button.removeClass('active');
                button.text(opentext);
            } else {
                button.addClass('active');
                button.text(closetext);
            }
        });
    };

    return customElement;
});
