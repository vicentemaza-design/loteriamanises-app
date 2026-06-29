import { GamePlayBottomMenu, type GamePlayBottomMenuItem } from './GamePlayBottomMenu';

interface PurchaseBottomBarProps {
  availableBalance: number;
  totalPrice: number;
  canContinue: boolean;
  ctaLabel: string;
  onContinue: () => void;
  activeColor: string;
  drawsCount?: number;
  validationText?: string;
  summaryText?: string;
  menuItems?: GamePlayBottomMenuItem[];
  className?: string;
}

export function PurchaseBottomBar({
  availableBalance,
  totalPrice,
  canContinue,
  ctaLabel,
  onContinue,
  activeColor,
  drawsCount,
  validationText,
  summaryText,
  menuItems,
  className,
}: PurchaseBottomBarProps) {
  return (
    <GamePlayBottomMenu
      availableBalance={availableBalance}
      totalPrice={totalPrice}
      canContinue={canContinue}
      ctaLabel={ctaLabel}
      onContinue={onContinue}
      activeColor={activeColor}
      drawsCount={drawsCount}
      validationText={validationText}
      summaryText={summaryText}
      menuItems={menuItems}
      className={className}
    />
  );
}
