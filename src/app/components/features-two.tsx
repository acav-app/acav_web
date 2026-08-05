'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FiLayout, FiHome, FiSettings, FiSun, FiZap, FiDroplet } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import Lightbox from 'react-18-image-lightbox'
import '../../../node_modules/react-18-image-lightbox/style.css'
import Masonry from 'react-masonry-css'

const TinySlider = dynamic(()=>import('tiny-slider-react'),{ssr:false})
import '../../../node_modules/tiny-slider/dist/tiny-slider.css'

export default function FeaturesTwo() {
    const servicesLeft = [
        {
            icon: FiLayout,
            title: 'Steel Framing',
            desc: 'Construcción en seco, rápida, eficiente y sustentable para todo tipo de proyectos.'
        },
        {
            icon: FiHome,
            title: 'Construcción Tradicional',
            desc: 'Ejecución de obras civiles y comerciales con los más altos estándares de calidad.'
        },
        {
            icon: FiDroplet,
            title: 'Mantenimiento Integral y Plomería y Gas',
            desc: 'Mantenimiento preventivo/correctivo y soluciones de plomería y gas certificadas.'
        },
    ]

    const servicesRight = [
        {
            icon: FiSun,
            title: 'Climatización',
            desc: 'Instalación y mantenimiento de calderas, radiadores y sistemas de piso radiante, con provisión de materiales de climatizacion.'
        },
        {
            icon: FiZap,
            title: 'Energías Renovables',
            desc: 'Soluciones en energía solar, termotanques solares y bombas de calor.'
        },
        {
            icon: FiSettings,
            title: 'Electromecánica',
            desc: 'Instalaciones eléctricas, automatización, riego y soluciones integradas.'
        },
    ]

    const [open, setOpen] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [photoIndex, setPhotoIndex] = useState(0)
    const [selected, setSelected] = useState<null | { key: string; title: string; body: JSX.Element; images: string[] }>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px)')
        const update = () => setIsMobile(media.matches)
        update()
        media.addEventListener('change', update)
        return () => media.removeEventListener('change', update)
    }, [])

    const openService = (key: string, title: string) => {
        const details = serviceDetails[key]
        if(!details) return
        setSelected({ key, title, body: details.body, images: details.images })
        setOpen(true)
    }

    const serviceDetails: Record<string, { body: JSX.Element; images: string[] }> = useMemo(()=>({
        'Steel Framing': {
            body: (
                <div className="space-y-3">
                    <p>Construimos con sistema steel framing, una solución moderna que se destaca por su rapidez de ejecución, eficiencia energética y alto nivel de confort.</p>
                    <p>Gracias a su tecnología en seco, permite reducir significativamente los tiempos de obra sin resignar calidad ni resistencia.</p>
                    <h6 className="font-semibold mt-4">¿Por qué elegir steel framing?</h6>
                    <ul className="list-disc ps-5 text-slate-600 dark:text-slate-300">
                        <li>Obras hasta un 50% más rápidas</li>
                        <li>Excelente aislación térmica y acústica</li>
                        <li>Mayor confort interior durante todo el año</li>
                        <li>Ahorro energético en climatización</li>
                        <li>Precisión constructiva y menor desperdicio</li>
                    </ul>
                    <p className="mt-2">Es la opción ideal para quienes buscan construir mejor, más rápido y con mayor eficiencia.</p>
                </div>
            ),
            images: [
                '/images/obras/steel-framing/1.jpg',
                '/images/obras/steel-framing/2.jpg',
                '/images/obras/steel-framing/3.jpg',
                '/images/obras/steel-framing/4.jpg',
                '/images/obras/steel-framing/5.jpg',
            ]
        },
        'Construcción Tradicional': {
            body: (
                <div className="space-y-3">
                    <p>La construcción tradicional en mampostería sigue siendo un sistema sólido, confiable y ampliamente probado.</p>
                    <p>En BAHICO ARGENTINA trabajamos con ladrillos, hormigón y morteros, aplicando criterios técnicos y mano de obra calificada para lograr estructuras firmes y duraderas.</p>
                    <h6 className="font-semibold mt-4">Realizamos:</h6>
                    <ul className="list-disc ps-5 text-slate-600 dark:text-slate-300">
                        <li>Obras nuevas</li>
                        <li>Ampliaciones</li>
                        <li>Remodelaciones</li>
                        <li>Terminaciones completas</li>
                    </ul>
                    <p className="mt-2">Un sistema conocido, ejecutado con profesionalismo y control en cada detalle.</p>
                </div>
            ),
            images: [
                '/images/obras/banco-nacion/1.jpg',
                '/images/obras/banco-nacion/2.jpg',
                '/images/obras/banco-nacion/3.jpg',
                '/images/obras/banco-prosegur/1.jpg',
                '/images/obras/banco-prosegur/2.jpg',
            ]
        },
        'Climatización': {
            body: (
                <div className="space-y-3">
                    <p>Brindamos soluciones completas en climatización, desde el asesoramiento hasta la instalación y puesta en marcha.</p>
                    <p>Incluimos provisión de materiales de climatizacion.</p>
                    <p>Comercializamos e instalamos sistemas diseñados para lograr máximo confort con alta eficiencia energética.</p>
                    <h6 className="font-semibold mt-4">Trabajamos con:</h6>
                    <ul className="list-disc ps-5 text-slate-600 dark:text-slate-300">
                        <li>Calderas para agua sanitaria y calefacción</li>
                        <li>Sistemas de piso radiante</li>
                        <li>Radiadores</li>
                        <li>Bombas de calor</li>
                        <li>Separadores hidráulicos</li>
                        <li>Equipos de aire acondicionado</li>
                    </ul>
                    <p className="mt-2">Diseñamos cada sistema según el espacio y la necesidad, optimizando rendimiento y consumo.</p>
                </div>
            ),
            images: [
                '/images/obras/piso-radiante/1.jpg',
                '/images/obras/piso-radiante/2.jpg',
                '/images/obras/piso-radiante/3.jpg',
                '/images/obras/bomba-calor-piscina/1.jpg',
                '/images/obras/termotanque-solar/1.jpg',
            ]
        },
        'Energías Renovables': {
            body: (
                <div className="space-y-3">
                    <p>Desarrollamos e integramos sistemas de energía solar y tecnologías de alta eficiencia para viviendas y comercios.</p>
                    <ul className="list-disc ps-5 text-slate-600 dark:text-slate-300">
                        <li>Termotanques solares</li>
                        <li>Bombas de calor</li>
                        <li>Sistemas fotovoltaicos on-grid y off-grid</li>
                    </ul>
                </div>
            ),
            images: [
                '/images/obras/termotanque-solar/1.jpg',
                '/images/obras/termotanque-solar/2.jpg',
                '/images/obras/bomba-calor-piscina/1.jpg',
                '/images/obras/bomba-calor-piscina/2.jpg',
            ]
        },
        'Mantenimiento Integral y Plomería y Gas': {
            body: (
                <div className="space-y-3">
                    <p>Planes de mantenimiento preventivo y correctivo adaptados a viviendas, comercios e industrias, garantizando continuidad operativa.</p>
                    <h6 className="font-semibold mt-4">Plomería y Gas</h6>
                    <p>Instalaciones sanitarias completas, redes de gas autorizadas y reparaciones con materiales certificados.</p>
                </div>
            ),
            images: [
                '/images/obras/banco-prosegur/1.jpg',
                '/images/obras/banco-prosegur/2.jpg',
                '/images/obras/banco-prosegur/3.jpg',
                '/images/obras/servicio-plomeria/1.jpg',
                '/images/obras/servicio-plomeria/2.jpg',
                '/images/obras/servicio-plomeria/3.jpg',
            ]
        },
        'Electromecánica': {
            body: (
                <div className="space-y-3">
                    <p>Desarrollamos soluciones electromecánicas integrales para viviendas, comercios e industrias, combinando tecnología, automatización y eficiencia energética.</p>
                    <h6 className="font-semibold mt-4">Servicios</h6>
                    <ul className="list-disc ps-5 text-slate-600 dark:text-slate-300">
                        <li>Instalaciones eléctricas completas</li>
                        <li>Sistemas de riego automatizados</li>
                        <li>Automatización de portones</li>
                        <li>Sistemas de energía solar (fotovoltaica): on‑grid y off‑grid</li>
                    </ul>
                    <p className="mt-2">Integramos distintos sistemas para lograr funcionalidad, ahorro y control inteligente.</p>
                </div>
            ),
            images: [
                '/images/obras/banco-prosegur/1.jpg',
                '/images/obras/banco-prosegur/2.jpg',
                '/images/obras/banco-prosegur/3.jpg',
            ]
        },
    }),[])

    const sliderSettings = {
        container: '.tiny-service-gallery',
        items: 1,
        controls: true,
        controlsText: ['<i class="mdi mdi-chevron-left"></i>', '<i class="mdi mdi-chevron-right"></i>'],
        mouseDrag: true,
        loop: true,
        rewind: true,
        autoplay: true,
        autoplayButtonOutput: false,
        autoplayTimeout: 3000,
        nav: false,
        speed: 400,
        gutter: 0,
    }

  return (
    <div className="grid lg:grid-cols-12 md:grid-cols-12 grid-cols-1 mt-6 gap-6 items-center">
        <div className="lg:col-span-4 md:col-span-6 lg:order-1 order-2">
            <div className="grid grid-cols-1 gap-6">
                {servicesLeft.map((item,index)=>{
                    let Icon = item.icon
                    return(
                        <button
                            type="button"
                            onClick={()=>openService(item.title, item.title)}
                            className="group flex duration-500 xl:p-3 rounded-2xl hover:shadow-lg hover:-translate-y-1 bg-white/70 dark:bg-slate-900/70 border border-transparent hover:border-red-500/20 cursor-pointer text-left"
                            key={index}
                        >
                            <div className="flex md:order-2 order-1 align-middle justify-center items-center size-16 mt-1 bg-red-500/5 dark:bg-red-500/10 group-hover:bg-red-500 group-hover:text-white text-red-500 rounded-2xl text-2xl shadow-sm dark:shadow-gray-800 duration-500 shrink-0">
                                <Icon className="size-5"/>
                            </div>
                            <div className="flex-1 md:order-1 order-2 md:text-end md:me-4 md:ms-0 ms-4">
                                <h4 className="mb-0 text-lg font-semibold">{item.title}</h4>
                                <p className="text-slate-400 mt-3">{item.desc}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="lg:col-span-4 md:col-span-12 lg:mx-4 lg:order-2 order-1">
            <Image src='/images/servicios.jpg' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} className="mx-auto rounded-lg shadow-lg" alt="Servicios Bahico"/>
        </div>

        <div className="lg:col-span-4 md:col-span-6 order-3">
            <div className="grid grid-cols-1 gap-6">
                {servicesRight.map((item,index)=>{
                    let Icon = item.icon
                    return(
                        <button
                            type="button"
                            onClick={()=>openService(item.title, item.title)}
                            className="group flex duration-500 xl:p-3 rounded-2xl hover:shadow-lg hover:-translate-y-1 bg-white/70 dark:bg-slate-900/70 border border-transparent hover:border-red-500/20 cursor-pointer text-left"
                            key={index}
                        >
                            <div className="flex align-middle justify-center items-center size-16 mt-1 bg-red-500/5 dark:bg-red-500/10 group-hover:bg-red-500 group-hover:text-white text-red-500 rounded-2xl text-2xl shadow-sm dark:shadow-gray-800 duration-500 shrink-0">
                                <Icon className="size-5"/>
                            </div>
                            <div className="flex-1 ms-4">
                                <h4 className="mb-0 text-lg font-semibold">{item.title}</h4>
                                <p className="text-slate-400 mt-3">{item.desc}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        <Modal
            open={open}
            onClose={()=>setOpen(false)}
            center
            closeIcon={<i className="mdi mdi-close text-[18px]"></i>}
            classNames={{
                modal: 'service-modal rounded-2xl p-0 overflow-hidden',
                closeButton: 'size-9 p-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/40'
            }}
        >
            {selected && (
                <div className="bg-white dark:bg-slate-900">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="text-xl font-bold">{selected.title}</h4>
                        <p className="text-slate-500 mt-1">Detalles del servicio</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>{selected.body}</div>
                        <div>
                            <h6 className="font-semibold mb-3">Galería</h6>
                            {isMobile ? (
                                <div className="relative">
                                    <div className="tiny-service-gallery">
                                        <TinySlider settings={sliderSettings}>
                                            {selected.images.map((img, i)=>(
                                                <div className="px-0" key={i}>
                                                    <div className="overflow-hidden rounded-xl">
                                                        <Image
                                                            src={img}
                                                            width={0}
                                                            height={0}
                                                            sizes="100vw"
                                                            style={{width:'100%', height:'min(62vh, 460px)', objectFit:'cover'}}
                                                            alt={`${selected.title} ${i+1}`}
                                                            onClick={()=>{ setPhotoIndex(i); setLightboxOpen(true) }}
                                                            className="cursor-zoom-in"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </TinySlider>
                                    </div>
                                </div>
                            ) : (
                                <Masonry
                                    breakpointCols={{ default: 3, 1024: 3, 768: 2, 520: 1 }}
                                    className="flex gap-4"
                                    columnClassName="space-y-4"
                                >
                                    {selected.images.map((img, i)=>(
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={()=>{ setPhotoIndex(i); setLightboxOpen(true) }}
                                            className="group block w-full overflow-hidden rounded-xl shadow hover:shadow-xl transition-all bg-white/60 dark:bg-slate-900/60 border border-transparent hover:border-red-500/20"
                                        >
                                            <Image
                                                src={img}
                                                width={0}
                                                height={0}
                                                sizes="(max-width: 520px) 100vw, (max-width: 768px) 50vw, 33vw"
                                                style={{width:'100%', height:'auto'}}
                                                alt={`${selected.title} ${i+1}`}
                                                className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        </button>
                                    ))}
                                </Masonry>
                            )}
                            <p className="text-xs text-slate-400 mt-2">Click en una imagen para hacer zoom</p>
                        </div>
                    </div>
                </div>
            )}
        </Modal>

        {lightboxOpen && selected && (
            <Lightbox
                mainSrc={selected.images[photoIndex]}
                nextSrc={selected.images[(photoIndex + 1) % selected.images.length]}
                prevSrc={selected.images[(photoIndex + selected.images.length - 1) % selected.images.length]}
                onCloseRequest={()=>setLightboxOpen(false)}
                onMovePrevRequest={()=>setPhotoIndex((photoIndex + selected.images.length - 1) % selected.images.length)}
                onMoveNextRequest={()=>setPhotoIndex((photoIndex + 1) % selected.images.length)}
            />
        )}
    </div>
  )
}
