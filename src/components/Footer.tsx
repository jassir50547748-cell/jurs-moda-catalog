import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-10 mt-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-xl font-bold mb-2">JURS MODA</h2>
        <p className="text-primary-foreground/60 text-sm mb-6">
          Venta al por mayor — Busos, Shorts, Poleras, Chompas y más
        </p>
        <p className="text-primary-foreground/40 text-xs">
          © {new Date().getFullYear()} JURS MODA. Todos los derechos reservados.
        </p>
        <Link
          to="/login"
          className="text-primary-foreground/20 hover:text-primary-foreground/40 text-xs mt-4 inline-block transition-colors"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
