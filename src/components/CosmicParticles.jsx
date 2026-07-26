import { useCallback } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const options = {
  fullScreen: { enable: false },
  fpsLimit: 40,
  detectRetina: true,
  particles: {
    number: { value: 48, density: { enable: true } },
    color: { value: ['#ffffff', '#d8caff', '#d8f698'] },
    shape: { type: 'circle' }, opacity: { value: { min: 0.15, max: 0.65 } },
    size: { value: { min: 1, max: 3 } }, move: { enable: true, speed: 0.28, direction: 'none', outModes: { default: 'out' } },
  },
  interactivity: { events: { onHover: { enable: true, mode: 'slow' } }, modes: { slow: { factor: 3, radius: 120 } } },
}

export default function CosmicParticles({ burst = false }) {
  const init = useCallback(async (engine) => { await loadSlim(engine) }, [])
  const burstOptions = burst ? { ...options, particles: { ...options.particles, number: { value: 95 }, move: { ...options.particles.move, speed: 1.1 }, size: { value: { min: 1, max: 5 } } } } : options
  return <ParticlesProvider init={init}><Particles id="cosmic-particles" className="cosmic-particles" options={burstOptions} /></ParticlesProvider>
}
