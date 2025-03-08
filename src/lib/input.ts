import { useEffect, useCallback, useRef } from 'react'

type PointerEvent = {
  type: 'start' | 'move' | 'end' | 'cancel'
  x: number
  y: number
  time: number
  pointerType: 'touch' | 'mouse'
}

type InputHandler = (event: PointerEvent) => void

export class UnifiedInputHandler {
  private element: HTMLElement
  private handler: InputHandler
  private longPressTimeout?: NodeJS.Timeout
  private startX = 0
  private startY = 0
  private startTime = 0

  constructor(element: HTMLElement, handler: InputHandler) {
    this.element = element
    this.handler = handler
    this.init()
  }

  private init() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: true })
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd)
    this.element.addEventListener('touchcancel', this.handleTouchCancel)

    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown)
    this.element.addEventListener('mousemove', this.handleMouseMove)
    this.element.addEventListener('mouseup', this.handleMouseUp)
    this.element.addEventListener('mouseleave', this.handleMouseUp)
  }

  private handlePointerStart(x: number, y: number, pointerType: 'touch' | 'mouse') {
    this.startX = x
    this.startY = y
    this.startTime = Date.now()

    this.handler({
      type: 'start',
      x,
      y,
      time: this.startTime,
      pointerType
    })

    // Start long press detection
    this.longPressTimeout = setTimeout(() => {
      this.handler({
        type: 'end',
        x,
        y,
        time: Date.now(),
        pointerType: 'touch' // Long press is primarily touch interaction
      })
    }, 500)
  }

  private handlePointerMove(x: number, y: number, pointerType: 'touch' | 'mouse') {
    this.handler({
      type: 'move',
      x,
      y,
      time: Date.now(),
      pointerType
    })
  }

  private handlePointerEnd(x: number, y: number, pointerType: 'touch' | 'mouse') {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout)
    }

    const currentTime = Date.now()
    const velocity = {
      x: (x - this.startX) / (currentTime - this.startTime),
      y: (y - this.startY) / (currentTime - this.startTime)
    }

    this.handler({
      type: 'end',
      x,
      y,
      time: currentTime,
      pointerType,
      velocity
    })
  }

  // Touch handlers
  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.handlePointerStart(touch.clientX, touch.clientY, 'touch')
  }

  private handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.handlePointerMove(touch.clientX, touch.clientY, 'touch')
  }

  private handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0]
    this.handlePointerEnd(touch.clientX, touch.clientY, 'touch')
  }

  private handleTouchCancel = () => {
    this.handler({ type: 'cancel', x: 0, y: 0, time: Date.now(), pointerType: 'touch' })
  }

  // Mouse handlers
  private handleMouseDown = (e: MouseEvent) => {
    this.handlePointerStart(e.clientX, e.clientY, 'mouse')
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.handlePointerMove(e.clientX, e.clientY, 'mouse')
  }

  private handleMouseUp = (e: MouseEvent) => {
    this.handlePointerEnd(e.clientX, e.clientY, 'mouse')
  }

  destroy() {
    // Cleanup all event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
    this.element.removeEventListener('touchcancel', this.handleTouchCancel)
    this.element.removeEventListener('mousedown', this.handleMouseDown)
    this.element.removeEventListener('mousemove', this.handleMouseMove)
    this.element.removeEventListener('mouseup', this.handleMouseUp)
    this.element.removeEventListener('mouseleave', this.handleMouseUp)
  }
}

export function useUnifiedInput(handler: InputHandler) {
  const inputRef = useRef<UnifiedInputHandler>()

  const setElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      inputRef.current = new UnifiedInputHandler(element, handler)
    }
    return () => {
      inputRef.current?.destroy()
    }
  }, [handler])

  return setElement
}
