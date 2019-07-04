/**
 * @file mip-ppkao-shitisearch 组件
 * @author
 */

define(function (require) {
    var customElement = require('customElement').create();

    // build说明: 导航组件，在首屏展示，需要尽快加载
    customElement.prototype.build = render;

    function render() {
        var ele = this.element;
        this.addEventAction('toggle', function (event) {
            event.preventDefault();
            ele.classList.toggle(ele.dataset.class);
        });
    }

    return customElement;
});
