/**
 * @file 事件常量名配置
 * @author JennyL, liujing
 */
export const Constant = {
  /** @member {string} 上一页按钮被点击事件'previous-page-button-click' */
  PREVIOUS_PAGE: 'previous-page',
  /** @member {string} 下一页按钮被点击事件'next-page-button-click' */
  NEXT_PAGE: 'next-page',
  /** @member {string} 当前页ready,状态可获取'current-page-ready' */
  CURRENT_PAGE_READY: 'current-page-ready',
  /** @member {string} 快速切换章节拖动条事件'fastforward-control-strip-drag' */
  FASTFORWARD_CONTROL_STRIP_DRAG: 'fastforward-control-strip-drag',
  /** @member {string} 目录展开按钮被点击'catalog-show' */
  CATALOG_SHOW: 'catalog-show',
  /** @member {string} 目录关闭按钮被点击'catalog-hide' */
  CATALOG_HIDE: 'catalog-hide',
  /** @member {string} 阅读进度拖动'catalog-drag' */
  CATALOG_DRAG: 'catalog-drag',
  /** @member {string} 设置打开按钮被点击'show-setting' */
  SHOW_SETTING: 'show-setting',
  /** @member {string} 设置关闭按钮被点击'hide-setting' */
  HIDE_SETTING: 'hide-setting',
  /** @member {string} 切换背景色'change-theme' */
  CHANGE_THEME: 'change-theme',
  /** @member {string} 修改字体大小'change-font-size' */
  CHANGE_FONT_SIZE: 'change-font-size',
  /** @member {string} 定制化MIP组件可用事件（由mip-custom.js抛出）,包括mip-custom.js所在页面id'mip-custom-element-ready' */
  MIP_CUSTOM_ELEMENT_READY: 'mip-custom-element-ready'
}
