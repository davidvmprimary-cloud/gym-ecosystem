import Link from 'next/link'
import { login } from '../actions'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fitness-accent opacity-[0.03] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[450px]">
        {/* Header */}
        <header className="flex flex-col items-center mb-16">
          <div className="glass-container mascot-glow w-24 h-24 rounded-2xl flex items-center justify-center p-4 relative mb-6">
            <Image 
              src="/icon.svg" 
              alt="Mascot" 
              width={60} 
              height={60} 
              className="text-fitness-glow"
            />
          </div>
          <div className="text-center">
            <h1 className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">
              Bienvenido de nuevo
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <form action={login} className="space-y-12">
            {/* Email Field */}
            <div className="relative group">
              <label 
                className="text-[10px] uppercase tracking-[0.2em] text-fitness-bright font-black mb-2 block opacity-60 group-focus-within:opacity-100 transition-opacity" 
                for="email"
              >
                Identificador
              </label>
              <input 
                className="w-full bg-transparent border-none p-0 py-3 focus:ring-0 text-fitness-text placeholder:text-zinc-800 font-bold tracking-tight text-lg selection:bg-fitness-accent/30" 
                id="email" 
                name="email"
                placeholder="usuario@sistema.fit" 
                required 
                type="email" 
              />
              <div className="input-underline"></div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="flex justify-between items-end mb-2">
                <label 
                  className="text-[10px] uppercase tracking-[0.2em] text-fitness-bright font-black block opacity-60 group-focus-within:opacity-100 transition-opacity" 
                  for="password"
                >
                  Acceso
                </label>
                <Link 
                  className="text-[9px] uppercase tracking-widest text-zinc-700 hover:text-fitness-bright transition-colors font-bold" 
                  href="#"
                >
                  ¿Olvido?
                </Link>
              </div>
              <input 
                className="w-full bg-transparent border-none p-0 py-3 focus:ring-0 text-fitness-text placeholder:text-zinc-800 font-bold tracking-[0.4em] text-lg selection:bg-fitness-accent/30" 
                id="password" 
                name="password"
                placeholder="••••••••" 
                required 
                type="password" 
              />
              <div className="input-underline"></div>
            </div>

            {/* Action Button */}
            <div className="pt-6">
              <button 
                className="btn-experimental w-full bg-fitness-bright py-6 px-8 text-fitness-bg font-black text-sm uppercase tracking-[0.3em] shadow-[0_10px_20px_-5px_rgba(61,107,71,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(61,107,71,0.4)] active:scale-[0.98] transition-all" 
                type="submit"
              >
                INICIAR SESIÓN
              </button>
            </div>
          </form>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-zinc-700 text-[10px] uppercase tracking-[0.25em] font-medium">
            ¿Eres nuevo? <Link className="text-fitness-bright font-black ml-1 hover:text-fitness-glow transition-colors" href="/signup">CREAR ACCESO</Link>
          </p>
        </footer>
      </div>
      
      <style jsx global>{`
        .mascot-glow {
          box-shadow: 0 0 40px 5px rgba(95, 168, 112, 0.1);
        }
        .btn-experimental {
          clip-path: polygon(0% 0%, 94% 0%, 100% 20%, 100% 100%, 6% 100%, 0% 80%);
        }
        .input-underline {
          position: relative;
          border-bottom: 2px solid #1a1a1a;
        }
        .input-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #3D6B47;
          transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        input:focus + .input-underline::after {
          width: 100%;
        }
        .glass-container {
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  )
}
