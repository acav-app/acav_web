'use client'
import React from 'react';
import Link from 'next/link';

export default function VideoBtn() {
  return (
    <>
        <div className="mt-6">
            <Link href="#contact" className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-white text-slate-900 rounded-md hover:bg-slate-200 transition-all">Contáctanos</Link>
        </div>
    </>
  )
}
