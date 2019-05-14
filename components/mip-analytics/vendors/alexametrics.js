/**
 * @file alexametrics 统计的封装
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable */

export default {
  'hosts': {
    'disp': '//certify-amp.alexametrics.com/atrk.gif?atrk=${atrk_acct}&domain=${domain}&'
  },
  'setting': {
    'disp': [
      {
        'host': 'disp',
        'queryString': {
          'jsv': 'mip-${mipVersion}',
          'frame_height': '${viewportHeight}',
          'frame_width': '${viewportWidth}',
          'title': '${title}',
          'time': '${timestamp}',
          'time_zone_offset': '${timezone}',
          'screen_params': '${screenWidth}x${screenHeight}x${screenColorDepth}',
          'ref_url': '${documentReferrer}',
          'host_url': '${sourceUrl}',
          'random_number': '${random}',
          'user_lang': '${browserLanguage}',
          'mip_doc_url': '${mipdocUrl}'
          // 如果有什么额外的变量，可以继续补充
        },
        'vars': {
          'atrk_acct': '',
          'domain': ''
        }
      }
    ]
  }
}
