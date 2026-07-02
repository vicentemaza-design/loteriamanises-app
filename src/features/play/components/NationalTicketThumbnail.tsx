import { cn } from '@/shared/lib/utils';
import juevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import sabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';
import navidadTicket from '@/assets/images/decimo.jpg';

const THUMB_IMAGES: Record<string, string> = {
  jueves: juevesTicket,
  sabado: sabadoTicket,
  navidad: navidadTicket,
  nino: navidadTicket,
};

interface NationalTicketThumbnailProps {
  /** 'jueves' | 'sabado' | 'especial' | any future drawId */
  drawId: string;
  /** Kept for API compatibility — not rendered in the thumbnail (showcase/cart view) */
  number?: string;
  /** Reserved for future certificate view */
  serie?: string;
  /** Reserved for future certificate view */
  fraccion?: string;
  className?: string;
}

export function NationalTicketThumbnail({
  drawId,
  className,
}: NationalTicketThumbnailProps) {
  const image = THUMB_IMAGES[drawId];

  // Fallback: special or unknown draw types — neutral ticket placeholder
  if (!image) {
    return (
      <div className={cn(
        'aspect-[1.8/1] shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200',
        className
      )} />
    );
  }

  return (
    <div className={cn(
      'relative aspect-[1.8/1] shrink-0 overflow-hidden rounded-md',
      className
    )}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
