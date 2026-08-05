import React from 'react'

import Link from 'next/link'
import Image from 'next/image'

export default function AboutTwo() {
  return (
        <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-6">
            <div className="lg:col-span-5 md:col-span-6 md:order-2 order-1">
                <div className="pt-6 px-6 rounded-2xl bg-red-500/5 dark:bg-red-500/10 shadow shadow-red-500/20">
                    <Image src='/images/climatizacion.webp' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} alt="Climatización" className="rounded-lg"/>
                </div>
            </div>

            <div className="lg:col-span-7 md:col-span-6 md:order-1 order-2">
                <div className="lg:me-10">
                    <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Eficiencia Energética</h6>
                    <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Tecnología en <br/> Climatización</h4>
                    <p className="text-slate-400 max-w-xl">Ofrecemos sistemas modernos y eficientes para el confort de tu hogar o empresa, con enfoque en el ahorro energético.</p>

                    <ul className="list-none text-slate-400 mt-6">
                        <li className="mb-1 flex"><i className="mdi mdi-check text-red-500 text-xl me-2"></i> Instalación de Calderas y Radiadores</li>
                        <li className="mb-1 flex ms-0"><i className="mdi mdi-check text-red-500 text-xl me-2"></i> Sistemas de Piso Radiante</li>
                        <li className="mb-1 flex ms-0"><i className="mdi mdi-check text-red-500 text-xl me-2"></i> Energía Solar y Bombas de Calor</li>
                    </ul>

                    <div className="mt-6">
                        <Link href="/#contact" className="hover:text-red-500 dark:hover:text-red-500 after:bg-red-500 dark:text-white transition duration-500 font-medium">Solicitar Presupuesto <i className="mdi mdi-arrow-right align-middle"></i></Link>
                    </div>
                </div>
            </div>
        </div>
  )
}
