/**
 * The properties that we copy into a mirrored div.
 * Note that some of these, like 'width', are special-cased.
 */
const properties = [
  'direction',
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
] as const

interface Coordinates {
  top: number
  left: number
  height: number
}

/**
 * Returns the coordinates of the caret in a textarea or input.
 * Minimal implementation based on textarea-caret package.
 */
export function getCaretCoordinates(
  element: HTMLTextAreaElement | HTMLInputElement,
  position: number,
  options?: { debug?: boolean }
): Coordinates {
  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    return { top: 0, left: 0, height: 0 }
  }

  const div = document.createElement('div')
  div.id = 'input-textarea-caret-position-mirror-div'
  document.body.appendChild(div)

  const style = div.style
  const computed = window.getComputedStyle(element)

  style.whiteSpace = 'pre-wrap'
  if (element.nodeName === 'INPUT') {
    style.whiteSpace = 'nowrap'
  }

  style.position = 'absolute'
  if (!options?.debug) {
    style.visibility = 'hidden'
  }

  properties.forEach((prop) => {
    // @ts-ignore
    style[prop] = computed[prop]
  })

  if (isBrowser) {
    // FireFox throws an error if we try to access cssText locally
    // but works fine if we use the computed style object
    if ((window as any).mozInnerScreenX != null) {
      if (element.scrollHeight > parseInt(computed.height))
        style.overflowY = 'scroll'
    } else {
      style.overflow = 'hidden'
    }
  }

  div.textContent = element.value.substring(0, position)

  // The second special handling for input type="text" vs textarea:
  // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (element.nodeName === 'INPUT') {
    div.textContent = div.textContent.replace(/\s/g, '\u00a0')
  }

  const span = document.createElement('span')
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but no reason to bother.
  span.textContent = element.value.substring(position) || '.'
  div.appendChild(span)

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth),
    height: parseInt(computed.lineHeight),
  }

  if (options?.debug) {
    span.style.backgroundColor = '#aaa'
  } else {
    document.body.removeChild(div)
  }

  return coordinates
}
