const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const test = require('node:test')
const ts = require('typescript')
const { NextRequest } = require('next/server')

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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename)
  return loaded.exports
}

function environment(t, values) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]))
  Object.assign(process.env, values)
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
}

function setupServer(t) {
  environment(t, { ADMIN_ALLOWED_EMAILS: 'admin@example.com', NODE_ENV: 'production' })
  const now = Math.floor(Date.now() / 1000)
  const state = {
    cookie: undefined, verifyError: null, createError: null,
    decoded: { uid: 'admin', email: 'admin@example.com', auth_time: now, exp: now + 432000 },
    checks: [], creations: [],
  }
  const auth = {
    verifyIdToken: async (token, revoked) => {
      state.checks.push({ kind: 'id', token, revoked })
      if (state.verifyError) throw state.verifyError
      return state.decoded
    },
    verifySessionCookie: async (token, revoked) => {
      state.checks.push({ kind: 'session', token, revoked })
      if (state.verifyError) throw state.verifyError
      return state.decoded
    },
    createSessionCookie: async (token, options) => {
      if (state.createError) throw state.createError
      state.creations.push({ token, options })
      return 'firebase-server-session-cookie'
    },
  }
  const cache = new Map()
  const overrides = {
    '@/lib/firebase/server': { firebaseAdminAuth: () => auth },
    'next/headers': { cookies: () => ({ get: () => state.cookie ? { value: state.cookie } : undefined }) },
  }
  return {
    state,
    route: loadTypeScript('src/app/api/admin/session/route.ts', overrides, cache),
    session: loadTypeScript('src/lib/admin/session.ts', overrides, cache),
    errors: loadTypeScript('src/lib/admin/api-error.ts', overrides, cache),
  }
}

function request(body = { idToken: 'fresh-id-token' }, headers = {}) {
  return new Request('https://acav.example.com/api/admin/session', {
    method: 'POST', headers: { origin: 'https://acav.example.com', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  })
}

test('creates a real five-day HttpOnly session, not a five-day ID-token cookie', async (t) => {
  const { route, state } = setupServer(t)
  const response = await route.POST(request())
  assert.equal(response.status, 200)
  assert.deepEqual(state.checks, [{ kind: 'id', token: 'fresh-id-token', revoked: true }])
  assert.deepEqual(state.creations, [{ token: 'fresh-id-token', options: { expiresIn: 432000000 } }])
  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /acav_admin_session=firebase-server-session-cookie/)
  assert.doesNotMatch(cookie, /fresh-id-token/)
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=lax', 'Max-Age=432000', 'Path=/']) assert.ok(cookie.includes(flag))
  assert.match(response.headers.get('cache-control'), /no-store/)
  state.cookie = 'firebase-server-session-cookie'
  assert.equal((await route.GET()).status, 200)
  assert.equal(state.checks.at(-1).kind, 'session')
  assert.equal(state.checks.at(-1).revoked, true)
})

test('expired/invalid legacy cookies are cleared, but service outages preserve cookies', async (t) => {
  const { route, state, session, errors } = setupServer(t)
  state.cookie = 'legacy-or-expired-cookie'
  for (const code of ['auth/session-cookie-expired', 'auth/session-cookie-revoked', 'auth/argument-error', 'auth/user-disabled']) {
    state.verifyError = { code }
    const response = await route.GET()
    assert.equal(response.status, 401)
    assert.equal((await response.json()).code, 'SESSION_EXPIRED')
    assert.match(response.headers.get('set-cookie'), /acav_admin_session=;/)
  }
  state.verifyError = { code: 'auth/internal-error' }
  const unavailable = await route.GET()
  assert.equal(unavailable.status, 503)
  assert.equal(unavailable.headers.get('set-cookie'), null)
  await assert.rejects(session.getSessionUser(), session.AuthServiceUnavailableError)
  assert.equal(errors.handleApiError(new session.AuthServiceUnavailableError()).status, 503)
  state.cookie = undefined
  await assert.rejects(session.requireSessionUser(), session.UnauthorizedError)
  const expired = errors.handleApiError(new session.UnauthorizedError())
  assert.equal(expired.status, 401)
  assert.ok(expired.headers.has('set-cookie'))
})

