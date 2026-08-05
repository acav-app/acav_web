'use client'
import React, { useState } from 'react';
import { FiChevronUp, FiHelpCircle } from 'react-icons/fi';
import Image from 'next/image';

export default function Faq() {
    let [ activeTab, setActiveTab ] = useState<number>(1)

    const faqData = [
        {
            id: 1,
            title: '¿Realizan presupuestos sin cargo?',
            desc: 'Sí, realizamos visitas técnicas y presupuestos personalizados sin costo en Bahía Blanca. Para otras zonas, consúltenos.'
        },
        {
            id: 2,
            title: '¿Qué tipo de trabajos realizan?',
            desc: 'Nos especializamos en construcciones electromecánicas, mantenimiento integral, calefacción (calderas, radiadores, piso radiante), climatización, plomería, aire acondicionado, Steel Framing y construcción tradicional.'
        },
        {
            id: 3,
            title: '¿Trabajan en zonas aledañas a Bahía Blanca?',
            desc: 'Sí, nuestra base operativa está en Bahía Blanca pero cubrimos toda la zona de influencia. Contáctenos para confirmar disponibilidad en su localidad.'
        },
        {
            id: 4,
            title: '¿Hacen mantenimiento a empresas?',
            desc: 'Sí, ofrecemos servicios de mantenimiento preventivo y correctivo para empresas, comercios e instituciones, asegurando el correcto funcionamiento de sus instalaciones.'
        },
        {
            id: 5,
            title: '¿Instalan sistemas de energía renovable?',
            desc: 'Sí, somos expertos en energías renovables. Instalamos termotanques solares, bombas de calor y paneles solares para optimizar el consumo energético de su hogar o empresa.'
        }
    ]

  return (
        <div className="container relative">
            <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-[30px]">
                <div className="relative order-1 md:order-2">
                    <div className="relative">
                        <Image src='/images/cta.jpg' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} className="mx-auto md:max-w-xs lg:max-w-sm rounded-lg shadow-lg" alt="Preguntas Frecuentes Bahico"/>
                    </div>
                    <div className="overflow-hidden absolute md:size-[500px] size-[400px] bg-gradient-to-tr to-red-500/20 via-red-500/70 from-red-500 bottom-1/2 translate-y-1/2 md:end-0 end-1/2 md:translate-x-0 translate-x-1/2 -z-1 shadow-md shadow-red-500/10 rounded-full"></div>

                    <div className="absolute bottom-28 md:start-0 -start-5 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 w-52 m-3">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center size-[65px] bg-red-500/5 text-red-500 text-center rounded-full me-3">
                                <FiHelpCircle className="size-6"/>
                            </div>
                            <div className="flex-1">
                                <h6 className="text-slate-400">¿Dudas?</h6>
                                <p className="text-xl font-bold">Consúltenos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:me-8 order-2 md:order-1">
                    <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">FAQs</h6>
                    <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Preguntas Frecuentes</h4>
                    <p className="text-slate-400 max-w-xl mx-auto">Resolvemos las dudas más comunes sobre nuestros servicios de construcción y climatización.</p>
                    
                    <div id="accordion-collapseone" className="mt-8">
                        {faqData.map(( item, index ) => {
                            return(
                                <div className={`relative shadow dark:shadow-gray-800 rounded-md overflow-hidden ${item.id !== 1 ?'mt-3' : ''}`} key={index}>
                                    <h2 className="font-semibold">
                                        <button type="button" onClick={() =>setActiveTab(item.id)} className={`flex justify-between items-center p-5 w-full font-medium text-start ${activeTab === item.id ? 'bg-slate-50/50 dark:bg-slate-800/20 text-red-500' : ''}`}>
                                            <span>{item.title}</span>
                                            <FiChevronUp className={`size-4 shrink-0 ${activeTab === item.id ? '' : 'rotate-180'}`}/>
                                        </button>
                                    </h2>
                                    <div className={`${activeTab === item.id ? '' : 'hidden' }`}>
                                        <div className="p-5">
                                            <p className="text-slate-400 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
  )
}
