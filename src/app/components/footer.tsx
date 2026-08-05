import Link from 'next/link'
import React from 'react'
import LogoSvg from './logo-svg';

import { FiInstagram, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
        <footer className="py-8 bg-slate-800 dark:bg-gray-900">
            <div className="container">
                <div className="grid md:grid-cols-12 items-center">
                    <div className="md:col-span-3">
                        <Link href="#" className="logo-footer">
                            <LogoSvg className="h-10 w-auto text-white"/>
                        </Link>
                    </div>

                    <div className="md:col-span-5 md:mt-0 mt-8">
                        <div className="text-center">
                            <p className="text-gray-400">© {new Date().getFullYear()} Bahico Argentina. Todos los derechos reservados.</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Desarrollado por <Link href="https://tucsdigital.com" target="_blank" className="text-slate-300 hover:text-white transition-all">Tucs Digital</Link> • <Link href="https://instagram.com/tucsdigital" target="_blank" className="text-slate-300 hover:text-white transition-all">@tucsdigital</Link>
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-4 md:mt-0 mt-8">
                        <ul className="list-none foot-icon ltr:md:text-right rtl:md:text-left text-center">
                            <li className="inline"><Link href="https://www.instagram.com/bahicoarg" target="_blank" className="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-700 hover:border-red-500 rounded-md text-slate-300 hover:text-white hover:bg-red-500"><FiInstagram className="h-4 w-4 align-middle" title="Instagram"/></Link></li>
                            <li className="inline"><Link href="mailto:info@bahico.com.ar" className="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-700 hover:border-red-500 rounded-md text-slate-300 hover:text-white hover:bg-red-500"><FiMail className="h-4 w-4 align-middle" title="Email"/></Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
  )
}
