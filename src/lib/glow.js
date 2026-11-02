import { CanvasTexture } from 'three'

// 부드럽게 번지는 빛 한 장 (가운데는 밝고 가장자리로 갈수록 투명해지는 동그라미)
export const glowTexture = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
})()

// 별에서 십자로 뻗는 빛줄기 (가운데는 환하고, 사방으로 가늘게 퍼진다)
export const flareTexture = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')
  x.translate(128, 128)
  const spike = (angle, len, w, a) => {
    x.save()
    x.rotate(angle)
    const gr = x.createLinearGradient(-len, 0, len, 0)
    gr.addColorStop(0, 'rgba(255,255,255,0)')
    gr.addColorStop(0.5, `rgba(255,255,255,${a})`)
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = gr
    x.fillRect(-len, -w / 2, len * 2, w)
    x.restore()
  }
  spike(0, 128, 3, 0.95)
  spike(Math.PI / 2, 128, 3, 0.95)
  spike(Math.PI / 4, 70, 2, 0.45)
  spike(-Math.PI / 4, 70, 2, 0.45)
  const rg = x.createRadialGradient(0, 0, 0, 0, 0, 30)
  rg.addColorStop(0, 'rgba(255,255,255,1)')
  rg.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = rg
  x.fillRect(-30, -30, 60, 60)
  return new CanvasTexture(c)
})()
