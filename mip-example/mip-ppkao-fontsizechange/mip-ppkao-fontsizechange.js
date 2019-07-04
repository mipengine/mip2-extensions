/**
 * @file mip-ppkao-fontsizechange 组件
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
        var fontSize = parseInt(ele.css('font-size'), 10);
        this.addEventAction('bigfont', function (event) {
            event.preventDefault();
            $(event.target).addClass('current').siblings('.changefont').removeClass('current');
            if (fontSize <= 28) {
                fontSize++;
                ele.css('font-size', fontSize);
            }
        });
        this.addEventAction('smallfont', function (event) {
            event.preventDefault();
            $(event.target).addClass('current').siblings('.changefont').removeClass('current');
            if (fontSize >= 12) {
                fontSize--;
                ele.css('font-size', fontSize);
            }
        });
    };

    return customElement;
});
