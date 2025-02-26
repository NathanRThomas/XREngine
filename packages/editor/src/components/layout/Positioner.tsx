import { useHookstate } from '@speigg/hookstate'
import React, { Children, cloneElement, useEffect, useRef } from 'react'
import styled from 'styled-components'

/**
 *
 * @author Robert Long
 */
const Position = {
  TOP: 'top',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM: 'bottom',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  LEFT: 'left',
  RIGHT: 'right'
}

/**
 * Function to create a Rect.
 *
 * @author Robert Long
 * @param {Object} dimensions
 * @param {Number} dimensions.width
 * @param {Number} dimensions.height
 * @param {Object} position
 * @param {Number} position.left
 * @param {Number} position.top
 * @return {Object} Rect { width, height, left, top, right, bottom }
 */
const makeRect = ({ width, height }, { left, top }) => {
  const ceiledLeft = Math.ceil(left)
  const ceiledTop = Math.ceil(top)
  return {
    width,
    height,
    left: ceiledLeft,
    top: ceiledTop,
    right: ceiledLeft + width,
    bottom: ceiledTop + height
  }
}

/**
 * Function to flip a position upside down.
 *
 * @param {Position} position
 * @return {Position} flipped position
 */
const flipHorizontal = (position) => {
  switch (position) {
    case Position.TOP_LEFT:
      return Position.BOTTOM_LEFT
    case Position.TOP:
    default:
      return Position.BOTTOM
    case Position.TOP_RIGHT:
      return Position.BOTTOM_RIGHT
    case Position.BOTTOM_LEFT:
      return Position.TOP_LEFT
    case Position.BOTTOM:
      return Position.TOP
    case Position.BOTTOM_RIGHT:
      return Position.TOP_RIGHT
  }
}

/**
 * Function that returns if position is aligned on top.
 *
 * @param {Position} position
 * @return {Boolean}
 */
const isAlignedOnTop = (position) => {
  switch (position) {
    case Position.TOP_LEFT:
    case Position.TOP:
    case Position.TOP_RIGHT:
      return true
    default:
      return false
  }
}

/**
 * Function that returns if position is aligned left or right.
 *
 * @param {Position} position
 * @return {Boolean}
 */
const isAlignedHorizontal = (position) => {
  switch (position) {
    case Position.LEFT:
    case Position.RIGHT:
      return true
    default:
      return false
  }
}

/**
 * Function that returns if a rect fits on bottom.
 *
 * @param {Rect} rect
 * @param {Object} viewport
 * @param {Number} viewportOffset
 * @return {Boolean}
 */
const getFitsOnBottom = (rect, viewport, viewportOffset) => {
  return rect.bottom < viewport.height - viewportOffset
}

/**
 * Function that returns if a rect fits on top.
 *
 * @param {Rect} rect
 * @param {Number} viewportOffset
 * @return {Boolean}
 */
const getFitsOnTop = (rect, viewportOffset) => {
  return rect.top > viewportOffset
}

/**
 * Function that returns if a rect fits on right.
 *
 * @param {Rect} rect
 * @param {Object} viewport
 * @param {Number} viewportOffset
 * @return {Boolean}
 */
const getFitsOnRight = (rect, viewport, viewportOffset) => {
  return rect.right < viewport.width - viewportOffset
}

/**
 * Function that returns if a rect fits on left.
 *
 * @param {Rect} rect
 * @param {Number} viewportOffset
 * @return {Boolean}
 */
