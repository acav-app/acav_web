import Image from 'next/image'
import React from 'react'
import { FiPhone, FiClock, FiMapPin, FiInstagram } from 'react-icons/fi'


export default function Contact() {
  return (
        <div className="container relative">
            <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-[30px]">
                <div className="lg:col-span-7 md:col-span-6">
                    <Image src='/images/contact.svg' width={0} height={0} sizes='100vw' style={{width:'100%', height:'auto'}} alt=""/>
                    
                    <div className="mt-8">
                        <div className="flex items-center mb-4">
                            <div className="flex align-middle justify-center items-center size-10 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded-lg text-xl shadow-sm dark:shadow-gray-800 me-4">
                                <FiPhone className="size-5"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-0">Teléfono / WhatsApp</h5>
                                <a href="tel:+5492915720657" className="text-slate-400">2915720657</a>
                            </div>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex align-middle justify-center items-center size-10 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded-lg text-xl shadow-sm dark:shadow-gray-800 me-4">
                                <FiPhone className="size-5"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-0">Teléfono / WhatsApp (Climatización)</h5>
                                <a href="tel:+5492914040943" className="text-slate-400">2914-04-0943</a>
                                <div className="mt-1">
                                    <a href="https://www.instagram.com/ilclimatizacion" target="_blank" className="text-slate-400">@ilclimatizacion</a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex align-middle justify-center items-center size-10 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded-lg text-xl shadow-sm dark:shadow-gray-800 me-4">
                                <FiClock className="size-5"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-0">Horarios de Atención</h5>
                                <p className="text-slate-400 mb-0">Lunes a Viernes: 8:00 a 19:00</p>
                            </div>
                        </div>

                        <div className="flex items-center mb-4">
                            <div className="flex align-middle justify-center items-center size-10 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded-lg text-xl shadow-sm dark:shadow-gray-800 me-4">
                                <FiMapPin className="size-5"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-0">Ubicación</h5>
                                <p className="text-slate-400 mb-0">Bahía Blanca, Buenos Aires, Argentina</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="flex align-middle justify-center items-center size-10 bg-red-500/5 dark:bg-red-500/10 text-red-500 rounded-lg text-xl shadow-sm dark:shadow-gray-800 me-4">
                                <FiInstagram className="size-5"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-0">Instagram</h5>
                                <a href="https://www.instagram.com/bahicoarg" target="_blank" className="text-slate-400">@bahicoarg</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 md:col-span-6">
                    <div className="lg:ms-5">
                        <div className="bg-white dark:bg-slate-900 rounded-md shadow dark:shadow-gray-800 p-6">
                            <h6 className="text-red-500 uppercase text-sm font-bold tracking-wider mb-3">Contacto</h6>
                            <h4 className="mb-6 md:text-3xl text-2xl md:leading-normal leading-normal font-bold">¡Hablemos de tu proyecto!</h4>

                            <form>
                                <div className="grid lg:grid-cols-12 gap-3">
                                    <div className="lg:col-span-6">
                                        <div className="text-start">
                                            <label htmlFor="name" className="font-medium">Nombre:</label>
                                            <input name="name" id="name" type="text" className="form-input mt-1 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 focus:border-red-500 dark:border-gray-800 dark:focus:border-red-500 focus:ring-0" placeholder="Nombre :"/>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6">
                                        <div className="text-start">
                                            <label htmlFor="email" className="font-medium">Email:</label>
                                            <input name="email" id="email" type="email" className="form-input mt-1 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 focus:border-red-500 dark:border-gray-800 dark:focus:border-red-500 focus:ring-0" placeholder="Email :"/>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-12">
                                        <div className="text-start">
                                            <label htmlFor="subject" className="font-medium">Asunto:</label>
                                            <input name="subject" id="subject" className="form-input mt-1 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 focus:border-red-500 dark:border-gray-800 dark:focus:border-red-500 focus:ring-0" placeholder="Asunto :"/>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-12">
                                        <div className="text-start">
                                            <label htmlFor="comments" className="font-medium">Mensaje:</label>
                                            <textarea name="comments" id="comments" className="form-input mt-1 w-full py-2 px-3 h-28 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 focus:border-red-500 dark:border-gray-800 dark:focus:border-red-500 focus:ring-0" placeholder="Mensaje :"></textarea>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-12">
                                        <button type="submit" id="submit" name="send" className="py-2 px-5 tracking-wider inline-flex items-center justify-center font-medium rounded bg-red-500 text-white">Enviar Mensaje</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}
