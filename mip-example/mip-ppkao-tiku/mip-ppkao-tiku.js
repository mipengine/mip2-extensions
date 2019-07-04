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
        var ele = this.element;
        $(ele).find('.kemu').on('click', function () {
            $(this).find('span.zhankai').toggleClass('zhankai1');
            $(this).siblings('.child_box').toggleClass('current').find('.zm_nav').toggle();
            var parentBox = $(this).parents('.parent_box').siblings('.parent_box');
            parentBox.find('.child_box').removeClass('current').find('.zm_nav').hide();

            for (var i = 1; i < 27; i++) {
                var letterId = $(this).attr('id') + '_letter' + i;
                var num = $('#' + letterId).children('ul').find('li').length;
                if (num === 0) {
                    $('#' + letterId).hide();
                }
            }
        });

        $(ele).find('.parent_box').on('click', '.child_box .zm_nav a', function (event) {
            event.preventDefault();
            var text = $(this).text();
            var tishi = $(this).parents('.zm_nav').siblings('.aim');
            tishi.find('.wu').remove();
            tishi.find('i .kemu1_glod').text(text);
            if ($($(this).attr('href')).children('ul').find('li').length === 0) {
                tishi.find('i').after('<div class=\"wu\">无</div>');
            } else {
                var top = $($(this).attr('href')).position().top + 61 + $(this).parents('.parent_box').position().top;
                viewport.setScrollTop(top);
            }
            tishi.show();
            tishi.animate({opacity: 0}, 1000, function () {
                tishi.css({opacity: 1, display: 'none'});
            });
        });
    };

    return customElement;
});
