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

function setup(t, send = async () => ({ error: null })) {
  const environment = {
    RESEND_API_KEY: 'test-key-never-sent',
    RESEND_FROM_EMAIL: 'ACAV <tramites@example.com>',
    NEXT_PUBLIC_SITE_URL: 'https://acav.example.com',
  }
  const previous = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]))
  Object.assign(process.env, environment)
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
  const messages = []
  class MockResend {
    emails = { send: async (message) => { messages.push(message); return send(message) } }
  }
  const api = loadTypeScript('src/lib/solicitudes/email.ts', { resend: { Resend: MockResend } })
  return { api, messages }
}

test('all notification types use the branded responsive template and plain text', async (t) => {
  const { api, messages } = setup(t)
  const common = { agencia: 'Agencia de turismo de prueba', numero: 'ACAV-2026-TEST01' }
  for (const paso of [1, 2]) await api.enviarInvitacionAval({ ...common, paso, email: `aval${paso}@example.com`, token: 'a'.repeat(43) })
  for (const tipo of ['recibida', 'avance']) await api.enviarResumenSolicitante({
    ...common, tipo, email: 'solicitante@example.com', estado: 'Pendiente de firma del Aval 2', mensaje: 'El primer aval ya firmó.\nEsperamos la firma del segundo aval.',
  })
  await api.enviarExpediente({ ...common, emails: ['solicitante@example.com', 'aval1@example.com', ' SOLICITANTE@example.com '], pdf: new Uint8Array([1, 2, 3]) })
  await api.enviarAvisoAdministrativo({ ...common, email: 'admin@example.com', etapa: 'Solicitud completada' })
  assert.equal(messages.length, 7)
  for (const message of messages) {
    assert.equal(message.from, 'ACAV <tramites@example.com>')
    assert.equal(message.to.length, 1, 'Recipients must never be exposed to other parties')
    assert.match(message.html, /name="viewport"/)
    assert.match(message.html, /max-width:600px/)
    assert.match(message.html, /width:100%;table-layout:fixed/)
    assert.match(message.html, /@media only screen and \(max-width:620px\)/)
    assert.match(message.html, /\/images\/logo\.png/)
    assert.match(message.html, /alt="ACAV"/)
    assert.match(message.html, /bgcolor="#0088d8"/)
    assert.match(message.html, /border-bottom:4px solid #f94910/)
    assert.match(message.html, /font-size:16px;line-height:26px/)
    assert.match(message.html, /mso-hide:all/)
    assert.match(message.html, /RESUMEN DEL TRÁMITE/)
    assert.match(message.html, /ACAV-2026-TEST01/)
    assert.match(message.text, /Agencia de turismo de prueba/)
    assert.match(message.text, /ACAV-2026-TEST01/)
    assert.match(message.text, /Asociación Cordobesa/)
    assert.ok(Buffer.byteLength(message.html) < 25 * 1024, 'HTML stays well below Gmail clipping size')
    for (const tag of ['table', 'tr', 'td']) {
      assert.equal((message.html.match(new RegExp(`<${tag}\\b`, 'g')) || []).length, (message.html.match(new RegExp(`</${tag}>`, 'g')) || []).length, `Balanced ${tag} markup`)
    }
  }
  const invitations = messages.slice(0, 2)
  for (const invitation of invitations) {
    const url = 'https://acav.example.com/firmar/' + 'a'.repeat(43)
    assert.match(invitation.html, /Revisar y firmar/)
    assert.match(invitation.html, /copiá y pegá este enlace/)
    assert.equal(invitation.html.split(`href="${url}"`).length - 1, 2)
    assert.ok(invitation.text.includes(url))
    assert.match(invitation.text, /10 días/)
    assert.match(invitation.text, /No lo compartas/)
  }
  for (const message of messages.slice(4, 6)) {
    assert.equal(message.attachments[0].filename, 'ACAV-2026-TEST01-expediente.pdf')
    assert.deepEqual(message.attachments[0].content, Buffer.from([1, 2, 3]))
    assert.match(message.html, /Expediente PDF adjunto/)
  }
  assert.match(messages[6].text, /https:\/\/acav\.example\.com\/admin\/solicitudes/)
  // Optional local previews use the actual outgoing HTML, never send email, and
  // embed the existing logo so they can be opened offline for visual inspection.
  if (process.env.ACAV_EMAIL_PREVIEW_DIR) {
    const directory = path.resolve(process.env.ACAV_EMAIL_PREVIEW_DIR)
    fs.mkdirSync(directory, { recursive: true })
    const logo = fs.readFileSync(path.resolve(__dirname, '../public/images/logo.png')).toString('base64')
    for (const [name, index] of [['aval_1', 0], ['aval_2', 1], ['recibida', 2], ['avance', 3], ['expediente', 4], ['administrativo', 6]]) {
      fs.writeFileSync(path.join(directory, `${name}.html`), messages[index].html.replace('https://acav.example.com/images/logo.png', `data:image/png;base64,${logo}`))
    }
  }
})

test('dynamic content and action URLs are escaped, including long names', async (t) => {
  const { api, messages } = setup(t)
  const agencia = 'Agencia <script>alert("x")</script> & asociados ' + 'NombreExtenso'.repeat(30)
  await api.enviarInvitacionAval({ email: 'aval@example.com', agencia, numero: 'ACAV-TEST', paso: 1, token: 'token/with?special&characters' })
  assert.doesNotMatch(messages[0].html, /<script>/)
  assert.match(messages[0].html, /&lt;script&gt;/)
  assert.match(messages[0].html, /&amp; asociados/)
  assert.match(messages[0].html, /word-break:break-word;overflow-wrap:anywhere/)
  assert.ok(messages[0].html.includes('token%2Fwith%3Fspecial%26characters'))
  assert.ok(messages[0].text.includes(agencia), 'Plain text preserves literal user content')
  assert.equal(api.escapeHtml(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;')
})

test('email failures are still propagated and final notifications attempt every recipient', async (t) => {
  const { api, messages } = setup(t, async () => ({ error: { message: 'Simulated delivery failure' } }))
  await assert.rejects(api.enviarInvitacionAval({ email: 'aval@example.com', agencia: 'Agencia', numero: 'TEST', paso: 1, token: 'token' }), /Simulated delivery failure/)
  await assert.rejects(api.enviarExpediente({ emails: ['one@example.com', 'two@example.com'], agencia: 'Agencia', numero: 'TEST', pdf: new Uint8Array() }), /No se pudieron entregar todos los emails/)
  assert.equal(messages.length, 3)
  await assert.rejects(api.enviarExpediente({ emails: [], agencia: 'Agencia', numero: 'TEST', pdf: new Uint8Array() }), /No hay destinatarios/)
})
