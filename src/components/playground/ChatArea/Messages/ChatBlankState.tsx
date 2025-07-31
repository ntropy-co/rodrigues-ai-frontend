'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import React from 'react'

const EXTERNAL_LINKS = {
  website: 'https://www.ubyfol.com',
  contact: 'https://www.ubyfol.com/contato'
}

interface ActionButtonProps {
  href: string
  variant?: 'primary'
  text: string
}

const ActionButton = ({ href, variant, text }: ActionButtonProps) => {
  const baseStyles =
    'px-4 py-2 text-sm transition-colors font-dmmono tracking-tight'
  const variantStyles = {
    primary: 'border border-border hover:bg-neutral-800 rounded-xl'
  }

  return (
    <Link
      href={href}
      target="_blank"
      className={`${baseStyles} ${variant ? variantStyles[variant] : ''}`}
    >
      {text}
    </Link>
  )
}

const ChatBlankState = () => {
  return (
    <section
      className="flex flex-col items-center text-center font-geist"
      aria-label="Welcome message"
    >
      <div className="flex max-w-4xl flex-col gap-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-y-6"
        >
          <h1 className="text-5xl font-[700] tracking-tight text-primary">
            Bem-vindo ao <span className="text-green-600">Dr. Ubyfol</span>
          </h1>
          
          <div className="text-xl text-muted-foreground leading-relaxed">
            <p className="mb-4">
              Seu especialista em <strong>nutrição foliar</strong> está aqui para ajudar.
            </p>
            
            <div className="text-lg text-left max-w-3xl mx-auto space-y-4">
              <p>
                A <strong className="text-green-600">Ubyfol</strong> é uma multinacional brasileira que, desde <strong>1985</strong>, 
                desenvolve produtos especiais para nutrição vegetal. Somos líderes em:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Macro e micronutrientes para recobrimento de grânulos</li>
                <li>Tratamento de sementes, mudas e toletes</li>
                <li>Aplicações foliares para todas as culturas agrícolas</li>
                <li>Condicionador de solos e fertilizantes foliares</li>
                <li>Adjuvantes e condicionadores de caldas</li>
              </ul>
              
              <p className="text-center italic text-sm mt-6">
                &ldquo;Eleitos a melhor empresa de nutrição vegetal do Brasil por diversas instituições independentes&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          <ActionButton
            href={EXTERNAL_LINKS.website}
            variant="primary"
            text="VISITE NOSSO SITE"
          />
          <ActionButton
            href={EXTERNAL_LINKS.contact}
            text="ENTRE EM CONTATO"
          />
        </motion.div>
      </div>
    </section>
  )
}

export default ChatBlankState
