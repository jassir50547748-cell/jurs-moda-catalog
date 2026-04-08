import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-28">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(35 80% 55% / 0.3), transparent 50%), radial-gradient(circle at 80% 50%, hsl(35 80% 55% / 0.15), transparent 50%)"
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-accent font-medium tracking-widest uppercase text-sm mb-4"
        >
          Venta al por mayor
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
          className="text-primary-foreground/70 text-lg md:text-xl max-w-xl mx-auto mb-8"
        >
          Shorts, polos, chompas y más. Pedidos por docena, media docena y cuarta.
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
