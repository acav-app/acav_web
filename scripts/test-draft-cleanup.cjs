const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const test = require('node:test')
const ts = require('typescript')

function loadTypeScript(relativePath, overrides = {}, cache = new Map()) {
  const filename = path.resolve(__dirname, '..', relativePath)
  if (cache.has(filename)) return cache.get(filename).exports
  const loaded = new Module(filename, module)
  loaded.filename = filename
  loaded.paths = Module._nodeModulePaths(path.dirname(filename))
  cache.set(filename, loaded)
  const originalRequire = loaded.require.bind(loaded)
  loaded.require = (id) => {
    if (id === 'server-only') return {}
    if (Object.hasOwn(overrides, id)) return overrides[id]
    if (id.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), `${id}.ts`)
      if (fs.existsSync(target)) return loadTypeScript(target, overrides, cache)
    }
    return originalRequire(id)
  }
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename)
  return loaded.exports
}

const { DATOS_INGRESO_VACIOS } = loadTypeScript('src/lib/solicitudes/types.ts')
const { esBorradorVacioInactivo, BORRADOR_VACIO_INACTIVIDAD_MS } = loadTypeScript('src/lib/solicitudes/draft-cleanup-policy.ts')
const now = Date.parse('2026-11-04T12:00:00Z')

function draft(age = BORRADOR_VACIO_INACTIVIDAD_MS) {
  return {
    estado: 'BORRADOR', datos: structuredClone(DATOS_INGRESO_VACIOS),
    documentos: {}, firmas: {}, pdfKey: '', notas: '', notificaciones: {},
    createdAt: new Date(now - age - 1000), updatedAt: new Date(now - age),
  }
}

test('only empty drafts inactive for at least 48 hours are eligible', () => {
  assert.equal(esBorradorVacioInactivo(draft(), now), true)
  assert.equal(esBorradorVacioInactivo(draft(BORRADOR_VACIO_INACTIVIDAD_MS - 1), now), false)
  const old = draft()
  old.updatedAt = { toMillis: () => now - BORRADOR_VACIO_INACTIVIDAD_MS }
  assert.equal(esBorradorVacioInactivo(old, now), true)
  assert.equal(esBorradorVacioInactivo({ ...old, updatedAt: old.createdAt.toISOString() }, now), true)
  assert.equal(esBorradorVacioInactivo({ ...old, updatedAt: null }, now), true)
  for (const invalid of ['invalid', new Date('invalid'), { toMillis: () => NaN }]) {
    assert.equal(esBorradorVacioInactivo({ ...old, updatedAt: invalid }, now), false)
  }
  assert.equal(esBorradorVacioInactivo({ ...old, createdAt: null, updatedAt: null }, now), false)
  assert.equal(esBorradorVacioInactivo({ ...old, updatedAt: new Date(now + 1000) }, now), false)
  for (const estado of ['VENCIDO', 'PENDIENTE_AVAL_1', 'PENDIENTE_AVAL_2', 'COMPLETADO_APROBADO', 'RECHAZADA', undefined]) {
    assert.equal(esBorradorVacioInactivo({ ...old, estado }, now), false)
  }
  assert.equal(esBorradorVacioInactivo({ ...old, eliminando: true }, now), false)
})

test('protect data, legacy fields, attachments, uploads, signatures and notes', () => {
  for (const key of Object.keys(DATOS_INGRESO_VACIOS)) {
    const record = draft()
    if (key === 'titulares') record.datos.titulares[1].nombres = 'Persona'
    else if (key === 'delegado' || key === 'subdelegado') record.datos[key].dni = '12345678'
    else if (key === 'avales') record.datos.avales[1].email = 'aval@example.com'
    else if (key === 'redesSociales') record.datos.redesSociales.otra = '@agencia'
    else record.datos[key] = key === 'cantidadSucursales' ? '1' : 'dato'
    assert.equal(esBorradorVacioInactivo(record, now), false, key)
  }
  const whitespace = draft()
  whitespace.datos.razonSocial = '  \n '
  whitespace.datos.cantidadSucursales = 0
  assert.equal(esBorradorVacioInactivo(whitespace, now), true)
  for (const key of ['nombre', 'domicilioVirtual', 'campoDesconocido']) {
    const record = draft()
    record.datos[key] = 'Contenido antiguo'
    assert.equal(esBorradorVacioInactivo(record, now), false)
  }
  for (const [key, value] of [
    ['documentos', { arca: { key: 'document.pdf' } }],
    ['pendingUploads', { arca: { key: 'pending.pdf', expiresAt: '2020-01-01' } }],
    ['firmas', { solicitante: { nombre: 'Persona' } }],
    ['invites', { aval1: { hash: 'hash' } }],
    ['notificaciones', { aval1: 'enviada' }], ['pdfKey', 'expediente.pdf'], ['notas', 'Conservar'],
  ]) assert.equal(esBorradorVacioInactivo({ ...draft(), [key]: value }, now), false, key)
})

