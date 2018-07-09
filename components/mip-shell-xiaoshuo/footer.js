import {settingHtml} from './setting'

// 整个底 bar 控制栏
class footer {
	constructor (config) {
		this.config = config
		this.$footerWrapper = this._render()//底部包裹控制栏的mip-fixed元素
		this.$footer //底部控制栏元素 todo 好像没用？
	}

	// 创建底部控制栏并插入页面
	_render() {
        // currentPageMeta: 基类提供的配置，页面中用户在shell json配置的内容
        let renderFooterButtonGroup = actionGroup => actionGroup.map(function(actionConfig) {
        	if(actionConfig.name == 'catalog') {
        		// 目录按钮样式
        		return `<div class="button" on="tap:xiaoshuo-shell.showShellCatalog">${actionConfig.text}</div>`
        	} else if(actionConfig.name == 'darkmode') {
        		// 夜间模式按钮
        		return `<div class="button" data-current-bg="default" data-hidden-bg="night">
	        		<span class="bg-button night-mode" on="tap:xiaoshuo-shell.changeMode(night)" >${actionConfig.text}</span>
	        		<span class="bg-button light-mode" on="tap:xiaoshuo-shell.changeMode(default)" >${actionConfig.text2}</span>
        		</div>`
        	} else if(actionConfig.name == 'settings'){
        		// 字体大小按钮
        		return `<div class="button" on="tap:xiaoshuo-shell.showFontAdjust">${actionConfig.text}</div>`
        	}
        }).join('')

		// 创建底部按钮 HTML
		let previousHref = this.config.hrefButton["previous-href"]
		let nextHref = this.config.hrefButton["next-href"]
        let prevDisabled = previousHref ? '' : 'disabled'
        let nextDisabled = nextHref ? '' : 'disabled'
	    let prevHrefString = previousHref ? `mip-link href="./${this.config.hrefButton["previous-href"]}"` : ''
        let nextHrefString = nextHref ? `mip-link href="./${this.config.hrefButton["next-href"]}"` : ''
        let footerHTML = `
            <div class="upper mip-border mip-border-bottom">
                <a class="page-button page-previous ${prevDisabled}" ${prevHrefString}>
                	${this.config.hrefButton.previous}
                </a>
                <a class="page-button page-next ${nextDisabled}" ${nextHrefString}>
                	${this.config.hrefButton.next}
                </a>
            </div>
            <div class="button-wrapper">
                ${renderFooterButtonGroup(this.config.actionGroup)}
            </div>
            <div class="mip-xiaoshuo-settings">${settingHtml}</div>
        `

        // 将底部 bar 插入到页面中
        let $footerWrapper = document.getElementById('mip-shell-footer')
        $footerWrapper = document.createElement('mip-fixed')
        $footerWrapper.setAttribute('type', 'bottom')
        $footerWrapper.setAttribute('mip-shell', '')
        $footerWrapper.classList.add('mip-shell-footer-wrapper')

        let $footer
        $footer = document.createElement('div')
        $footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
        $footer.innerHTML = footerHTML
        $footerWrapper.appendChild($footer)

        document.body.appendChild($footerWrapper)
        return $footerWrapper
	}

	// 显示底bar
	show (shellElement) {
		var footer = this;
		// XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
		window.setTimeout(function() {
			footer.$footerWrapper.classList.add('show')
			if(shellElement) {
				shellElement.toggleDOM(shellElement.$buttonMask, true)
			}
		}, 100)
	}
	// 隐藏底bar 
	hide () {
		// debugger;
		this.$footerWrapper.classList.remove('show')
	}
}

export default footer