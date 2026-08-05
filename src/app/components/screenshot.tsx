'use client'
import React, { useState } from 'react'
import Lightbox from 'react-18-image-lightbox';
import '../../../node_modules/react-18-image-lightbox/style.css';
import Image from 'next/image';

type Project = {
    id: string;
    category: string;
    title: string;
    description: string;
    image: string;
    gallery: string[];
}

const projects: Project[] = [
    {
        id: 'banco-nacion',
        category: 'construccion',
        title: 'Banco Nación',
        description: 'Construcción integral desde cero. Obra civil completa.',
        image: '/images/obras/banco-nacion/1.jpg',
        gallery: [
            '/images/obras/banco-nacion/1.jpg',
            '/images/obras/banco-nacion/2.jpg',
            '/images/obras/banco-nacion/3.jpg',
            '/images/obras/banco-nacion/4.jpg',
            '/images/obras/banco-nacion/5.jpg',
            '/images/obras/banco-nacion/6.jpg',
        ]
    },
    {
        id: 'banco-prosegur',
        category: 'mantenimiento',
        title: 'Banco Prosegur',
        description: 'Mantenimiento de techos y pintura completa de sucursal.',
        image: '/images/obras/banco-prosegur/1.jpg',
        gallery: [
            '/images/obras/banco-prosegur/1.jpg',
            '/images/obras/banco-prosegur/2.jpg',
            '/images/obras/banco-prosegur/3.jpg',
            '/images/obras/banco-prosegur/4.jpg',
            '/images/obras/banco-prosegur/5.jpg',
        ]
    },
    {
        id: 'steel-framing',
        category: 'construccion',
        title: 'Steel Framing',
        description: 'Construcción en seco, rápida y eficiente.',
        image: '/images/obras/steel-framing/1.jpg',
        gallery: [
            '/images/obras/steel-framing/1.jpg',
            '/images/obras/steel-framing/2.jpg',
            '/images/obras/steel-framing/3.jpg',
            '/images/obras/steel-framing/4.jpg',
            '/images/obras/steel-framing/5.jpg',
        ]
    },
    {
        id: 'bomba-calor',
        category: 'climatizacion',
        title: 'Bomba de Calor',
        description: 'Instalación de sistema de climatización para piscina.',
        image: '/images/obras/bomba-calor-piscina/1.jpg',
        gallery: [
            '/images/obras/bomba-calor-piscina/1.jpg',
            '/images/obras/bomba-calor-piscina/2.jpg',
            '/images/obras/bomba-calor-piscina/3.jpg',
        ]
    },
    {
        id: 'piso-radiante',
        category: 'climatizacion',
        title: 'Piso Radiante',
        description: 'Sistema de calefacción eficiente y confortable.',
        image: '/images/obras/piso-radiante/1.jpg',
        gallery: [
            '/images/obras/piso-radiante/1.jpg',
            '/images/obras/piso-radiante/2.jpg',
            '/images/obras/piso-radiante/3.jpg',
            '/images/obras/piso-radiante/4.jpg',
            '/images/obras/piso-radiante/5.jpg',
            '/images/obras/piso-radiante/6.jpg',
            '/images/obras/piso-radiante/7.jpg',
            '/images/obras/piso-radiante/8.jpg',
            '/images/obras/piso-radiante/9.jpg',
            '/images/obras/piso-radiante/10.jpg',
            '/images/obras/piso-radiante/11.jpg',
            '/images/obras/piso-radiante/12.jpg',
        ]
    },
    {
        id: 'termotanque-solar',
        category: 'climatizacion',
        title: 'Termotanque Solar',
        description: 'Solución sustentable para agua caliente sanitaria.',
        image: '/images/obras/termotanque-solar/1.jpg',
        gallery: [
            '/images/obras/termotanque-solar/1.jpg',
            '/images/obras/termotanque-solar/2.jpg',
        ]
    },
    {
        id: 'plomeria',
        category: 'servicios',
        title: 'Servicio de Plomería',
        description: 'Instalaciones sanitarias y reparaciones generales.',
        image: '/images/obras/servicio-plomeria/1.jpg',
        gallery: [
            '/images/obras/servicio-plomeria/1.jpg',
            '/images/obras/servicio-plomeria/2.jpg',
            '/images/obras/servicio-plomeria/3.jpg',
        ]
    }
]

