'use client'

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div role="alert" className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-xs font-bold tracking-widest text-primary-600">ACAV · ADMINISTRACIÓN</p>
        <h1 className="mt-3 text-xl font-bold text-slate-900">No pudimos cargar el panel</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">El servicio puede estar temporalmente fuera de línea. No borramos tu sesión: revisá tu conexión y volvé a intentar.</p>
        <button type="button" onClick={reset} className="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Volver a intentar</button>
      </div>
    </main>
  )
}
