import Link from 'next/link'
import { signup } from '../actions'

export const dynamic = 'force-dynamic'

export default async function SignupPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 shadow-xl">
      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}
      <form action={signup} className="flex flex-col gap-4">
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
          className="mt-2 w-full rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Crear cuenta
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-zinc-400">
        ¿Ya tienes cuenta? <Link href="/login" className="text-green-500 hover:text-green-400">Inicia sesión</Link>
      </div>
    </div>
  )
}
