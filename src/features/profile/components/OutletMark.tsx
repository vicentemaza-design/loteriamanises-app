/**
 * Identificación del medio en el apartado "En los medios".
 *
 * Pinta el logotipo si la noticia lo trae, y si no el nombre como rótulo
 * tipográfico. Los dos ocupan la misma altura, así que los logotipos se
 * pueden ir añadiendo de uno en uno sin que la tarjeta se descoloque.
 *
 * Los logotipos van en src/assets/images/medios/ — ver el README de esa
 * carpeta.
 */
interface OutletMarkProps {
  outlet: string;
  logo?: string;
  /** Alto del logotipo en píxeles. El rótulo se ajusta al mismo espacio. */
  height?: number;
  /** Sobre fondo oscuro (encima de una foto) el rótulo va en blanco. */
  onDark?: boolean;
}

export function OutletMark({ outlet, logo, height = 22, onDark = false }: OutletMarkProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={outlet}
        style={{ height }}
        className="w-auto object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <span
      style={{ height, lineHeight: `${height}px` }}
      className={`inline-flex items-center text-[12px] font-black uppercase tracking-[0.12em] ${
        onDark ? 'text-white' : 'text-manises-blue'
      }`}
    >
      {outlet}
    </span>
  );
}
