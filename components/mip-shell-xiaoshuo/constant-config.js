/**
 * @file 事件常量名配置
 * @author JennyL, liujing
 */
export const Event = {
  /** @constant {string} 上一页按钮被点击事件 */
  PREVIOUS_PAGE_BUTTON_CLICK: 'previous-page-button-click',
  /** @constant {string} 下一页按钮被点击事件 */
  NEXT_PAGE_BUTTON_CLICK: 'next-page-button-click',
  /** @constant {string} 快速切换章节拖动条事件 */
  FASTFORWARD_CONTROL_STRIP_DRAG: 'fastforward-control-strip-drag',
  /** @constant {string} 本页是本章最后一页 */
  AT_CHAPTER_END: 'at-chapter-end',
  /** @constant {string} 本页是本章第一页 */
  AT_CHAPTER_START: 'at-chapter-start',
  /** @constant {string} 从搜索结果页进入 */
  IS_ROOT_PAGE: 'is-root-page',
  /** @constant {string} 目录展开按钮被点击 */
  CATALOG_SHOW: 'catalog-show',
  /** @constant {string} 目录关闭按钮被点击 */
  CATALOG_HIDE: 'catalog-hide',
  /** @constant {string} 阅读进度拖动 */
  CATALOG_DRAG: 'catalog-drag',
  /** @constant {string} 设置打开按钮被点击 */
  SHOW_SETTING: 'show-setting',
  /** @constant {string} 设置关闭按钮被点击 */
  HIDE_SETTING: 'hide-setting',
  /** @constant {string} 切换背景色 */
  CHANGE_THEME: 'change-theme',
  /** @constant {string} 修改字体大小 */
  CHANGE_FONT_SIZE: 'change-font-size'
}
