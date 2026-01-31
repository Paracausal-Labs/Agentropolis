import dynamic from 'next/dynamic'

const GameComponent = dynamic(() => import('./GameComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-gray-900 flex items-center justify-center">Loading game...</div>,
})

export default function PhaserGame() {
  return <GameComponent />
}
