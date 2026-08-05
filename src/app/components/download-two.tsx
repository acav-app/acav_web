import React from 'react'
import Link from 'next/link'

import { FiSmartphone } from 'react-icons/fi'

import ReactWOW from 'react-wow'
import 'animate.css';
import Image from 'next/image';

export default function DownloadTwo() {
  return (
        <div className="container relative">
            <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-6">
                <div className="lg:col-span-5 md:col-span-6">
                    <div className="pt-6 px-6 rounded-2xl bg-red-500/5 dark:bg-red-500/10 shadow shadow-red-500/20">
                    <ReactWOW animation='zoomIn'>
                        <Image src='/images/phone/half-3.png' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} className="wow animate__animated animate__zoomIn" alt="" data-wow-delay=".7s"/>
                    </ReactWOW>
                    </div>
                </div>

                <div className="lg:col-span-7 md:col-span-6">
                    <div className="lg:ms-10">
                        <ReactWOW animation='fadeInUp'>
                            <div className="wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                                <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Mobile Apps</h6>
                                <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Available for your <br/> Smartphones</h4>
                                <p className="text-slate-400 max-w-xl mb-0">Unleash the power of our platform with a multitude of powerful features, empowering you to achieve your goals.</p>
                            </div>
                        </ReactWOW>
                        <div className="my-6">
                            <ReactWOW animation='fadeInUp'>
                                <Link href="#"><Image src='/images/app.png' width={152} height={152} className="h-12 inline-block m-1 wow animate__animated animate__fadeInUp" alt="" data-wow-delay=".3s"/></Link>
                            </ReactWOW>
                            <ReactWOW animation='fadeInUp'>
                                <Link href="#"><Image src='/images/play.png' width={152} height={152} className="h-12 inline-block m-1 wow animate__animated animate__fadeInUp" alt="" data-wow-delay=".5s"/></Link>
                            </ReactWOW>
                        </div>
                        <ReactWOW animation='fadeInUp'>
                            <div className="inline-block wow animate__animated animate__fadeInUp" data-wow-delay=".7s">
                                <div className="pt-4 flex items-center border-t border-gray-100 dark:border-gray-800">
                                    <FiSmartphone className="me-2 text-red-500 size-10"/>
                                    <div className="content">
                                        <h6 className="text-base font-medium">Install app now on your cellphones</h6>
                                        <Link href="#" className="hover:text-red-500 dark:hover:text-red-500 after:bg-red-500 dark:text-white transition duration-500 font-medium">Install Now <i className="mdi mdi-arrow-right"></i></Link> 
                                    </div>
                                </div>
                            </div>
                        </ReactWOW>
                    </div>
                </div>
            </div>
        </div>
  )
}
