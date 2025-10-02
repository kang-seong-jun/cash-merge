import { Trophy, RefreshCw, Repeat } from 'lucide-react';
import { Button } from './ui/button';

interface ScoreBoardProps {
  score: number;
  exchangeTokens: number;
  onReset: () => void;
  onExchange: () => void;
}

export function ScoreBoard({ score, exchangeTokens, onReset, onExchange }: ScoreBoardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md flex-1">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-muted-foreground">점수</p>
            <p>{score.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
          <Repeat className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-muted-foreground">환전권</p>
            <p>{exchangeTokens}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onExchange}
          disabled={exchangeTokens === 0}
          variant="outline"
          className="flex-1"
        >
          <Repeat className="w-4 h-4 mr-2" />
          환전 사용
        </Button>
        <Button onClick={onReset} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          새 게임
        </Button>
      </div>
    </div>
  );
}