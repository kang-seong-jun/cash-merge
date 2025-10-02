import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { GameEvent } from '../types/game';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';

interface EventPopupProps {
  event: GameEvent | null;
}

export function EventPopup({ event }: EventPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  useEffect(() => {
    if (event && event !== currentEvent) {
      setCurrentEvent(event);
      setIsOpen(true);
      
      // 3초 후 자동으로 닫기
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [event, currentEvent]);

  if (!currentEvent) return null;

  const getIcon = () => {
    switch (currentEvent.type) {
      case 'dollar_surge':
        return <TrendingUp className="w-16 h-16 text-green-500" />;
      case 'won_strong':
        return <TrendingUp className="w-16 h-16 text-blue-500" />;
      case 'yen_weak':
        return <TrendingDown className="w-16 h-16 text-red-500" />;
      default:
        return <Coins className="w-16 h-16 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (currentEvent.type) {
      case 'dollar_surge':
        return 'from-green-100 to-green-50';
      case 'won_strong':
        return 'from-blue-100 to-blue-50';
      case 'yen_weak':
        return 'from-red-100 to-red-50';
      default:
        return 'from-gray-100 to-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">환율 이벤트 발생!</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-br ${getBgColor()} p-6 rounded-lg space-y-4`}
        >
          <div className="flex justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {getIcon()}
            </motion.div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-primary">{currentEvent.name}</h3>
            <p className="text-muted-foreground">{currentEvent.description}</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}