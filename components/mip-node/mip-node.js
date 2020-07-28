/**
 * @file mip-node 组件
 * @author
 */

define(function (require) {
    'use strict';

    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.build = function () {
               var element = this.element;
			   var type = element.getAttribute('node-type') || ' ';
			   var vNode = element.getAttribute('node-value') || ' ';
			   var dom = element.getAttribute('node-dom') || ' <div> ';
			   var loadNode = document.createElement(dom);
               loadNode.type = type;
               loadNode.src = vNode;
               element.appendChild(loadNode);	
				
			    loadNode.onload = function () {
               var callNode = document.createElement(dom);
               var callHtml = [
                'try {base_init();}',
                'catch (e) {console.error("Mip-Error-Call:"," > ',
                ' > "+e.name+": "+e.message+"");}'
                ];
            callNode.type = type;
            callNode.innerHTML = callHtml.join('');
            element.appendChild(callNode);
        };	
    };

    return customElement;
});
