'use client'

import { useEffect, useState } from 'react'
import { FiCheckCircle, FiClock, FiLoader, FiLock, FiShield, FiXCircle } from 'react-icons/fi'
import Image from 'next/image'

import SignaturePad from '@/app/socios/asociate/signature-pad'

interface AvalSummary {
  solicitudId: string
  numero: string
  paso: 1 | 2
  agencia: string
  categoria: string
  legajo: string
  actividad: string
  localidad: string
  titulares: string[]
  delegado: string
  subdelegado: string
  firmaSolicitante: string
  firmaAval1: string
  nombreAval: string
  emailAval: string
  expira: string
}

export default function FirmaAvalClient({ token }: { token: string }) {
  const [summary, setSummary] = useState<AvalSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signature, setSignature] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [nombres, setNombres] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [sending, setSending] = useState(false)
  const [complete, setComplete] = useState<{ nextEmailSent?: boolean; emailSent?: boolean; pdfGenerated?: boolean } | null>(null)

  useEffect(() => {
    let active = true
    fetch(`/api/firmas/${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? 'El enlace de firma no está disponible.')
        if (active) setSummary(body as AvalSummary)
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la solicitud.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  async function submit() {
    setError('')
    if (!apellidos.trim() || !nombres.trim()) { setError('Ingresá tus apellidos y nombres.'); return }
    if (!signature) { setError('Firmá dentro del recuadro para continuar.'); return }
    if (!accepted) { setError('Aceptá la declaración de aval para firmar.'); return }
    setSending(true)
    try {
      const response = await fetch(`/api/firmas/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apellidos, nombres, imagen: signature, acepta: accepted }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se pudo registrar la firma.')
      setComplete(body)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar la firma. Volvé a intentarlo.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-12"><div className="mx-auto max-w-3xl animate-pulse rounded-3xl bg-white p-8 shadow-sm"><div className="h-4 w-32 rounded bg-slate-200" /><div className="mt-5 h-8 w-2/3 rounded bg-slate-200" /><div className="mt-8 grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 rounded-xl bg-slate-100" />)}</div><div className="mt-8 h-44 rounded-2xl bg-slate-100" /></div></main>
  }

  if (complete) {
    const lastStep = summary?.paso === 2
    return <main className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <FiCheckCircle className="mx-auto text-5xl text-emerald-600" />
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-emerald-700">Firma registrada</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{lastStep ? 'El trámite está completo' : 'Gracias por avalar la solicitud'}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">{lastStep ? `La solicitud ${summary?.numero} completó el circuito de firmas.` : 'El Aval 2 recibirá una invitación cuando el sistema termine de procesar esta firma.'}</p>
      {lastStep && !complete.pdfGenerated ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">La firma quedó registrada, pero no se pudo generar el expediente. El equipo de ACAV podrá reintentarlo desde el panel.</p> : null}
      {lastStep && complete.pdfGenerated && !complete.emailSent ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">El expediente está listo, pero el correo de distribución se encuentra demorado. ACAV podrá reenviarlo.</p> : null}
      {!lastStep && complete.nextEmailSent === false ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">El siguiente aval aún no recibió el correo. El equipo de ACAV podrá reenviar la invitación.</p> : null}
      <p className="mt-6 text-xs text-slate-400">Ya podés cerrar esta ventana.</p>
    </div></main>
  }

  if (!summary) {
    return <main className="min-h-screen bg-slate-50 px-4 py-16"><div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"><FiXCircle className="mx-auto text-4xl text-red-500" /><h1 className="mt-4 text-xl font-bold text-slate-900">Enlace no disponible</h1><p className="mt-3 text-sm leading-6 text-slate-600">{error || 'Este enlace no existe, venció o ya fue utilizado.'}</p><p className="mt-4 text-xs text-slate-400">Contactá a ACAV para solicitar una nueva invitación.</p></div></main>
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-600">A.C.A.V.</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Revisión y firma de aval</h1>
          <p className="mt-2 text-sm text-slate-500">Solicitud {summary.numero} · Aval {summary.paso} de 2</p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-primary-50 p-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Agencia postulante</p><h2 className="mt-1 text-lg font-bold text-slate-900">{summary.agencia}</h2><p className="mt-1 text-xs text-slate-600">{summary.categoria} · Legajo {summary.legajo}</p></div>
            <span className="rounded-full bg-white p-3 text-primary-700"><FiShield /></span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info label="Actividad principal" value={summary.actividad} />
            <Info label="Domicilio" value={summary.localidad} />
            <Info label="Titular 1" value={summary.titulares[0]} />
            <Info label="Titular 2" value={summary.titulares[1]} />
            <Info label="Delegado" value={summary.delegado} />
            <Info label="Subdelegado" value={summary.subdelegado} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SignaturePreview label="Firma del solicitante" image={summary.firmaSolicitante} />
            {summary.paso === 2 ? <SignaturePreview label="Firma del Aval 1" image={summary.firmaAval1} /> : null}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"><FiClock className="mt-0.5 shrink-0" />Este enlace es personal, de un solo uso y vence el {new Date(summary.expira).toLocaleString('es-AR')}.</div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <Info label="Aval solicitado a" value={`${summary.nombreAval} · ${summary.emailAval}`} />
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Apellidos <span className="text-accent-500">*</span></span><input value={apellidos} onChange={(event) => setApellidos(event.target.value)} autoComplete="family-name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Apellidos" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Nombres <span className="text-accent-500">*</span></span><input value={nombres} onChange={(event) => setNombres(event.target.value)} autoComplete="given-name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Nombres" /></label>
          </div>

          <div className="mt-6"><SignaturePad value={signature} onChange={setSignature} label="Tu firma manuscrita" /></div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <span>Declaro ser representante autorizado/a de la agencia indicada y avalo institucionalmente la solicitud de ingreso de la agencia postulante. Confirmo que revisé el resumen y firmo voluntariamente.</span>
          </label>

          {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
          <button type="button" onClick={() => void submit()} disabled={sending} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60">
            {sending ? <><FiLoader className="animate-spin" /> Registrando firma…</> : <><FiCheckCircle /> Confirmar y firmar como Aval {summary.paso}</>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><FiLock /> Conexión segura · la firma queda registrada con fecha, IP y navegador.</p>
        </div>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3.5"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || 'No informado'}</p></div>
}

function SignaturePreview({ label, image }: { label: string; image: string }) {
  return <div className="rounded-xl border border-slate-100 p-3"><p className="text-xs font-semibold text-slate-600">{label}</p>{image ? <Image src={image} alt={label} width={480} height={80} unoptimized className="mt-2 h-20 w-full object-contain" /> : <p className="mt-2 text-xs text-slate-400">Sin firma</p>}</div>
}
