import { cn } from '@/shared/lib/utils';
import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';

// Same zones as NationalTicketVisual — percentages of container size
const THUMB_CONFIG: Record<string, {
  image: string;
  numberBox: { top: string; left: string; width: string; height: string };
}> = {
  jueves: {
    image: juevesTicket,
    numberBox: { top: '11%', left: '32%', width: '38%', height: '14%' },
  },
  sabado: {
    image: sabadoTicket,
    numberBox: { top: '8%', left: '30%', width: '38%', height: '14%' },
  },
};

interface NationalTicketThumbnailProps {
  /** 'jueves' | 'sabado' | 'especial' | any future drawId */
  drawId: string;
  number: string;
  /** Not rendered at thumbnail scale but prop kept for API consistency */
  serie?: string;
  fraccion?: string;
  className?: string;
}

export function NationalTicketThumbnail({
  drawId,
  number,
  className,
}: NationalTicketThumbnailProps) {
  const config = THUMB_CONFIG[drawId];

  // Fallback: special or unknown draw types — plain pill with number
  if (!config) {
    return (
      <div className={cn(
        'aspect-[1.8/1] shrink-0 overflow-hidden rounded-md bg-slate-100 flex items-center justify-center border border-slate-200',
        className
      )}>
        <span
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 'clamp(5px, 1.5vw, 8px)',
            fontWeight: 900,
            letterSpacing: '0.1em',
            color: '#334155',
            whiteSpace: 'nowrap',
          }}
        >
          {number}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative aspect-[1.8/1] shrink-0 overflow-hidden rounded-md',
      className
    )}>
      {/* Base image */}
      <img
        src={config.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Number overlay — same bounding-box model as the full visual */}
      <div
        className="absolute z-10 overflow-hidden flex items-center justify-center"
        style={{
          top: config.numberBox.top,
          left: config.numberBox.left,
          width: config.numberBox.width,
          height: config.numberBox.height,
        }}
      >
        <span
          style={{
            fontSize: 'clamp(6px, 2vw, 10px)',
            fontWeight: 900,
            fontFamily: '"Courier New", Courier, monospace',
            letterSpacing: '0.15em',
            lineHeight: 1,
            color: '#111827',
            whiteSpace: 'nowrap',
          }}
        >
          {number}
        </span>
      </div>
    </div>
  );
}
