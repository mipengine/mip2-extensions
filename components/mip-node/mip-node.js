import './index.less'

export default class MIPNode extends MIP.CustomElement {
  build () {
	var element = this.element;  
	var type = element.getAttribute('node-type') || ' ';
	var vNode = element.getAttribute('node-value') || ' ';
	var dom = element.getAttribute('node-dom') || ' <div> ';
	var other = element.getAttribute('node-oth') || '我是默认内容';
	var loadNode = document.createElement(dom);
	loadNode.type = type;
    loadNode.src = vNode;
    element.appendChild(loadNode);
	  loadNode.onload = function () {
               var callNode = document.createElement(dom);
               var callHtml = [
                'try {'+other+'}',
                'catch (e) {console.error("Mip-Error-Call:"," > ',
                ' > "+e.name+": "+e.message+"");}'
                ];
            callNode.type = type;
            callNode.innerHTML = callHtml.join('');
            element.appendChild(callNode);
        };	
  }
}
