const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const test = require('node:test')
const ts = require('typescript')
const { PDFDocument, PDFPage } = require('pdf-lib')
const { PNG } = require('pngjs')

// Compile in memory so the server-only generator can be tested without Next.js.
function loadTypeScript(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const loaded = new Module(filename, module)
  loaded.filename = filename
  loaded.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = loaded.require.bind(loaded)
  loaded.require = (id) => {
    if (id === 'server-only') return {}
    if (Object.hasOwn(overrides, id)) return overrides[id]
    if (id === './types') return loadTypeScript('src/lib/solicitudes/types.ts')
    return originalRequire(id)
  }
  loaded._compile(compiled, filename)
  return loaded.exports
}

const { generarExpedientePdf } = loadTypeScript('src/lib/solicitudes/pdf.ts')
const { DATOS_INGRESO_VACIOS, DOCUMENTOS_OBLIGATORIOS } = loadTypeScript('src/lib/solicitudes/types.ts')

function assertNoTextOverlap(texts) {
  for (let index = 0; index < texts.length; index++) {
    const a = texts[index]
    for (const b of texts.slice(index + 1)) {
      if (a.page !== b.page) continue
      const overlapX = Math.min(a.x + a.font.widthOfTextAtSize(a.text, a.size), b.x + b.font.widthOfTextAtSize(b.text, b.size)) - Math.max(a.x, b.x)
      const overlapY = Math.min(a.y + a.size * 0.8, b.y + b.size * 0.8) - Math.max(a.y - 1, b.y - 1)
      assert.ok(overlapX < 0.5 || overlapY < 0.5, `Overlapping text: ${a.text} / ${b.text}`)
    }
  }
}

function fixture() {
  const datos = structuredClone(DATOS_INGRESO_VACIOS)
  Object.assign(datos, {
    categoria: 'Activo', razonSocial: 'Agencia de prueba', designacionComercial: 'Turismo',
    actividadPrincipal: 'Viajes y Turismo', legajo: '111111', domicilioFisico: 'Buenos Aires',
    esFranquicia: 'No', esSucursal: 'No', poseeSucursales: 'No', empleadosCordoba: '10',
    cuit: '20395172213', condicionIva: 'Responsable Inscripto', whatsapp: '1122533111',
    email: 'agencia@example.com', sitioWeb: 'https://example.com',
  })
  Object.assign(datos.titulares[0], {
    nombres: 'Jose', apellidos: 'Gordillo', fechaNacimiento: '1999-01-01', dni: '11111111',
    telefono: '1122533111', email: 'titular@example.com', ocupacion: 'Turismo',
  })
  datos.avales = [
    { agencia: 'Agencia uno', email: 'aval1@example.com' },
    { agencia: 'Agencia dos', email: 'aval2@example.com' },
  ]
  const documento = { key: 'test', nombre: 'documentacion-de-prueba.pdf', size: 58368, uploadedAt: '2026-11-04T13:52:00Z', contentType: 'application/pdf' }
  const signature = new PNG({ width: 160, height: 50 })
  // Small synthetic ink stroke; no personal signature or real customer data.
  for (let x = 10; x < 150; x++) {
    const index = (25 * signature.width + x) * 4
    signature.data[index + 3] = 255
  }
  const signatureImage = `data:image/png;base64,${PNG.sync.write(signature).toString('base64')}`
  return {
    id: 'test', numero: 'ACAV-2026-9YUUF7', estado: 'COMPLETADO_APROBADO', datos,
    documentos: Object.fromEntries(DOCUMENTOS_OBLIGATORIOS.map((key) => [key, { ...documento }])),
    firmas: Object.fromEntries(['solicitante', 'aval1', 'aval2'].map((key) => [key, {
      nombre: `Firmante ${key}`, imagen: signatureImage, firmadaEn: '2026-11-04T13:57:00Z', ip: '', userAgent: '',
    }])),
    pdfKey: '', notas: '', createdAt: '2026-11-04T13:44:00Z', updatedAt: null, expiresAt: null, notificaciones: {},
  }
}

