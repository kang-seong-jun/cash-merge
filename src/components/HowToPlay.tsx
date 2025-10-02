import { Info } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function HowToPlay() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>게임 방법</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-3 text-left">
          <div>
            <h4>🎮 기본 플레이</h4>
            <p>• 같은 통화, 같은 금액의 코인을 선택하고 빈 칸을 클릭하여 이동</p>
            <p>• 인접한 같은 코인끼리 자동으로 합쳐집니다</p>
            <p>• 합쳐지면 다음 단계의 코인이 됩니다</p>
          </div>
          
          <div>
            <h4>💱 환율 이벤트</h4>
            <p>• 주기적으로 환율 변동 이벤트가 발생합니다</p>
            <p>• 달러 강세: 달러 합칠 때 2배 보너스</p>
            <p>• 엔저 현상: 엔화가 더 자주 등장</p>
            <p>• 원화 강세: 원화 합칠 때 2배 보너스</p>
          </div>
          
          <div>
            <h4>🔄 환전 아이템</h4>
            <p>• 환전권을 사용해 선택한 코인을 다른 통화로 변환</p>
            <p>• 코인 10개를 합칠 때마다 환전권 1개 획득</p>
          </div>
          
          <div>
            <h4>🏆 보상</h4>
            <p>• 10,000점: 수수료 10% 우대 쿠폰</p>
            <p>• 30,000점: 수수료 30% 우대 쿠폰</p>
            <p>• 50,000점: 수수료 50% 우대 쿠폰</p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}