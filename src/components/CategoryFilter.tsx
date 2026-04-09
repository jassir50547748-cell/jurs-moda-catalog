import { motion } from "framer-motion";

const categories = [
  { value: "all", label: "Todos" },
  { value: "busos", label: "Busos" },
  { value: "shorts", label: "Shorts" },
  { value: "poleras", label: "Poleras" },
  { value: "chompas", label: "Chompas" },
  { value: "polos", label: "Polos" },
  { value: "otros", label: "Otros" },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <motion.button
          key={cat.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.value)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selected === cat.value
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-foreground hover:bg-secondary border border-border"
          }`}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}
