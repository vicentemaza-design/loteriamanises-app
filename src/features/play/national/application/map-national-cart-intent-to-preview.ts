import type { 
  NationalCartDraftIntent, 
  NationalDraftPreview, 
  NationalDraftPreviewSummary 
} from '../contracts/national-play.contract';
import { NATIONAL_DRAW_CONFIG } from '../mocks/national-showcase.mock';

/**
 * Mapeador puro que convierte una intención de cesta nacional en una previsualización de borradores.
 * 
 * DECISIÓN DE MAPEO:
 * El mapeo se realiza EXPANDIDO por fecha de sorteo. Cada línea de la intención puede generar
 * múltiples previsualizaciones (una por cada drawDate). Esto refleja fielmente cómo se
 * almacenarán finalmente los borradores en PlaySession.
 */
export function mapNationalCartIntentToPreview(
  intent: NationalCartDraftIntent
): NationalDraftPreviewSummary {
  const previews: NationalDraftPreview[] = [];
  let totalAmount = 0;
  let totalDecimos = 0;

  intent.lines.forEach((line) => {
    // Buscamos el precio del décimo para este sorteo en el config/mocks
    const drawCfg = NATIONAL_DRAW_CONFIG.find(d => d.id === line.drawId);
    const decimoPrice = drawCfg?.decimoPrice ?? 3; // Fallback seguro

    line.drawDates.forEach((date) => {
      const totalPrice = decimoPrice * line.quantity;
      
      previews.push({
        gameId: intent.gameId,
        drawDate: date,
        number: line.number,
        quantity: line.quantity,
        unitPrice: decimoPrice,
        totalPrice: totalPrice,
        drawLabel: line.drawLabel,
      });

      totalAmount += totalPrice;
      totalDecimos += line.quantity;
    });
  });

  return {
    items: previews,
    totalAmount,
    totalDecimos,
  };
}
