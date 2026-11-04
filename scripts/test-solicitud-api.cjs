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
    if (id.startsWith('@/')) return loadTypeScript(`src/${id.slice(2)}.ts`, overrides, cache)
    if (id.startsWith('.')) return loadTypeScript(path.resolve(path.dirname(filename), `${id}.ts`), overrides, cache)
    return originalRequire(id)
  }
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename)
  return loaded.exports
}

const { initializeSolicitudDraft } = loadTypeScript('src/lib/solicitudes/draft-client.ts')
const { solicitudApiRequest } = loadTypeScript('src/lib/solicitudes/api-client.ts')
const credentials = { id: 'draft-test-123', numero: 'ACAV-2026-TEST01' }

function storage(initial = JSON.stringify(credentials)) {
  const state = { value: initial, clears: 0, writes: 0 }
  return {
    state, read: () => state.value,
    clear: () => { state.value = null; state.clears++ },
    write: (value) => { state.value = value; state.writes++ },
  }
}

function mockFetch(t, responses) {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    const response = responses.shift()
    if (response instanceof Error) throw response
    assert.ok(response, 'Unexpected additional request or retry')
    return response
  })
  return calls
}

test('HTML errors never discard a saved draft or silently create another one; retry recovers it', async (t) => {
  const local = storage()
  const calls = mockFetch(t, [
    new Response('<!DOCTYPE html><h1>500 Internal Server Error</h1>', { status: 500, headers: { 'content-type': 'text/html' } }),
    Response.json({ datos: { razonSocial: 'Agencia conservada' }, documentos: { arca: { nombre: 'constancia.pdf' } } }),
  ])
  await assert.rejects(initializeSolicitudDraft(local), (error) => {
    assert.equal(error.code, 'INVALID_API_RESPONSE')
    assert.doesNotMatch(error.message, /Unexpected token|DOCTYPE|<h1>/)
    return true
  })
  assert.equal(local.state.clears, 0)
  assert.equal(local.state.value, JSON.stringify(credentials))
  const recovered = await initializeSolicitudDraft(local)
  assert.equal(recovered.data.razonSocial, 'Agencia conservada')
  assert.equal(recovered.documents.arca.nombre, 'constancia.pdf')
  assert.ok(calls.every(({ url }) => url === `/api/solicitudes/ingreso/${credentials.id}`))
  assert.ok(calls.every(({ options }) => options.redirect === 'error' && options.cache === 'no-store'))
})

test('network errors, malformed JSON, outages and ambiguous 401/404 responses preserve drafts', async (t) => {
  const responses = [
    new TypeError('Network failure'),
    new Response('{truncated', { headers: { 'content-type': 'application/json' } }),
    Response.json({ error: 'Servicio no disponible', code: 'DRAFT_SERVICE_UNAVAILABLE' }, { status: 503 }),
    Response.json({ error: 'Old server returns an ambiguous auth error' }, { status: 401 }),
    new Response('<!DOCTYPE html>Not Found', { status: 404, headers: { 'content-type': 'text/html' } }),
    Response.json({ code: 'DRAFT_NOT_FOUND' }, { status: 503 }),
    Response.json({ error: 'Una ruta redirigida no es un borrador' }),
  ]
  const calls = mockFetch(t, [...responses])
  for (let index = 0; index < responses.length; index++) {
    const local = storage()
    await assert.rejects(initializeSolicitudDraft(local))
    assert.equal(local.state.clears, 0)
    assert.equal(local.state.value, JSON.stringify(credentials))
  }
  assert.equal(calls.length, responses.length)
})

