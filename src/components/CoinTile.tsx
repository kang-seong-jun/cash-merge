import { motion } from 'motion/react';
import { Currency, CURRENCY_CONFIG } from '../types/game';

interface CoinTileProps {
  currency: Currency;
  value: number;
  isNew?: boolean;
  isMerging?: boolean;
}

export function CoinTile({ currency, value, isNew, isMerging }: CoinTileProps) {
  const config = CURRENCY_CONFIG[currency];
  
  const getColorByValue = () => {
    const index = config.values.indexOf(value);
    if (index <= 1) return config.lightColor;
    if (index >= config.values.length - 2) return config.darkColor;
    return config.color;
  };

  return (
    <motion.div
      initial={isNew ? { scale: 0 } : { scale: 1 }}
      animate={{ 
        scale: isMerging ? [1, 1.3, 1] : 1,
        rotate: isMerging ? [0, 5, -5, 0] : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`w-full h-full ${getColorByValue()} rounded-lg flex flex-col items-center justify-center gap-1 p-2 shadow-lg ${
        isMerging ? 'ring-4 ring-yellow-300' : ''
      }`}
    >
      <span className="text-white opacity-90">{config.symbol}</span>
      <span className="text-white">{value.toLocaleString()}</span>
    </motion.div>
  );
}