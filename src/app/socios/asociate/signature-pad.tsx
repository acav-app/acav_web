'use client'

import { useEffect, useRef, useState } from 'react'
import { FiRotateCcw, FiTrash2 } from 'react-icons/fi'

export default function SignaturePad({ value, onChange, label = 'Firma manuscrita' }: {
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasInk = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const movement = useRef(0)
  const [isEmpty, setIsEmpty] = useState(!value)
  const [tooShort, setTooShort] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = Math.round(rect.width * ratio)
    canvas.height = Math.round(rect.height * ratio)
    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(ratio, ratio)
    context.lineWidth = 2.4
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#102a56'
    if (value) {
      const image = new Image()
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height)
      image.src = value
      hasInk.current = true
      setIsEmpty(false)
    }
  }, [value])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    event.preventDefault()
    canvas.setPointerCapture(event.pointerId)
    const { x, y } = point(event)
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 0.1, y + 0.1)
    context.stroke()
    drawing.current = true
    hasInk.current = true
    lastPoint.current = { x, y }
    movement.current = 0
    setTooShort(false)
    setIsEmpty(false)
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    event.preventDefault()
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const { x, y } = point(event)
    if (lastPoint.current) movement.current += Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y)
    lastPoint.current = { x, y }
    context.lineTo(x, y)
    context.stroke()
  }

  function finish() {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (!canvas || !hasInk.current) return
    if (movement.current < 12) {
      const context = canvas.getContext('2d')
      if (context) context.clearRect(0, 0, canvas.width, canvas.height)
      hasInk.current = false
      setIsEmpty(true)
      setTooShort(true)
      onChange('')
      return
    }
    setTooShort(false)
    onChange(canvas.toDataURL('image/png'))
  }

  function clear() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    hasInk.current = false
    movement.current = 0
    setIsEmpty(true)
    setTooShort(false)
    onChange('')
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          onLostPointerCapture={finish}
          aria-label={`${label}. Firmá dentro del recuadro.`}
          className="block h-40 w-full touch-none cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <span className="text-xs text-slate-400">{tooShort ? 'Trazá una firma más completa para continuar.' : 'Firmá con el dedo o el mouse'}</span>
          <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600">
            {isEmpty ? <FiRotateCcw /> : <FiTrash2 />} Limpiar
          </button>
        </div>
      </div>
    </div>
  )
}
