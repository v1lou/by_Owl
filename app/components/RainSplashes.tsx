'use client'

import { useEffect, useState } from 'react'

type DropShape = 'round' | 'teardrop' | 'elongated' | 'splat'

type Drop = {
  id: number
  left: string
  top: string
  size: number
  duration: number
  shape: DropShape
  blur: string
  opacity: number
  hasStreak: boolean
  streakLength: number
  rotation: number
}

const createDrop = (): Drop => {
  const size = 9 + Math.random() * 26
  const shapes: DropShape[] = ['round', 'teardrop', 'elongated', 'splat']
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  
  // Подтёки только у крупных или вытянутых капель
  const hasStreak = (size > 16 || shape === 'elongated' || shape === 'teardrop') && Math.random() < 0.7
  const streakLength = 1.0 + Math.random() * 2.2
  
  // Разная непрозрачность в зависимости от формы
  let opacity = 0.6
  if (shape === 'round') opacity = 0.55
  if (shape === 'teardrop') opacity = 0.65
  if (shape === 'elongated') opacity = 0.5
  if (shape === 'splat') opacity = 0.45

  return {
    id: Date.now() + Math.random(),
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size,
    duration: 3.5 + Math.random() * 3.2,
    shape,
    blur: size > 20 ? '2.5px' : '1px',
    opacity,
    hasStreak,
    streakLength,
    rotation: Math.random() * 20 - 10,
  }
}

export default function RainSplashes() {
  const [drops, setDrops] = useState<Drop[]>([])

  useEffect(() => {
    setDrops(Array.from({ length: 14 }).map(createDrop))

    const interval = setInterval(() => {
      setDrops((prev) => {
        const kept = prev.slice(-12)
        return [...kept, createDrop()]
      })
    }, 650)

    return () => clearInterval(interval)
  }, [])

const getShapeStyle = (drop: Drop) => {
  const base = {
    width: `${drop.size}px`,
    height: `${drop.size}px`,
    transform: `rotate(${drop.rotation}deg)`,
  }

  switch (drop.shape) {
    case 'round':
      return {
        ...base,
        borderRadius: '48% 52% 50% 50%',
        transform: `rotate(${drop.rotation}deg) scale(0.92, 1.02)`,
      }

    case 'teardrop':
      return {
        ...base,
        width: `${drop.size * 0.9}px`,
        height: `${drop.size * 1.45}px`,
        borderRadius: '50% 50% 60% 60% / 40% 40% 70% 70%',
        transform: `rotate(${drop.rotation}deg) scaleX(0.9)`,
      }

    case 'elongated':
      return {
        ...base,
        width: `${drop.size * 0.58}px`,
        height: `${drop.size * 1.9}px`,
        borderRadius: '45% 45% 55% 55% / 20% 20% 80% 80%',
        transform: `rotate(${drop.rotation}deg)`,
      }

    case 'splat':
      return {
        ...base,
        width: `${drop.size * 1.35}px`,
        height: `${drop.size * 0.8}px`,
        borderRadius:
          '60% 40% 55% 45% / 55% 45% 60% 40%',
        transform: `rotate(${drop.rotation * 0.5}deg)`,
      }

    default:
      return base
  }
}

const getShapeGradient = (shape: DropShape) => {
  switch (shape) {
    case 'round':
      return `
        radial-gradient(
          ellipse at 35% 28%,
          rgba(255,255,255,0.85) 0%,
          rgba(220,235,245,0.35) 18%,
          rgba(120,145,165,0.18) 55%,
          rgba(40,55,70,0.22) 100%
        )
      `

    case 'teardrop':
      return `
        radial-gradient(
          ellipse at 40% 20%,
          rgba(255,255,255,0.82) 0%,
          rgba(220,235,245,0.32) 16%,
          rgba(110,135,155,0.15) 58%,
          rgba(35,45,60,0.24) 100%
        )
      `

    case 'elongated':
      return `
        radial-gradient(
          ellipse at 45% 18%,
          rgba(255,255,255,0.75) 0%,
          rgba(210,225,235,0.26) 14%,
          rgba(100,120,140,0.12) 60%,
          rgba(30,40,55,0.22) 100%
        )
      `

    case 'splat':
      return `
        radial-gradient(
          ellipse at 35% 35%,
          rgba(255,255,255,0.65) 0%,
          rgba(200,220,230,0.22) 22%,
          rgba(80,95,110,0.1) 65%,
          rgba(25,30,40,0.18) 100%
        )
      `

    default:
      return ''
  }
}
  return (
    <div className="rain-splashes">
      {drops.map((d) => (
        <div
          key={d.id}
          className={`splash-group shape-${d.shape}`}
          style={{
            left: d.left,
            top: d.top,
            animationDuration: `${d.duration}s`,
          }}
        >
          {/* основная капля с формой */}
          <i
            className="drop-core"
            style={{
              ...getShapeStyle(d),
              background: getShapeGradient(d.shape),
              filter: `blur(${d.blur})`,
              opacity: d.opacity,
            }}
          />

          {/* подтёк */}
          {d.hasStreak && (
            <div
              className="streak"
              style={{
                height: `${d.size * 1.6 * d.streakLength}px`,
                width: `${Math.max(1.5, d.size * 0.3)}px`,
                filter: `blur(${Math.max(0.8, d.size * 0.1)}px)`,
                transform: `rotate(${d.rotation * 0.2}deg)`,
              }}
            />
          )}

          {/* дымка испарения */}
          <div className="vapor" />
        </div>
      ))}
    </div>
  )
}