test('only explicit permanent draft errors allow starting a new draft', async (t) => {
  const outcomes = [
    ['DRAFT_NOT_FOUND', 404], ['DRAFT_EXPIRED', 410], ['DRAFT_ACCESS_DENIED', 401], ['DRAFT_ALREADY_SUBMITTED', 409],
  ]
  const responses = outcomes.flatMap(([code, status]) => [Response.json({ code, error: 'Acceso no disponible' }, { status }), Response.json({ id: 'draft-new', numero: 'ACAV-NEW' }, { status: 201 })])
  const calls = mockFetch(t, responses)
  for (const _outcome of outcomes) {
    const local = storage()
    const result = await initializeSolicitudDraft(local)
    assert.equal(result.credentials.id, 'draft-new')
    assert.equal(local.state.clears, 1)
    assert.equal(result.data.razonSocial, '')
  }
  assert.equal(calls.filter(({ options }) => options.method === 'POST').length, 4)
})

test('new drafts validate their response and surface HTML failures without leaking markup', async (t) => {
  mockFetch(t, [
    new Response('<!DOCTYPE html>Service error', { status: 500, headers: { 'content-type': 'text/html' } }),
    Response.json({ id: 'invalid/id', numero: 'TEST' }, { status: 201 }),
    Response.json({ id: 'valid-draft', numero: 'TEST' }, { status: 201 }),
  ])
  const local = storage(null)
  await assert.rejects(initializeSolicitudDraft(local), /respuesta inesperada/)
  assert.equal(local.state.writes, 0)
  await assert.rejects(initializeSolicitudDraft(local), /confirmar el inicio/)
  assert.equal(local.state.writes, 0)
  const created = await initializeSolicitudDraft(local)
  assert.equal(created.credentials.id, 'valid-draft')
  assert.equal(local.state.writes, 1)
})

test('all API operations reject non-JSON responses and preserve server error messages', async (t) => {
  mockFetch(t, [
    new Response('Service error', { status: 502, headers: { 'content-type': 'text/html' } }),
    Response.json({ error: 'Falta adjuntar un documento.' }, { status: 400 }),
  ])
  await assert.rejects(solicitudApiRequest('/test', { method: 'PUT' }), (error) => error.code === 'INVALID_API_RESPONSE')
  await assert.rejects(solicitudApiRequest('/test', { method: 'POST' }), /Falta adjuntar un documento/)
})

test('draft API reports infrastructure failures as 503 rather than expired access', async () => {
  const cache = new Map()
  const { DraftAccessError } = loadTypeScript('src/lib/solicitudes/draft-errors.ts', {}, cache)
  let failure = new Error('Firestore internal service failure')
  const route = loadTypeScript('src/app/api/solicitudes/ingreso/[id]/route.ts', {
    '@/lib/solicitudes/service': {
      obtenerBorradorIngreso: async () => { throw failure }, guardarDatosBorrador: async () => { throw failure },
    },
  }, cache)
  const request = new Request('https://acav.example.com/api/solicitudes/ingreso/test')
  const params = { params: { id: 'test' } }
  const unavailable = await route.GET(request, params)
  assert.equal(unavailable.status, 503)
  assert.equal((await unavailable.json()).code, 'DRAFT_SERVICE_UNAVAILABLE')
  failure = new DraftAccessError('El borrador ya no está disponible.', 'DRAFT_NOT_FOUND', 404)
  const expired = await route.GET(request, params)
  assert.equal(expired.status, 404)
  assert.equal((await expired.json()).code, 'DRAFT_NOT_FOUND')
})

test('loading the shared Firebase app no longer initializes Auth/JWT dependencies', async () => {
  let authLoads = 0
  const app = { name: 'acav-solicitudes-admin' }
  const overrides = { 'firebase-admin/app': { getApps: () => [app] } }
  Object.defineProperty(overrides, 'firebase-admin/auth', { get() { authLoads++; throw new Error('Auth module unavailable') } })
  const server = loadTypeScript('src/lib/firebase/server.ts', overrides)
  assert.equal(server.firebaseAdminApp(), app)
  assert.equal(authLoads, 0, 'Firestore can load independently of Auth')
  await assert.rejects(server.firebaseAdminAuth(), /Auth module unavailable/)
  assert.equal(authLoads, 1)
})
