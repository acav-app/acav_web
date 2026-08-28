export const siteConfig = {
  brand: {
    name: "ACAV",
    longName: "Asociación Cordobesa de Agencias de Viajes",
    tagline: "Asociación Cordobesa de Agencias de Viajes ",
  },
  seo: {
    url: "https://acav.org.ar",
    title: "ACAV - Asociación Cordobesa de Agencias de Viajes",
    description:
      "ACAV (fundada en 1963) representa, conecta y fortalece a las agencias de viajes de Córdoba mediante capacitación, networking, oportunidades comerciales y representación institucional.",
    keywords: [
      "ACAV",
      "Córdoba",
      "turismo",
      "agencias de viajes",
      "capacitaciones",
      "eventos",
      "networking",
      "empleabilidad",
      "cursos",
      "institucional",
    ],
    locale: "es_AR",
    ogImage: "/images/logo.png",
  },
  nav: {
    items: [
      { label: "Home", href: "/#home" },
      {
        label: "Institucional",
        href: "/institucional/quienes-somos",
        children: [
          { label: "Quiénes somos", href: "/institucional/quienes-somos" },
          { label: "Comisión Directiva", href: "/institucional/comision-directiva" },
          { label: "Data Fiscal", href: "/institucional/data-fiscal" },
          { label: "Aliados Estratégicos", href: "/institucional/aliados-estrategicos" },
        ],
      },
      {
        label: "Socios",
        href: "/socios",
        children: [
          { label: "Directorio de socios", href: "/socios" },
          { label: "Asociate", href: "/socios/asociate" },
        ],
      },
      {
        label: "Servicios",
        href: "/servicios/capacitaciones",
        children: [
          { label: "Capacitaciones y Cursos", href: "/servicios/capacitaciones" },
          { label: "Convenios y Beneficios", href: "/servicios/convenios-y-beneficios" },
          { label: "Proyecto | Sellos de Calidad", href: "/servicios/sellos-de-calidad" },
          { label: "Red de Empleabilidad", href: "/servicios/empleabilidad" },
        ],
      },
      {
        label: "Novedades",
        href: "/novedades/actualidad",
        children: [
          { label: "Actualidad", href: "/novedades/actualidad" },
          { label: "Redes", href: "/novedades/redes" },
          { label: "Mercado de Viajes", href: "/novedades/mercado-de-viajes" },
        ],
      },
      { label: "Contacto", href: "/contacto" },
    ] as readonly {
      label: string
      href: string
      children?: readonly { label: string; href: string }[]
    }[],
    cta: { label: "Asociate", href: "/socios/asociate" },
  },
  servicios: {
    links: [
      { label: "Capacitaciones y Cursos", href: "/servicios/capacitaciones" },
      { label: "Convenios y Beneficios", href: "/servicios/convenios-y-beneficios" },
      { label: "Proyecto | Sellos de Calidad", href: "/servicios/sellos-de-calidad" },
      { label: "Red de Empleabilidad", href: "/servicios/empleabilidad" },
    ],
  },
  novedades: {
    links: [
      { label: "Actualidad", href: "/novedades/actualidad" },
      { label: "Redes", href: "/novedades/redes" },
      { label: "Mercado de Viajes", href: "/novedades/mercado-de-viajes" },
    ],
  },
  institucional: {
    links: [
      { label: "Quiénes somos", href: "/institucional/quienes-somos" },
      { label: "Comisión Directiva", href: "/institucional/comision-directiva" },
      { label: "Data Fiscal", href: "/institucional/data-fiscal" },
      { label: "Aliados Estratégicos", href: "/institucional/aliados-estrategicos" },
    ],
    dataFiscal: {
      razonSocial: "Asociación Cordobesa de Agencias de Viajes (ACAV)",
      cuit: "30-55915252-4",
      tipoPersona: "Persona Jurídica",
      provincia: "Córdoba",
      localidad: "Ciudad de Córdoba",
      fechaContratoSocial: "25/10/1966",
      iva: "IVA Exento",
      empleador: "Sí",
      domicilioFiscal: "Obispo Trejo 180, Piso 4, Córdoba, Argentina (CP 5000)",
      // Código del QR de AFIP: https://www.afip.gob.ar/formulario-960/
      afipQrCode: null as string | null,
    },
  },
  hero: {
    eyebrow: "ACAV - Pasión por el turismo",
    headline: "Asociación Cordobesa de Agencias de Viajes ",
    subheadline: "Trabajando junto a vos, defendiendo los derechos de quienes hacemos crecer el turismo en Córdoba",
    description:
      "Representamos, conectamos y fortalecemos a las agencias de viajes de Córdoba con una agenda activa de capacitación, networking, eventos y oportunidades para el sector.",
    actions: {
      primary: { label: "Sumate a ACAV", href: "#institucional" },
      tertiary: { label: "Asociarse", href: "#asociate" },
    },
    video: {
      src: "/videos/acav-hero.mp4",
      poster: "/images/hero.png",
    },
    highlights: [
      { type: "video", title: "Workshops", src: "/videos/acav-hero.mp4", poster: "/images/hero.png" },
      { type: "image", title: "Destinos", src: "/images/servicios.jpg" },
      { type: "image", title: "Capacitaciones", src: "/images/nosotros.jpg" },
      { type: "image", title: "Networking", src: "/images/hero.png" },
    ] as
      | readonly { type: "image"; title: string; src: string }[]
      | readonly { type: "video"; title: string; src: string; poster: string }[],
    stats: [
      { value: "+60", label: "años", detail: "de trayectoria" },
      { value: "+300", label: "agencias", detail: "asociadas" },
      { value: "+100", label: "capacitaciones", detail: "al año" },
      { value: "+50", label: "alianzas", detail: "estratégicas" },
    ],
  },
  contact: {
    address: null as string | null,
    email: null as string | null,
    phone: null as string | null,
    whatsapp: null as string | null,
    social: {
      instagram: null as string | null,
      youtube: null as string | null,
      linkedin: null as string | null,
    },
    institutionalLogos: [] as { label: string; src: string; href?: string }[],
  },
  sections: {
    about: {
      title: "Sobre ACAV",
      description:
        "Desde 1963 representamos a las agencias de viajes, defendiendo sus intereses y generando herramientas, capacitaciones y beneficios exclusivos para acompañar el crecimiento del sector turístico.",
      mission:
        "Defender los intereses del sector turístico y fortalecer a las agencias de viajes de Córdoba mediante representación institucional, capacitación, networking y oportunidades comerciales.",
      vision:
        "Ser una comunidad referente del turismo en Córdoba: moderna, innovadora y cercana, con impacto real en el crecimiento profesional y comercial de sus socios.",
      pillars: [
        { title: "Representación", detail: "Defendemos los intereses del sector turístico." },
        { title: "Capacitación", detail: "Impulsamos formación continua y profesionalización." },
        { title: "Beneficios", detail: "Convenios, descuentos y herramientas exclusivas." },
        { title: "Comunidad", detail: "Networking, cercanía y experiencias reales." },
      ],
      values: [
        "Profesionalismo",
        "Confianza institucional",
        "Innovación",
        "Comunidad",
        "Prestigio",
        "Dinamismo",
        "Cercanía",
        "Turismo y experiencias",
      ],
      quickLinks: [
        { label: "Nuestra historia", href: "#historia" },
        { label: "Comisión directiva", href: "#comision" },
        { label: "Estatuto", href: "#estatuto" },
      ],
    },
    employability: {
      title: "Empleabilidad ACAV",
      description:
        "Plataforma laboral destinada a conectar agencias de viajes con profesionales del sector turístico.",
      cta: { label: "Explorar empleos", href: "#asociate" },
      metrics: [
        { value: "120+", label: "Ofertas activas" },
        { value: "850+", label: "Perfiles registrados" },
        { value: "60+", label: "Agencias contratando" },
      ],
    },
    courses: {
      title: "Cursos ACAV",
      description:
        "Campus educativo para capacitaciones, certificaciones y formación profesional.",
      cta: { label: "Ver cursos", href: "#asociate" },
      metrics: [
        { value: "35+", label: "Cursos disponibles" },
        { value: "2000+", label: "Alumnos capacitados" },
        { value: "15+", label: "Certificaciones emitidas" },
      ],
    },
    benefits: {
      title: "Beneficios para socios",
      description: "Más beneficios, más oportunidades.",
      cta: { label: "Ver todos los beneficios", href: "#asociate" },
      featured: {
        title: "Descuentos exclusivos",
        description:
          "Accedé a descuentos y convenios preferenciales en hoteles, hotelería y servicios para potenciar tu agencia y tus experiencias.",
        media: { type: "image", src: "/images/hero_horizontal.png" },
      },
      items: [
        { title: "Descuentos exclusivos", description: "Convenios y oportunidades preferenciales.", icon: "tag" },
        { title: "Capacitaciones y eventos", description: "Formación continua y agenda activa.", icon: "calendar" },
        { title: "Asesoramiento profesional", description: "Herramientas y acompañamiento.", icon: "briefcase" },
        { title: "Networking", description: "Comunidad y conexiones reales.", icon: "users" },
        { title: "Convenios y alianzas", description: "Acuerdos institucionales clave.", icon: "link" },
        { title: "Hotelería y servicios", description: "Beneficios para el ecosistema turístico.", icon: "home" },
        { title: "Workshops y experiencias", description: "Eventos inmersivos y encuentros.", icon: "spark" },
      ],
    },
    events: {
      title: "Eventos",
      description:
        "Workshops, congresos, capacitaciones, ferias y encuentros turísticos para potenciar el ecosistema de agencias.",
      types: ["Workshops", "Congresos", "Capacitaciones", "Ferias", "Encuentros"],
    },
    board: {
      title: "Comisión directiva",
      description:
        "Presidente, vicepresidente, secretaría, tesorería y vocales, con representación de agencias asociadas.",
      members: [] as { name: string; role: string; company: string; photo: string }[],
    },
    history: {
      title: "Historia ACAV",
      description: "Más de 60 años impulsando el turismo.",
      timeline: [
        { year: "1963", title: "Fundación de ACAV", detail: "Nace la institución para representar al sector en Córdoba.", media: "/images/client/01.jpg" },
        { year: "1975", title: "Crecimiento institucional", detail: "Fortalecimiento y consolidación de la comunidad.", media: "/images/client/02.jpg" },
        { year: "1995", title: "Nuevos convenios y beneficios", detail: "Alianzas estratégicas para el ecosistema turístico.", media: "/images/client/03.jpg" },
        { year: "2010", title: "Formación y capacitaciones", detail: "Capacitación constante para profesionalizar el sector.", media: "/images/client/04.jpg" },
        { year: "2020", title: "Transformación digital", detail: "Tecnología aplicada al turismo: nuevas plataformas y proyectos.", media: "/images/client/05.jpg" },
        { year: "Actualidad", title: "Comunidad en expansión", detail: "Crecimiento, networking y oportunidades para socios.", media: "/images/client/06.jpg" },
      ],
      cta: { label: "Conocer toda nuestra historia", href: "#historia" },
    },
    social: {
      title: "Redes sociales",
      description:
        "Contenido inmersivo con reels, videos, testimonios y fotos de eventos, con interacciones dinámicas.",
      links: [],
    },
    community: {
      title: "Así vive la comunidad ACAV",
      description: "Workshops, capacitaciones, testimonios y eventos. Personas y experiencias reales.",
      cta: { label: "Ver más en redes", href: "#redes" },
      items: [
        { type: "video", src: "/videos/acav-hero.mp4", poster: "/images/hero.png", label: "Workshops" },
        { type: "image", src: "/images/nosotros.jpg", label: "Capacitaciones" },
        { type: "image", src: "/images/servicios.jpg", label: "Destinos de Córdoba" },
        { type: "image", src: "/images/hero.png", label: "Networking" },
        { type: "image", src: "/images/hero.png", label: "Ferias" },
        { type: "image", src: "/images/hero_horizontal.png", label: "Experiencias" },
      ] as
        | readonly { type: "image"; src: string; label: string }[]
        | readonly { type: "video"; src: string; poster: string; label: string }[],
    },
    join: {
      title: "Sumate a nuestra comunidad y potenciá tu agencia.",
      steps: [
        {
          title: "Requisitos",
          description: "Conocé los requisitos para asociarte como agencia de viajes en Córdoba.",
        },
        {
          title: "Beneficios",
          description: "Accedé a convenios, capacitación, networking y herramientas exclusivas.",
        },
        {
          title: "Documentación",
          description: "Prepará la documentación necesaria para formalizar la solicitud.",
        },
        {
          title: "Solicitud",
          description: "Completá el formulario y recibí seguimiento del equipo ACAV.",
        },
      ],
      cta: { label: "Comenzar ahora", href: "#asociate" },
    },
  },
} as const;
