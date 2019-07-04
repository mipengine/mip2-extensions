/**
 * @file mip-ppkao-table 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        // 表格
        var ele = $(this.element);
        var tableCon = ele.find('.cd-table-container');
        var fixed = ele.find('.cd-table-column').width();
        var showBox = ele.find('#showmore02');
        tableCon.on('scroll', function () {
            if (tableCon.scrollLeft() >= fixed) {
                showBox.removeClass('linear-gradient');
            } else {
                showBox.addClass('linear-gradient');
            }
        });
    };

    return customElement;
});
