import React from 'react'
import Link from 'next/link'

import { FiAperture, FiShield } from 'react-icons/fi'
import { IconType } from 'react-icons'
import Image from 'next/image';

export default function AboutOne() {
    interface Data {
        icon: IconType;
        title: string;
        desc: string;
    }

   let data : Data []  = [
        {
            icon:FiShield,
            title:'Calidad Garantizada',
            desc:'30 años de experiencia avalan nuestro compromiso con la excelencia en cada obra.'
        },
        {
            icon:FiAperture,
            title:'Soluciones Integrales',
            desc:'Desde el proyecto inicial hasta la ejecución final, cubrimos todas las necesidades de construcción y climatización.'
        },
    ]
  return (
        <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-6">
            <div className="lg:col-span-5 md:col-span-6">
                <div className="pt-6 px-6 rounded-2xl bg-red-500/5 dark:bg-red-500/10 shadow shadow-red-500/20">
                    <Image src='/images/nosotros.jpg' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} alt="Obra Banco Prosegur" className="rounded-lg"/>
                </div>
            </div>

            <div className="lg:col-span-7 md:col-span-6">
                <div className="lg:ms-10">
                    <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Sobre Nosotros</h6>
                    <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Construyendo Futuro <br/> con Experiencia</h4>
                    <p className="text-slate-400 max-w-xl">En BAHICO ARGENTINA nos dedicamos a construcciones electromecánicas, mantenimiento, calefacción, climatización, plomería y aire acondicionado. Brindamos servicio en Bahía Blanca y la zona.</p>

                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
                        {data.map((item:Data,index:any)=>{
                            let Icon = item.icon
                            return(
                                <div className="group flex relative overflow-hidden p-6 rounded-md shadow dark:shadow-gray-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-red-500 dark:hover:bg-red-500 duration-500" key={index}>
                                    <span className="text-red-500 group-hover:text-white text-5xl font-semibold duration-500">
                                        <Icon className="size-8 mt-2"/>
                                    </span>
                                    <div className="flex-1 ms-3">
                                        <h5 className="group-hover:text-white text-lg font-semibold duration-500">{item.title}</h5>
                                        <p className="text-slate-400 group-hover:text-white/50 duration-500 mt-2">{item.desc}</p>
                                    </div>
                                    <div className="absolute start-1 top-5 text-slate-900/[0.02] dark:text-white/[0.03] text-8xl group-hover:text-white/[0.1] duration-500">
                                        <Icon className="size-24"/>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-6">
                        <Link href="/#contact" className="hover:text-red-500 dark:hover:text-red-500 after:bg-red-500 dark:text-white transition duration-500 font-medium">Contáctanos <i className="mdi mdi-arrow-right align-middle"></i></Link>
                    </div>
                </div>
            </div>
        </div>
  )
}
