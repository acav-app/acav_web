import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

import Navbar from '../components/navbar'

import Faq from '../components/faq';
import Client from '../components/client';
import Footer from '../components/footer';
import Contact from '../components/contact';
import Partner from '../components/partner';
import Download from '../components/download';
import Switcher from '../components/switcher';
import AboutTwo from '../components/about-two';
import AboutOne from '../components/about-one';
import Screenshot from '../components/screenshot';
import FeaturesTwo from '../components/features-two';
import ScrollToTop from '../components/scroll-to-top';
import TypeEffectOne from '../components/type-effect-one';

import { FiArrowRight, FiMail } from 'react-icons/fi';

export default function Page() {
  return (
    <>
    <Navbar navLight={false} playBtn={false} bgLight={false} navCenter={false}/>

    <section className="relative overflow-hidden pt-40 after:content-[''] after:absolute after:inset-0 after:mx-auto after:size-[56rem] after:bg-gradient-to-tl after:to-red-600/40  after:from-indigo-600/40 after:blur-[200px] after:rounded-full after:-z-1" id="home">
        <div className="container relative z-2">
            <div className="grid grid-cols-1 text-center">
                <div className="">
                    <TypeEffectOne/>
                    <p className="text-slate-500 dark:text-white/60 text-lg max-w-xl mx-auto">Gain valuable insights into user behavior and drive data-informed decision-making with our revolutionary platform.</p>

                    <div className="subcribe-form mt-6 mb-3">
                        <form className="relative max-w-lg mx-auto">
                            <FiMail className="size-4 absolute top-[17px] start-5 text-slate-400"/>
                            <input type="email" id="subcribe" name="email" className="form-input border-0 py-4 ps-12 pe-12 w-full h-[50px] outline-none text-black dark:text-white rounded-full bg-white dark:bg-slate-900 shadow dark:shadow-gray-800 focus:border-0 focus:ring-0" placeholder="Your Email Address :"/>
                            <button type="submit" className="size-[46px] inline-flex items-center justify-center rounded-full align-middle absolute top-[2px] end-[3px] bg-red-500 border-red-500 text-white"><FiArrowRight className="size-5"/></button>
                        </form>
                    </div>

                    <span className="text-slate-500 dark:text-white/60 font-medium">Looking for help? <Link href="" className="text-red-500">Get in touch with us</Link></span>
                </div>
                <div className="relative mt-4 lg:mx-16 z-3">
                    <Image src='/images/phone/3-phone-half.png' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} alt="" className="mover"/>
                </div>
            </div>
        </div>
    </section>

    <section className="relative md:py-24 py-16" id="features">
        <div className="container relative">
            <div className="grid grid-cols-1 pb-6 text-center">
                <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Features</h6>
                <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Discover Powerful Features</h4>

                <p className="text-slate-400 max-w-xl mx-auto">Unleash the power of our platform with a multitude of powerful features, empowering you to achieve your goals.</p>
            </div>

            <FeaturesTwo/>
        </div>

        <div className="container relative md:mt-24 mt-16">
            <AboutOne/>
        </div>

        <div className="container relative md:mt-24 mt-16">
            <AboutTwo/>
        </div>
    </section>

    <section className="relative md:py-24 py-16 bg-slate-50/50 dark:bg-slate-800/20" id="screenshot">
        <div className="container relative">
            <div className="grid grid-cols-1 pb-6 text-center">
                <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Screenshots</h6>
                <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">Simple & Beautiful Interface</h4>

                <p className="text-slate-400 max-w-xl mx-auto">Unleash the power of our platform with a multitude of powerful features, empowering you to achieve your goals.</p>
            </div>

            <Screenshot/>
        </div>
    </section>

    <section className="relative overflow-hidden md:py-24 py-16" id="faqs">
        <Faq/>
    </section>

    <section className="relative md:py-24 py-16 bg-slate-50/50 dark:bg-slate-800/20" id="download">
        <Download/>
    </section>

    <section className="relative md:py-24 py-16" id="reviews">
        <div className="container relative">
            <div className="grid grid-cols-1 pb-6 text-center">
                <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Reviews</h6>
                <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">10k+ Customers Trust Us</h4>

                <p className="text-slate-400 max-w-xl mx-auto">Unleash the power of our platform with a multitude of powerful features, empowering you to achieve your goals.</p>
            </div>
            <Client/>
        </div>
    </section>

    <section className="relative md:py-24 py-16 bg-slate-50/50 dark:bg-slate-800/20" id="contact">
        <Contact/>
    </section>

    <section className="py-6 border-t border-b border-gray-100 dark:border-gray-800">
        <div className="container relative">
            <Partner/>
        </div>
    </section>

    <Footer/>

    <ScrollToTop/>

    <Switcher/>
    
    </>
  )
}
