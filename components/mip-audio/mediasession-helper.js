
/** refrer from  {@link https://github.com/ampproject/amphtml/blob/518a6b0ade/src/mediasession-helper.js} */

/**
 * @typedef {Object} MetadataDef
 * @property {Array} artwork - Indicates the images
 * @property {string} title - Indicates the title of notification
 * @property {string} album - Indicates the album
 * @property {string} artist - Indicates of th artises
 */

/** @const {MetadataDef} Dummy metadata used to fix a bug */
export const EMPTY_METADATA = {
  title: '',
  artist: '',
  album: '',
  artwork: [
    { src: '' }
  ]
}

/**
 * Updates the Media Session API's metadata
 *
 * @param {!MetadataDef} metadata metadata
 * @param {function()=} playHandler play handler
 * @param {function()=} pauseHandler pause handler
 */
export function setMediaSession (metadata, playHandler, pauseHandler) {
  if ('mediaSession' in navigator && window.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new window.MediaMetadata(EMPTY_METADATA)

    // Add metadata
    validateMetadata(metadata)
    navigator.mediaSession.metadata = new window.MediaMetadata(metadata)

    navigator.mediaSession.setActionHandler('play', playHandler)
    navigator.mediaSession.setActionHandler('pause', pauseHandler)
  }
}

/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 *
 * @returns {string|undefined} parsed json-ld formatted meta-data
 */
export function parseSchemaImage () {
  const schema = document.querySelector('script[type="application/ld+json"]')
  if (!schema) {
    // No schema element found
    return
  }
  const schemaJson = MIP.util.jsonParse(schema.textContent)
  if (!schemaJson || !schemaJson['image']) {
    // No image found in the schema
    return
  }

  // Image definition in schema could be one of :
  if (typeof schemaJson['image'] === 'string') {
    // 1. "image": "http://..",
    return schemaJson['image']
  } else if (schemaJson['image']['@list'] &&
    typeof schemaJson['image']['@list'][0] === 'string') {
    // 2. "image": {.., "@list": ["http://.."], ..}
    return schemaJson['image']['@list'][0]
  } else if (typeof schemaJson['image']['url'] === 'string') {
    // 3. "image": {.., "url": "http://..", ..}
    return schemaJson['image']['url']
  } else if (typeof schemaJson['image'][0] === 'string') {
    // 4. "image": ["http://.. "]
    return schemaJson['image'][0]
  }
}

/**
 * Parses the og:image if it exists and returns it
 *
 * @returns {string|undefined} the og:image if it exists
 */
export function parseOgImage () {
  const metaTag = document.querySelector('meta[property="og:image"]')
  if (metaTag) {
    return metaTag.getAttribute('content')
  }
}

/**
 * Parses the website's Favicon and returns it
 *
 * @returns {string|undefined} the parsed websites's Favicon
 */
export function parseFavicon () {
  const linkTag = document.querySelector('link[rel="shortcut icon"]') ||
  document.querySelector('link[rel="icon"]')
  if (linkTag) {
    return linkTag.getAttribute('href')
  }
}

/**
 * validate metadata
 *
 * @param {!MetadataDef} metadata metadata
 * @private
 */
function validateMetadata (metadata) {
  // Ensure src of artwork has valid protocol
  if (metadata && metadata.artwork) {
    const { artwork } = metadata
    if (!Array.isArray(artwork)) {
      throw new Error('artwork 必须是数组')
    }
    // TODO: check if the src of artwork is valid
  }
}
