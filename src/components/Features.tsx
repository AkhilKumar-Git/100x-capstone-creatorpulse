"use client";

import { BentoGridDemo } from '@/components/ui/bento-grid-demo'
import { motion } from 'framer-motion'

export function Features() {
  return (
    <section id="features" className="pb-16 md:pb-20 bg-neutral-900 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <BentoGridDemo />
      </motion.div>
    </section>
  )
}