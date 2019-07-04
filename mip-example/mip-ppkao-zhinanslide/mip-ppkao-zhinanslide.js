/**
 * @file mip-ppkao-zhinanslide 组件
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
        var showmore = $(ele);
        showmore.hide();
        var button = showmore.parents('.kaoshi-fenlei').find('.title');
        button.on('click', function () {
            showmore.toggle(400);
        });
    };

    return customElement;
});
