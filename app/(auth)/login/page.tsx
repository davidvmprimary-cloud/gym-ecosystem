import Link from 'next/link'
import { login } from '../actions'

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 shadow-xl">
      <form action={login} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Iniciar sesión
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-zinc-400">
        ¿No tienes cuenta? <Link href="/signup" className="text-green-500 hover:text-green-400">Regístrate</Link>
      </div>
    </div>
  )
}
