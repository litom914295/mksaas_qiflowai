import { type QiflowProduct, getQiflowPrice } from '@/config/qiflow-pricing';

interface CreditsPriceProps {
  product: QiflowProduct;
  className?: string;
}

export function CreditsPrice({
  product,
  className = 'text-sm text-muted-foreground',
}: CreditsPriceProps) {
  const price = getQiflowPrice(product);
  return <span className={className}>{price} credits</span>;
}
