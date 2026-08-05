import React from 'react'
import Link from 'next/link'

import { FiPhone, FiCheckCircle } from 'react-icons/fi'
import Image from 'next/image'

export default function Download() {
  return (
        <div className="container relative">
            <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-6">
                <div className="lg:col-span-5 md:col-span-6">
                    <div className="pt-6 px-6 rounded-2xl bg-red-500/5 dark:bg-red-500/10 shadow shadow-red-500/20">
                        <Image src='/images/bahico.jpg' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} className="rounded-lg" alt="Solicitar Presupuesto"/>
                    </div>
                </div>

                <div className="lg:col-span-7 md:col-span-6">
                    <div className="lg:ms-10">
                        <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Presupuestos</h6>
                        <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Comienza tu proyecto <br/> con nosotros</h4>
                        <p className="text-slate-400 max-w-xl mb-0">Contactanos hoy mismo para recibir asesoramiento personalizado y un presupuesto a medida para tu obra o instalación.</p>
                        
                        <div className="my-6">
                            <Link href="https://wa.me/5492915720657" target="_blank" className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white rounded-md me-2 mt-2"><i className="mdi mdi-whatsapp me-1"></i> WhatsApp</Link>
                            <Link href="mailto:info@bahico.com.ar" className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-transparent hover:bg-red-500 border-red-500 text-red-500 hover:text-white rounded-md mt-2"><i className="mdi mdi-email me-1"></i> Email</Link>
                        </div>

                        <div className="inline-block">
                            <div className="pt-4 flex items-center border-t border-gray-100 dark:border-gray-800">
                                <FiCheckCircle className="me-2 text-red-500 size-10"/>
                                <div className="content">
                                    <h6 className="text-base font-medium">Asesoramiento Profesional</h6>
                                    <p className="text-slate-400 text-sm mb-0">Te guiamos en cada etapa de tu proyecto.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}