function mockDb(records, onRead) {
  const state = { records: new Map(Object.entries(records)), audit: [], transactions: 0, pages: 0 }
  function snapshot(id, value) {
    return { id, ref: { id }, data: () => value }
  }
  function query(cursor = '') {
    return {
      where: () => query(cursor), orderBy: () => query(cursor), limit: () => query(cursor),
      startAfter: (id) => query(id),
      get: async () => {
        state.pages++
        const docs = [...state.records].filter(([id, value]) => id > cursor && value.estado === 'BORRADOR')
          .sort(([a], [b]) => a.localeCompare(b)).slice(0, 200).map(([id, value]) => snapshot(id, value))
        return { docs, empty: docs.length === 0, size: docs.length }
      },
      doc: () => ({ audit: true }),
    }
  }
  return {
    state, collection: () => query(),
    runTransaction: async (callback) => {
      state.transactions++
      return callback({
        get: async ({ id }) => {
          if (onRead) onRead(state, id)
          return snapshot(id, state.records.get(id))
        },
        create: (_ref, value) => state.audit.push(value),
        delete: ({ id }) => state.records.delete(id),
      })
    },
  }
}

function cleanupFor(db) {
  return loadTypeScript('src/lib/solicitudes/draft-cleanup.ts', {
    './firestore': { solicitudesDb: () => db, FieldValue: { serverTimestamp: () => 'server-time' } },
    'firebase-admin/firestore': { FieldPath: { documentId: () => '__name__' } },
  }).limpiarBorradoresVacios
}

test('cleanup paginates, audits, rechecks concurrent activity and is idempotent', async (t) => {
  t.mock.method(Date, 'now', () => now)
  const records = Object.fromEntries(Array.from({ length: 205 }, (_, index) => [`draft-${String(index).padStart(3, '0')}`, draft()]))
  records.protected = { ...draft(), notas: 'Conservar' }
  const db = mockDb(records, (state, id) => {
    if (id === 'draft-000') state.records.set(id, { ...draft(), updatedAt: new Date(now) })
    if (id === 'draft-001') state.records.set(id, { ...draft(), estado: 'PENDIENTE_AVAL_1' })
    if (id === 'draft-002') state.records.set(id, { ...draft(), documentos: { arca: { key: 'file.pdf' } } })
  })
  const cleanup = cleanupFor(db)
  const preview = await cleanup({ dryRun: true })
  assert.equal(preview.candidatos, 205)
  assert.equal(db.state.transactions, 0)
  assert.equal(db.state.records.size, 206)
  const result = await cleanup()
  assert.equal(result.eliminados, 202)
  assert.equal(result.omitidos, 3)
  assert.equal(result.errores, 0)
  assert.ok(db.state.pages >= 4)
  assert.equal(db.state.audit.length, 202)
  assert.ok(db.state.audit.every((entry) => entry.motivo === 'BORRADOR_VACIO_INACTIVO_48H' && !entry.datos))
  assert.equal((await cleanup()).eliminados, 0)
})

test('failed transactions are reported without preventing other cleanups', async (t) => {
  t.mock.method(Date, 'now', () => now)
  const db = mockDb({ failure: draft(), success: draft() }, (_state, id) => {
    if (id === 'failure') throw new Error('Simulated database failure')
  })
  const result = await cleanupFor(db)()
  assert.equal(result.errores, 1)
  assert.equal(result.eliminados, 1)
  assert.equal(db.state.records.has('failure'), true)
  assert.equal(db.state.audit.length, 1)
})

test('cron refuses missing/invalid secrets and supports authorized dry run', async () => {
  const previous = process.env.CRON_SECRET
  let calls = 0
  const { GET } = loadTypeScript('src/app/api/cron/solicitudes/borradores/route.ts', {
    '@/lib/solicitudes/draft-cleanup': {
      limpiarBorradoresVacios: async ({ dryRun }) => { calls++; return { dryRun, errores: 0 } },
    },
  })
  try {
    delete process.env.CRON_SECRET
    assert.equal((await GET(new Request('https://example.com'))).status, 503)
    process.env.CRON_SECRET = 'test-secret-not-used-in-production'
    assert.equal((await GET(new Request('https://example.com'))).status, 401)
    assert.equal((await GET(new Request('https://example.com', { headers: { authorization: 'Bearer invalid' } }))).status, 401)
    assert.equal(calls, 0)
    const response = await GET(new Request('https://example.com?dryRun=1', {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).dryRun, true)
    assert.equal(calls, 1)
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previous
  }
})
