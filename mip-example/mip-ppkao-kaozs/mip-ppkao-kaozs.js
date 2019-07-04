/**
 * @file mip-ppkao-tiku 组件
 * @author
 */

define(function (require) {
    'use strict';
    var $ = require('zepto');
    var viewport = require('viewport');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = $(this.element);
        var headT = ele.find('.infor_header');
        var contentB = ele.find('.home_con_b');
        var contentC = ele.find('.infor_bottom');
        var iHeight = headT.height();
        var homeLis = ele.find('.home_con_box ul li');
        contentB.css('margin-top', iHeight + 'px');
        contentC.css('margin-top', iHeight + 'px');
        homeLis.on('click', function () {
            var index = $(this).index();
            $(this).addClass('home_lis').siblings().removeClass('home_lis');
            $(this).parent().next().find('.home_hyk').hide().eq(index).show();
        });
    };
    return customElement;
});
