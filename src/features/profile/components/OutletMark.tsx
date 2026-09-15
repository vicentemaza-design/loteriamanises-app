/**
 * Identificación del medio en el apartado "En los medios".
 *
 * Pinta el logotipo si la noticia lo trae, y si no el nombre como rótulo
 * tipográfico, de modo que los logotipos se pueden ir añadiendo de uno en
 * uno sin que nada se descoloque.
 *
 * El logotipo LLENA la caja que le da el contenedor, con object-contain.
 * Es deliberado: los logotipos de los medios vienen en proporciones muy
 * distintas —RTVE o Telecinco son cuadrados, El Español o la SER son
 * apaisados— y fijar solo la altura dejaba a los cuadrados diminutos al
 * lado de los otros. Dejando que cada uno se ajuste a la caja, todos
 * pesan lo mismo ópticamente.
 *
 * Los ficheros van en src/assets/images/medios/ — ver el README.
 */
interface OutletMarkProps {
  outlet: string;
  logo?: string;
  /** Tamaño del rótulo de respaldo cuando no hay logotipo. */
  fallbackSize?: number;
  /** Sobre fondo oscuro el rótulo va en blanco. */
  onDark?: boolean;
}

export function OutletMark({ outlet, logo, fallbackSize = 13, onDark = false }: OutletMarkProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={outlet}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <span
      style={{ fontSize: fallbackSize }}
      className={`text-center font-black uppercase leading-tight tracking-[0.1em] ${
        onDark ? 'text-white' : 'text-manises-blue'
      }`}
    >
      {outlet}
    </span>
  );
}
