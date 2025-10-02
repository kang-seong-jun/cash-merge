import { GameBoard } from "./components/GameBoard";
import { ScoreBoard } from "./components/ScoreBoard";
import { EventBanner } from "./components/EventBanner";
import { GameOverModal } from "./components/GameOverModal";
import { HowToPlay } from "./components/HowToPlay";
import { useGameLogic } from "./hooks/useGameLogic";
import { Coins } from "lucide-react";

export default function App() {
  const {
    gameState,
    selectedCell,
    exchangeMode,
    handleCellClick,
    resetGame,
    toggleExchangeMode,
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-blue-600" />
            <h1 className="text-primary">환율왕: 코인 머지</h1>
            <HowToPlay />
          </div>
          <p className="text-muted-foreground">
            같은 코인을 합쳐 고액권을 만드세요!
          </p>
        </div>

        {/* Score Board */}
        <ScoreBoard
          score={gameState.score}
          exchangeTokens={gameState.exchangeTokens}
          onReset={resetGame}
          onExchange={toggleExchangeMode}
        />

        {/* Event Banner (고정된 높이 20) */}
        <div className="h-20">
          <EventBanner
            event={gameState.currentEvent}
            timeLeft={gameState.eventTimeLeft}
          />
        </div>

        {/* Exchange Mode Indicator (고정된 높이) */}
        <div className="h-12 flex items-center justify-center">
          {exchangeMode && (
            <div className="bg-yellow-100 border-2 border-yellow-400 px-4 py-2 rounded-lg text-center w-full">
              <p className="text-yellow-800">
                🔄 환전 모드: 변환할 코인을 선택하세요
              </p>
            </div>
          )}
        </div>

        {/* Game Board (고정된 크기와 위치) */}
        <div className="flex justify-center">
          <GameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
          />
        </div>

        {/* Instructions */}
        <div className="bg-white p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <p className="text-muted-foreground">₩ 원화</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <p className="text-muted-foreground">$ 달러</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <p className="text-muted-foreground">¥ 엔화</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState.gameOver}
        score={gameState.score}
        onRestart={resetGame}
      />
    </div>
  );
}