test('access denial, recent sign-in, CSRF and token expiry are handled separately', async (t) => {
  const { route, state } = setupServer(t)
  assert.equal((await route.POST(request({}, { origin: 'https://evil.example.com' }))).status, 403)
  assert.equal((await route.POST(request({}, { 'sec-fetch-site': 'cross-site' }))).status, 403)
  assert.equal(state.checks.length, 0)
  assert.equal((await route.POST(request({}))).status, 400)
  state.decoded.email = 'outsider@example.com'
  const denied = await route.POST(request())
  assert.equal(denied.status, 403)
  assert.equal((await denied.json()).code, 'ACCESS_DENIED')
  state.decoded.email = 'admin@example.com'
  state.decoded.auth_time -= 301
  const stale = await route.POST(request())
  assert.equal(stale.status, 401)
  assert.equal((await stale.json()).code, 'RECENT_LOGIN_REQUIRED')
  assert.equal(state.creations.length, 0)
  state.verifyError = { code: 'auth/id-token-expired' }
  const expired = await route.POST(request())
  assert.equal((await expired.json()).code, 'TOKEN_EXPIRED')
  state.verifyError = { code: 'auth/internal-error' }
  const unavailable = await route.POST(request())
  assert.equal(unavailable.status, 503)
  assert.equal(unavailable.headers.get('set-cookie'), null)
  assert.equal((await route.DELETE(new Request('https://acav.example.com/api/admin/session', { method: 'DELETE', headers: { origin: 'https://evil.example.com' } }))).status, 403)
  const logout = await route.DELETE(new Request('https://acav.example.com/api/admin/session', { method: 'DELETE', headers: { origin: 'https://acav.example.com' } }))
  assert.equal(logout.status, 200)
  assert.match(logout.headers.get('set-cookie'), /acav_admin_session=;/)
})

test('middleware never redirects login based only on cookie presence, and preserves return paths', () => {
  const { middleware } = loadTypeScript('src/middleware.ts')
  const login = middleware(new NextRequest('https://acav.example.com/admin/login', { headers: { cookie: 'acav_admin_session=expired' } }))
  assert.equal(login.status, 200)
  assert.equal(login.headers.get('location'), null)
  const redirect = middleware(new NextRequest('https://acav.example.com/admin/solicitudes?estado=pendiente'))
  const url = new URL(redirect.headers.get('location'))
  assert.equal(url.pathname, '/admin/login')
  assert.equal(url.searchParams.get('next'), '/admin/solicitudes?estado=pendiente')
  const panel = middleware(new NextRequest('https://acav.example.com/admin/banner', {
    headers: { cookie: 'acav_admin_session=present', 'x-admin-return-to': '/admin/blog' },
  }))
  assert.equal(panel.headers.get('x-middleware-request-x-admin-return-to'), '/admin/banner')
})

test('default entry is Banners and login return paths cannot escape the admin or form a loop', () => {
  const { adminReturnPath } = loadTypeScript('src/lib/admin/session-config.ts')
  for (const next of [undefined, null, '', '/admin', '/admin/login', '/admin/login?next=/admin/login', '/admin/%6cogin', '/admin/../login', '/admin/../../evil', '//evil.example.com', 'https://evil.example.com', '/admin/\\evil', '/administrator', ['/admin/blog']]) {
    assert.equal(adminReturnPath(next), '/admin/banner', String(next))
  }
  assert.equal(adminReturnPath('/admin/solicitudes?estado=pendiente'), '/admin/solicitudes?estado=pendiente')
  assert.equal(adminReturnPath('/admin/blog'), '/admin/blog')
})

function setupClient(t, responses) {
  const calls = []
  let tokens = 0
  const auth = { authStateReady: async () => { calls.push('ready') } }
  const api = loadTypeScript('src/lib/admin/session-client.ts', {
    '@/lib/firebase/client': { firebaseAuth: () => auth },
    'firebase/auth': {
      inMemoryPersistence: 'memory-only',
      setPersistence: async (_auth, persistence) => { calls.push(['persistence', persistence]) },
      signOut: async () => { calls.push('signOut') },
      signInWithEmailAndPassword: async (_auth, email, password) => {
        calls.push(['signIn', email, password])
        return { user: { getIdToken: async (force) => { assert.equal(force, true); return `fresh-${++tokens}` } } }
      },
    },
  })
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(['fetch', url, options])
    const response = responses.shift()
    if (response instanceof Error) throw response
    assert.ok(response, 'No unbounded retry')
    return Response.json(response.body ?? {}, { status: response.status })
  })
  return { api, calls }
}

