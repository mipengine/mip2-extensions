
const MAX_TABLET_WIDTH = 1000

/**
 * get default duration according to fx type
 *
 * @param {string} fxType fx type
 * @returns {number} fx duration
 */
export function getDefaultDuration (fxType) {
  switch (fxType) {
    case 'fade-in':
      return 1000
    case 'fly-in-bottom':
    case 'fly-in-top':
    case 'fly-in-left':
    case 'fly-in-right':
      return 500
  }

  return 1
}

/**
 * get the default percentage of page moving distance
 *
 * @param {string} fxType fx type
 * @returns {number} the percentage of page moving distance
 */
export function getDefaultDistance (fxType) {
  switch (fxType) {
    case 'fly-in-bottom':
    case 'fly-in-top':
      let width = MIP.viewport.getWidth()
      // if it's mobile or tablets
      if (width < MAX_TABLET_WIDTH) {
        return 25
      }
      return 33
    case 'fly-in-left':
    case 'fly-in-right':
      return 100
  }

  return 1
}

/**
 * get default easing type according to fx type
 *
 * @param {string} fxType fx type
 * @returns {string} the default easing type
 */
export function getDefaultEasing (fxType) {
  switch (fxType) {
    case 'fly-in-bottom':
    case 'fly-in-top':
    case 'fly-in-left':
    case 'fly-in-right':
      return 'ease-out'
  }

  return 'ease-in'
}

/**
 * get default margin values
 *
 * @param {string} fxType fx type
 * @returns {Object.<string, number>} default margin
 */
export function getDefaultMargin (fxType) {
  switch (fxType) {
    case 'fade-in':
    case 'fly-in-right':
    case 'fly-in-left':
    case 'fly-in-top':
    case 'fly-in-bottom':
      return {
        'start': 0.05
      }
    case 'fade-in-scroll':
      return {
        'start': 0,
        'end': 0.5
      }
  }

  return {
    'start': 0,
    'end': 1
  }
}
