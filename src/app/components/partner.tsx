import React from 'react'
import { companyData } from '../data/data'
import Image from 'next/image'

export default function Partner() {
  return (
        <div className="grid md:grid-cols-6 grid-cols-2 justify-center gap-[30px]">
            {companyData.map((item:any, index:number) => {
                return(
                    <div className="mx-auto py-4" key={index}>
                        <Image src={item} width={72} height={24} className="h-6" alt=""/>
                    </div>
                )
            })}
        </div>
  )
}