test('login uses in-memory auth, forces fresh tokens, retries expiry once and discards client tokens', async (t) => {
  const { api, calls } = setupClient(t, [{ status: 401, body: { code: 'TOKEN_EXPIRED' } }, { status: 200 }])
  await api.startAdminSession(' admin@example.com ', 'test-password')
  assert.deepEqual(calls.slice(0, 4), ['ready', ['persistence', 'memory-only'], 'signOut', ['signIn', 'admin@example.com', 'test-password']])
  const requests = calls.filter((entry) => Array.isArray(entry) && entry[0] === 'fetch')
  assert.equal(requests.length, 2)
  assert.deepEqual(requests.map((entry) => JSON.parse(entry[2].body).idToken), ['fresh-1', 'fresh-2'])
  assert.ok(requests.every((entry) => entry[2].cache === 'no-store' && entry[2].method === 'POST'))
  assert.equal(calls.at(-1), 'signOut')
})

test('login does not retry permissions/outages, and reset only deletes the ACAV session', async (t) => {
  const { api, calls } = setupClient(t, [
    { status: 403, body: { error: 'Cuenta no autorizada' } },
    { status: 503, body: { error: 'Servicio no disponible' } },
    { status: 401, body: { code: 'TOKEN_EXPIRED' } },
    { status: 401, body: { error: 'Volvé a ingresar', code: 'TOKEN_EXPIRED' } },
    { status: 200 },
  ])
  await assert.rejects(api.startAdminSession('admin@example.com', 'password'), /Cuenta no autorizada/)
  await assert.rejects(api.startAdminSession('admin@example.com', 'password'), /Servicio no disponible/)
  await assert.rejects(api.startAdminSession('admin@example.com', 'password'), /Volvé a ingresar/)
  await api.resetAdminSession()
  const requests = calls.filter((entry) => Array.isArray(entry) && entry[0] === 'fetch')
  assert.deepEqual(requests.map((entry) => entry[2].method), ['POST', 'POST', 'POST', 'POST', 'DELETE'])
  assert.ok(requests.every((entry) => entry[1] === '/api/admin/session'))
})

test('panel guard keeps the session on outages and returns to the current section after expiry', async (t) => {
  const effects = []
  const warnings = []
  const redirects = []
  const listeners = new Map()
  const responses = [503, 200, 401]
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  let cleanup
  globalThis.window = {
    location: { pathname: '/admin/solicitudes', search: '?estado=pendiente', replace: (url) => redirects.push(url) },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval: () => {},
    addEventListener: (name, callback) => listeners.set(`window:${name}`, callback),
    removeEventListener: (name) => listeners.delete(`window:${name}`),
  }
  globalThis.document = {
    visibilityState: 'visible',
    addEventListener: (name, callback) => listeners.set(`document:${name}`, callback),
    removeEventListener: (name) => listeners.delete(`document:${name}`),
  }
  t.after(() => {
    cleanup?.()
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  })
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.cache, 'no-store')
    return new Response(null, { status: responses.shift() })
  })
  const { default: Guard } = loadTypeScript('src/app/admin/(panel)/session-guard.tsx', {
    react: { useEffect: (callback) => effects.push(callback), useState: () => [false, (value) => warnings.push(value)] },
  })
  Guard()
  cleanup = effects[0]()
  const flush = () => new Promise(setImmediate)
  await flush()
  assert.deepEqual(warnings, [true])
  assert.equal(redirects.length, 0, 'A 503 must not sign out')
  listeners.get('window:focus')()
  await flush()
  assert.deepEqual(warnings, [true, false])
  listeners.get('window:focus')()
  await flush()
  assert.equal(redirects.length, 1)
  const login = new URL(redirects[0], 'https://acav.example.com')
  assert.equal(login.pathname, '/admin/login')
  assert.equal(login.searchParams.get('reason'), 'expired')
  assert.equal(login.searchParams.get('next'), '/admin/solicitudes?estado=pendiente')
})
