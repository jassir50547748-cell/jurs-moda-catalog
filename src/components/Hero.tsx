import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-28">
      <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" width={1920} height={800} />
      <div className="absolute inset-0 bg-primary/70" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-accent font-medium tracking-widest uppercase text-sm mb-4"
        >
          Especialistas en Confección Mayorista
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-heading text-4xl md:text-6xl font-bold mb-4"
        >
          JURS MODA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto mb-8"
        >
          Busos, shorts, poleras, chompas y más. Envíos a toda Bolivia. Pedidos disponibles exclusivamente desde Media Docena, Docena y Volumen Empresarial.
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          href="#catalogo"
          className="inline-block bg-accent text-accent-foreground font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Ver Catálogo
        </motion.a>
      </div>
    </section>
  );
}
