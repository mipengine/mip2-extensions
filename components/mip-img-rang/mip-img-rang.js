import './index.less'

export default class MIPImgRang extends MIP.CustomElement {
  build () {
    let wrapper = document.getElementsByTagName('mip-img-rang')[0]
	let media = wrapper.getAttribute("call");
	let rang = parseInt(wrapper.getAttribute("rang"));
	let img = wrapper.getElementsByTagName('mip-img');
	for(var i = 0;i<img.length;i++){
		let image = new Image();
		image.src = img[i].getAttribute('src');
		if(image.width > image.height){
	      if(media=="height"){
		    wrapper.style.height=rang+10+'px';
		    img[i].style.height=rang+'px';
			img[i].style.width='auto';
	      }else if(media=="width"){
		    wrapper.style.width=rang+'px';
		    img[i].style.width=rang+'px'; 
		  }
	    }
      } 
	}
  
}