export default function Screenshot() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [currentGallery, setCurrentGallery] = useState<string[]>([]);
    const [photoIndex, setPhotoIndex] = useState<number>(0);

    const filteredProjects = selectedCategory === 'all' 
        ? projects 
        : projects.filter(project => project.category === selectedCategory);

    const openGallery = (gallery: string[]) => {
        setCurrentGallery(gallery);
        setPhotoIndex(0);
        setLightboxOpen(true);
    };

    return (
        <section className="relative md:py-24 py-16 bg-gray-50 dark:bg-slate-800" id="screenshot">
            <div className="container relative">


                <div className="grid grid-cols-1 justify-center text-center mb-8">
                    <ul className="list-none mb-0 inline-block bg-white dark:bg-slate-900 shadow-md rounded-full p-2">
                        <li className="inline-block mx-1">
                            <button 
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${selectedCategory === 'all' ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                            >
                                Todas
                            </button>
                        </li>
                        <li className="inline-block mx-1">
                            <button 
                                onClick={() => setSelectedCategory('construccion')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${selectedCategory === 'construccion' ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                            >
                                Construcción
                            </button>
                        </li>
                        <li className="inline-block mx-1">
                            <button 
                                onClick={() => setSelectedCategory('climatizacion')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${selectedCategory === 'climatizacion' ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                            >
                                Climatización
                            </button>
                        </li>
                        <li className="inline-block mx-1">
                            <button 
                                onClick={() => setSelectedCategory('mantenimiento')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${selectedCategory === 'mantenimiento' ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                            >
                                Mantenimiento
                            </button>
                        </li>
                         <li className="inline-block mx-1">
                            <button 
                                onClick={() => setSelectedCategory('servicios')}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-500 ${selectedCategory === 'servicios' ? 'bg-red-500 text-white' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                            >
                                Servicios
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-4 grid-cols-1 gap-6">
                    {filteredProjects.map((project, index) => (
                        <div key={index} className="group relative block overflow-hidden rounded-xl duration-500 hover:shadow-xl hover:-translate-y-2 bg-white dark:bg-slate-900 shadow-md">
                            <div className="relative overflow-hidden">
                                <Image 
                                    src={project.image} 
                                    width={0} 
                                    height={0} 
                                    sizes='100vw' 
                                    style={{width:'100%', height:'250px', objectFit: 'cover'}} 
                                    alt={project.title} 
                                    className="group-hover:scale-110 duration-500"
                                />
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 duration-500 flex items-center justify-center">
                                    <button 
                                        onClick={() => openGallery(project.gallery)}
                                        className="size-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                                    >
                                        <i className="mdi mdi-camera-plus text-xl"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <h5 className="text-lg font-bold hover:text-red-500 duration-500 mb-2 block">{project.title}</h5>
                                <p className="text-slate-400 mb-4 text-sm">{project.description}</p>
                                <button 
                                    onClick={() => openGallery(project.gallery)}
                                    className="text-red-500 hover:text-red-600 font-medium text-sm inline-flex items-center"
                                >
                                    Ver Galería <i className="mdi mdi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {lightboxOpen && (
                    <Lightbox
                        mainSrc={currentGallery[photoIndex]}
                        nextSrc={currentGallery[(photoIndex + 1) % currentGallery.length]}
                        prevSrc={currentGallery[(photoIndex + currentGallery.length - 1) % currentGallery.length]}
                        onCloseRequest={() => setLightboxOpen(false)}
                        onMovePrevRequest={() =>
                            setPhotoIndex((photoIndex + currentGallery.length - 1) % currentGallery.length)
                        }
                        onMoveNextRequest={() =>
                            setPhotoIndex((photoIndex + 1) % currentGallery.length)
                        }
                    />
                )}
            </div>
        </section>
    )
}
