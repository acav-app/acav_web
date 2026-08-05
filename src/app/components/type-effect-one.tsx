'use client'
import React from 'react'

import { TypeAnimation } from 'react-type-animation';

export default function TypeEffectOne() {
  return (
    <h4 className="lg:leading-normal leading-normal text-4xl lg:text-[54px] mb-5">Awesome Mobile App for Your <br/> 
        <TypeAnimation
            sequence={[
                // Same substring at the start will only be typed out once, initially
                'Business',
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                'Modern Lifestyle',
                1000,
                'Social Media',
                1000,
            ]}
            wrapper="span"
            speed={20}
            repeat={Infinity}
            className="typewrite font-bold"
            cursor={false}
            />
        </h4>
  )
}
