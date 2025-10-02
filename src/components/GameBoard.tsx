import { motion } from 'motion/react';
import { Coin } from '../types/game';
import { CoinTile } from './CoinTile';

interface GameBoardProps {
  board: (Coin | null)[][];
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
}

export function GameBoard({ board, onCellClick, selectedCell }: GameBoardProps) {
  const gridSize = board.length;

  return (
    <div 
      className="bg-gray-200 p-3 rounded-xl shadow-xl"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '0.5rem',
        width: '400px',
        height: '400px',
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((coin, colIndex) => {
          const isSelected = 
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          
          return (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              className={`bg-gray-300 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'ring-4 ring-yellow-400' : ''
              } ${coin ? '' : 'hover:bg-gray-400'}`}
              whileTap={{ scale: 0.95 }}
              animate={coin?.isMerging ? {
                backgroundColor: ['#d1d5db', '#fef3c7', '#d1d5db'],
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {coin && (
                <motion.div 
                  className="w-full h-full"
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CoinTile
                    currency={coin.currency}
                    value={coin.value}
                    isNew={coin.isNew}
                    isMerging={coin.isMerging}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}