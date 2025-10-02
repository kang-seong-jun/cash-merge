import { motion } from 'motion/react';
import { GameEvent } from '../types/game';
import { Timer, TrendingUp, TrendingDown } from 'lucide-react';

interface EventBannerProps {
  event: GameEvent | null;
  timeLeft: number;
}

export function EventBanner({ event, timeLeft }: EventBannerProps) {
  if (!event) {
    return (
      <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <p className="text-muted-foreground">환율 이벤트 대기 중...</p>
      </div>
    );
  }

  const getBgColor = () => {
    switch (event.type) {
      case 'dollar_surge':
        return 'from-green-500 to-green-600';
      case 'yen_weak':
        return 'from-red-500 to-red-600';
      case 'won_strong':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = () => {
    switch (event.type) {
      case 'dollar_surge':
      case 'won_strong':
        return <TrendingUp className="w-6 h-6" />;
      case 'yen_weak':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-full h-20 bg-gradient-to-r ${getBgColor()} text-white px-4 py-3 rounded-lg shadow-lg`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-white">{event.name}</h3>
            <p className="text-white/90">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
          <Timer className="w-4 h-4" />
          <span>{timeLeft}초</span>
        </div>
      </div>
    </motion.div>
  );
}