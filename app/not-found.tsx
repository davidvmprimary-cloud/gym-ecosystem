import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0C0C0C] text-[#F0F0F0] p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
      <p className="text-[#8A8A8A] mb-8">No pudimos encontrar el recurso solicitado.</p>
      <Link 
        href="/"
        className="px-6 py-2 bg-[#3D6B47] rounded-full text-sm font-bold active:scale-95 transition-all"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}
