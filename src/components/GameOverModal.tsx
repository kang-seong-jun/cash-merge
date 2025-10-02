import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  onRestart: () => void;
}

export function GameOverModal({ isOpen, score, onRestart }: GameOverModalProps) {
  const getCouponMessage = () => {
    if (score >= 50000) {
      return '🎉 환전 수수료 50% 우대 쿠폰 획득!';
    } else if (score >= 30000) {
      return '🎊 환전 수수료 30% 우대 쿠폰 획득!';
    } else if (score >= 10000) {
      return '🎁 환전 수수료 10% 우대 쿠폰 획득!';
    }
    return '다음엔 더 높은 점수에 도전해보세요!';
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
            게임 종료
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <div>
              <p className="text-muted-foreground">최종 점수</p>
              <p className="text-primary">{score.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p>{getCouponMessage()}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={onRestart} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시작
        </Button>
      </DialogContent>
    </Dialog>
  );
}