test('expediente: pagination, header, optional documents and long content', async () => {
  const texts = []
  const rectangles = []
  const originalText = PDFPage.prototype.drawText
  const originalRectangle = PDFPage.prototype.drawRectangle
  PDFPage.prototype.drawText = function (text, options) {
    texts.push({ page: this, text, ...options })
    assert.ok(options.y >= 24 && options.y <= 842, `Text outside page: ${text}`)
    assert.ok(options.x >= 0 && options.x + options.font.widthOfTextAtSize(text, options.size) <= 596, `Text too wide: ${text}`)
    return originalText.call(this, text, options)
  }
  PDFPage.prototype.drawRectangle = function (options) {
    rectangles.push(options)
    return originalRectangle.call(this, options)
  }
  try {
    const solicitud = fixture()
    const bytes = await generarExpedientePdf(solicitud)
    const document = await PDFDocument.load(bytes)
    assertNoTextOverlap(texts)
    assert.ok(document.getPageCount() <= 3, 'The sample should fit in at most three pages')
    const content = texts.map(({ text }) => text).join('\n')
    assert.match(content, /Titular 2: no informado/)
    assert.match(content, /Delegado: no informado/)
    assert.match(content, /01\/01\/1999/)
    assert.match(content, /04\/11\/2026, 10:44/)
    assert.equal(texts.filter(({ text }) => text === 'OPCIONAL NO PRESENTADO').length, 4)
    assert.equal(texts.filter(({ text }) => text === 'PENDIENTE').length, 0)
    assert.doesNotMatch(content, /DNI ·/)
    const orange = rectangles.filter(({ color }) => color?.red === 249 / 255 && color?.green === 73 / 255)
    assert.equal(orange.length, document.getPageCount())
    assert.ok(orange.every(({ x, width, height }) => x === 0 && width > 595 && height === 3), 'Only a bottom orange rule in the header')
    const title = texts.find(({ text }) => text === 'SOLICITUD DE INGRESO')
    assert.ok(title, 'The first page must have a title')
    assert.ok(Math.abs(orange[0].y - title.y - 47) < 0.1, 'The first-page title has an additional 8 mm of clearance below the header')
    const signerLabels = texts.filter(({ text }) => ['SOLICITANTE', 'AVAL 1', 'AVAL 2'].includes(text))
    assert.equal(signerLabels.length, 3)
    assert.ok(signerLabels.every(({ page, y }) => page === signerLabels[0].page && y === signerLabels[0].y), 'All signatures share a row')
    for (const entry of texts.filter(({ text }) => text === 'SITIO WEB')) {
      assert.ok(texts.some(({ page, text }) => page === entry.page && text.startsWith('Información de la agencia')))
    }

    texts.length = 0
    const long = fixture()
    long.estado = 'BORRADOR'
    delete long.documentos.arca
    long.datos.redesSociales.otra = 'https://example.com/'.repeat(60)
    long.datos.domicilioFisico = 'Dirección extensa para probar saltos de página. '.repeat(35)
    long.datos.titulares[1] = { ...long.datos.titulares[0], nombres: 'Segundo titular' }
    long.datos.delegado = { ...long.datos.titulares[0] }
    long.datos.subdelegado = { ...long.datos.titulares[0] }
    for (const doc of Object.values(long.documentos)) doc.nombre = 'nombre-de-archivo-extenso-'.repeat(8) + '.pdf'
    for (const signature of Object.values(long.firmas)) signature.nombre = 'Nombre y apellido compuesto '.repeat(5)
    const longDocument = await PDFDocument.load(await generarExpedientePdf(long))
    assertNoTextOverlap(texts)
    assert.ok(longDocument.getPageCount() > document.getPageCount())
    assert.ok(texts.some(({ text }) => text.includes('(continuación)')))
    assert.equal(texts.filter(({ text }) => text === 'PENDIENTE').length, 1)
    assert.ok(texts.filter(({ text }) => text.includes('(continuación)')).every(({ y }) => y > 700))
    assert.ok(texts.filter(({ text }) => text.includes('(continuación)')).every(({ y }) => Math.abs(y - (841.89 - 70 - 27 - 12 - 2)) < 0.1), 'Continuation headings have an additional 4 mm of header clearance')
    assert.ok(texts.filter(({ y }) => y < 56).every(({ text }) => text.startsWith('ACAV ·') || text.startsWith('Página ')), 'Content must not overlap the footer')
  } finally {
    PDFPage.prototype.drawText = originalText
    PDFPage.prototype.drawRectangle = originalRectangle
  }
})

test('admin export generates a fresh PDF on every request without using the stored file', async () => {
  let current = fixture()
  let authorized = true
  let reads = 0
  const generatedNames = []
  const { GET } = loadTypeScript('src/app/api/admin/solicitudes/ingreso/[id]/expediente/route.ts', {
    '@/lib/solicitudes/admin': {
      requireIngresoAdmin: async () => { if (!authorized) throw new Error('Unauthorized') },
    },
    '@/lib/admin/api-error': {
      handleApiError: () => Response.json({ error: 'No autorizado' }, { status: 401 }),
    },
    '@/lib/solicitudes/service': {
      obtenerSolicitudIngreso: async () => { reads++; return current },
      urlExpedienteIngreso: () => { throw new Error('Stored PDF must never be used') },
    },
    '@/lib/solicitudes/pdf': {
      generarExpedientePdf: async (solicitud) => {
        generatedNames.push(solicitud.datos.razonSocial)
        return generarExpedientePdf(solicitud)
      },
    },
  })
  const params = { params: { id: current.id } }
  const first = await GET(new Request('https://example.com/expediente'), params)
  assert.equal(first.status, 200)
  assert.equal(first.headers.get('content-type'), 'application/pdf')
  assert.match(first.headers.get('content-disposition'), /attachment; filename="ACAV-2026-9YUUF7-expediente.pdf"/)
  assert.match(first.headers.get('cache-control'), /no-store/)
  await PDFDocument.load(await first.arrayBuffer())
  current = structuredClone(current)
  current.datos.razonSocial = 'Agencia editada después de la primera descarga'
  current.pdfKey = 'historico-que-no-debe-descargarse.pdf'
  const second = await GET(new Request('https://example.com/expediente'), params)
  assert.equal(second.status, 200)
  await PDFDocument.load(await second.arrayBuffer())
  assert.deepEqual(generatedNames, ['Agencia de prueba', 'Agencia editada después de la primera descarga'])
  assert.equal(current.pdfKey, 'historico-que-no-debe-descargarse.pdf')
  current = null
  assert.equal((await GET(new Request('https://example.com/expediente'), params)).status, 404)
  assert.equal(generatedNames.length, 2)
  authorized = false
  const previousReads = reads
  assert.equal((await GET(new Request('https://example.com/expediente'), params)).status, 401)
  assert.equal(reads, previousReads, 'Authorization happens before reading data')
})
