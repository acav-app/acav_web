'use client'
import React from 'react'
import { companyData } from '../data/data'

import ReactWOW from 'react-wow'
import 'animate.css';
import Image from 'next/image';

export default function PartnerTwo() {
  return (
        <div className="grid md:grid-cols-6 grid-cols-2 justify-center gap-[30px]">
            {companyData.map((item:any, index:number) => {
                return(
                    <div className="mx-auto py-4" key={index}>
                        <ReactWOW animation='fadeInUp'>
                            <Image src={item} width={72} height={24} className="h-6 wow animate__animated animate__fadeInUp" alt="" data-wow-delay=".1s"/>
                        </ReactWOW>
                    </div>
                )
            })}
        </div>
        
  )
}