const getFitsOnLeft = (rect, viewportOffset) => {
  return rect.left > viewportOffset
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin
 * Function that returns the CSS `tranform-origin` property.
 *
 * @param {Rect} rect
 * @param {Position} position
 * @param {Object} dimensions — the dimensions of the positioner.
 * @param {Number} targetCenter - center of the target.
 * @return {String} transform origin
 */
const getTransformOrigin = ({ rect, position, dimensions, targetCenter }) => {
  const centerY = Math.round(targetCenter - rect.top)

  if (position === Position.LEFT) {
    /* Syntax: x-offset | y-offset */
    return `${dimensions.width}px ${centerY}px`
  }

  if (position === Position.RIGHT) {
    /* Syntax: x-offset | y-offset */
    return `0px ${centerY}px`
  }

  const centerX = Math.round(targetCenter - rect.left)

  if (isAlignedOnTop(position)) {
    /* Syntax: x-offset | y-offset */
    return `${centerX}px ${dimensions.height}px `
  }

  /* Syntax: x-offset | y-offset */
  return `${centerX}px 0px `
}

/**
 * Function that takes in numbers and position and gives the final coords.
 *
 * @param {Position} position — the position the positioner should be on.
 * @param {Object} dimensions — the dimensions of the positioner.
 * @param {Rect} targetRect — the rect of the target.
 * @param {Number} targetOffset - offset from the target.
 * @param {Object} viewport - the width and height of the viewport.
 * @param {Object} viewportOffset - offset from the viewport.
 * @return {Object} - { rect: Rect, position: Position }
 */
function getPosition({ position, dimensions, targetRect, targetOffset, viewport, viewportOffset = 8 }) {
  const isHorizontal = isAlignedHorizontal(position)

  // Handle left and right positions
  if (isHorizontal) {
    const leftRect = getRect({
      position: Position.LEFT,
      dimensions,
      targetRect,
      targetOffset
    })

    const rightRect = getRect({
      position: Position.RIGHT,
      dimensions,
      targetRect,
      targetOffset
    })

    const fitsOnLeft = getFitsOnLeft(leftRect, viewportOffset)
    const fitsOnRight = getFitsOnRight(rightRect, viewport, viewportOffset)

    if (position === Position.LEFT) {
      if (fitsOnLeft) {
        return {
          position,
          rect: leftRect
        }
      }

      if (fitsOnRight) {
        return {
          position: Position.RIGHT,
          rect: rightRect
        }
      }
    }

    if (position === Position.RIGHT) {
      if (fitsOnRight) {
        return {
          position,
          rect: rightRect
        }
      }

      if (fitsOnLeft) {
        return {
          position: Position.LEFT,
          rect: leftRect
        }
      }
    }

    // Default to using the position with the most space
    const spaceRight = Math.abs(viewport.width - viewportOffset - rightRect.right)
    const spaceLeft = Math.abs(leftRect.left - viewportOffset)

    if (spaceRight < spaceLeft) {
      return {
        position: Position.RIGHT,
        rect: rightRect
      }
    }

    return {
      position: Position.LEFT,
      rect: leftRect
    }
  }

  const positionIsAlignedOnTop = isAlignedOnTop(position)
  let topRect
  let bottomRect

  if (positionIsAlignedOnTop) {
    topRect = getRect({
      position,
      dimensions,
      targetRect,
      targetOffset
    })
    bottomRect = getRect({
      position: flipHorizontal(position),
      dimensions,
      targetRect,
      targetOffset
    })
  } else {
    topRect = getRect({
      position: flipHorizontal(position),
      dimensions,
      targetRect,
      targetOffset
    })
    bottomRect = getRect({
      position,
      dimensions,
      targetRect,
      targetOffset
    })
  }

  const topRectFitsOnTop = getFitsOnTop(topRect, viewportOffset)

  const bottomRectFitsOnBottom = getFitsOnBottom(bottomRect, viewport, viewportOffset)

  if (positionIsAlignedOnTop) {
    if (topRectFitsOnTop) {
      return {
        position,
        rect: topRect
      }
    }

    if (bottomRectFitsOnBottom) {
      return {
        position: flipHorizontal(position),
        rect: bottomRect
      }
    }
  }

  if (!positionIsAlignedOnTop) {
    if (bottomRectFitsOnBottom) {
      return {
        position,
        rect: bottomRect
      }
    }

    if (topRectFitsOnTop) {
      return {
        position: flipHorizontal(position),
        rect: topRect
      }
    }
  }

  // Default to most spacious if there is no fit.
  const spaceBottom = Math.abs(viewport.height - viewportOffset - bottomRect.bottom)

  const spaceTop = Math.abs(topRect.top - viewportOffset)

  if (spaceBottom < spaceTop) {
    return {
      position: positionIsAlignedOnTop ? flipHorizontal(position) : position,
      rect: bottomRect
    }
  }

  return {
    position: positionIsAlignedOnTop ? position : flipHorizontal(position),
    rect: topRect
  }
}

/**
 * Function that takes in numbers and position and gives the final coords.
 *
 * @param {Position} position
 * @param {Number} targetOffset - offset from the target.
 * @param {Object} dimensions — the dimensions of the positioner.
 * @param {Rect} targetRect — the rect of the target.
 * @return {Rect} - Rect { width, height, left, top, right, bottom }
 */
function getRect({ position, targetOffset, dimensions, targetRect }) {
  const leftRect = targetRect.left + targetRect.width / 2 - dimensions.width / 2
  const alignedTopY = targetRect.top - dimensions.height - targetOffset
  const alignedBottomY = targetRect.bottom + targetOffset
  const alignedRightX = targetRect.right - dimensions.width
  const alignedLeftRightY = targetRect.top + targetRect.height / 2 - dimensions.height / 2

  switch (position) {
    case Position.LEFT:
      return makeRect(dimensions, {
        left: targetRect.left - dimensions.width - targetOffset,
        top: alignedLeftRightY
      })
    case Position.RIGHT:
      return makeRect(dimensions, {
        left: targetRect.right + targetOffset,
        top: alignedLeftRightY
      })
    case Position.TOP:
      return makeRect(dimensions, {
        left: leftRect,
        top: alignedTopY
      })
    case Position.TOP_LEFT:
      return makeRect(dimensions, {
        left: targetRect.left,
        top: alignedTopY
      })
    case Position.TOP_RIGHT:
      return makeRect(dimensions, {
        left: alignedRightX,
        top: alignedTopY
      })
    default:
    case Position.BOTTOM:
      return makeRect(dimensions, {
        left: leftRect,
        top: alignedBottomY
      })
    case Position.BOTTOM_LEFT:
      return makeRect(dimensions, {
        left: targetRect.left,
        top: alignedBottomY
      })
    case Position.BOTTOM_RIGHT:
      return makeRect(dimensions, {
        left: alignedRightX,
        top: alignedBottomY
      })
  }
}

/**
 *
 * @author Robert Long
 */
const PositionerContainer = (styled as any).div.attrs(({ transform, transformOrigin, opacity }) => ({
  style: {
    transform,
    transformOrigin,
    opacity
  }
}))`
  position: fixed;
  top: 0;
  left: 0;
`

/**
 *
 * @author Robert Long
 * @param {any} children
 * @param {any} position
 * @param {any} padding
 * @param {any} getTargetRef
 * @param {any} rest
 * @returns
 */
export function Positioner({ children, position, padding, getTargetRef, ...rest }) {
  const positionerContainerRef = useRef<any>()

  const transformProps = useHookstate({
    finalPosition: position,
    transform: 'translate(0px,0px)',
    transformOrigin: 'initial',
    opacity: 0
  })

  useEffect(() => {
    const onReposition = () => {
      const positionerContainerRect = positionerContainerRef.current.getBoundingClientRect()
      const targetRect = getTargetRef().current.getBoundingClientRect()
      const viewportHeight = document.documentElement.clientHeight
      const viewportWidth = document.documentElement.clientWidth

      const { rect, position: finalPosition } = getPosition({
        position,
        targetRect,
        targetOffset: padding,
        dimensions: { width: positionerContainerRect.width, height: positionerContainerRect.height },
        viewport: { width: viewportWidth, height: viewportHeight },
        viewportOffset: padding
      })

      transformProps.merge({
        finalPosition,
        transform: `translate(${rect.left}px, ${rect.top}px)`,
        opacity: 1
      })
    }

    onReposition()

    window.addEventListener('resize', onReposition)

    return () => {
      window.removeEventListener('resize', onReposition)
    }
  }, [position, padding, getTargetRef])

  const childrenWithProps = Children.map(children, (child) =>
    cloneElement(child, { position: transformProps.finalPosition.value })
  )

  return (
    <PositionerContainer {...rest} {...transformProps.value} ref={positionerContainerRef}>
      {childrenWithProps}
    </PositionerContainer>
  )
}

Positioner.defaultProps = {
  padding: 8,
  position: 'bottom'
}

export default Positioner
