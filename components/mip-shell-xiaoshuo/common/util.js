/**
 * @file 小说通用工具函数
 * @author JennyL
 */

export const getJsonld = (currentWindow) => {
  // 获取<head>中声明的mip-shell-xiaoshuo 配置。
  // 每个页面不同，如上一页链接，当前章节名
  let jsonld = currentWindow.document.head.querySelector("script[type='application/ld+json']")
  let jsonldConf
  try {
    jsonldConf = JSON.parse(jsonld.innerText).mipShellConfig
    if (!jsonldConf) {
      throw new Error('mip-shell-xiaoshuo配置错误，请检查头部 application/ld+json mipShellConfig')
    }
  } catch (e) {
    console.error(e)
  }
  return jsonldConf
}

export const getOfficeId = (currentWindow) => {
  // 获取<mip-shell-xiaoshuo>中声明的officeId配置。
  let json = currentWindow.document.querySelector('mip-shell-xiaoshuo').querySelector("script[type='application/json']")
  let officeId
  try {
    officeId = JSON.parse(json.innerText).routes[0].meta.officeId
    if (!officeId) {
      throw new Error('mip-shell-xiaoshuo配置错误，请检查头部 application/json routes meta officeId')
    }
  } catch (e) {
    console.error(e)
  }
  return officeId
}
