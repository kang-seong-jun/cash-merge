import { useState, useEffect, useCallback } from 'react';
import {
  Coin,
  Currency,
  GameState,
  CURRENCY_CONFIG,
  GAME_EVENTS,
  GameEvent,
} from '../types/game';

const GRID_SIZE = 5;
const EVENT_INTERVAL = 20000; // 20 seconds

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mergeCount, setMergeCount] = useState(0);
  const [exchangeMode, setExchangeMode] = useState(false);

  function initializeGame(): GameState {
    const board: (Coin | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null));

    const initialCoins = generateInitialCoins(board);
    
    return {
      board,
      score: 0,
      coins: initialCoins,
      currentEvent: null,
      eventTimeLeft: 0,
      gameOver: false,
      exchangeTokens: 3,
    };
  }

  function generateInitialCoins(board: (Coin | null)[][]): Coin[] {
    const coins: Coin[] = [];
    const positions = getRandomEmptyPositions(board, 8);

    positions.forEach((pos) => {
      const coin = createRandomCoin(pos, null);
      board[pos.row][pos.col] = coin;
      coins.push(coin);
    });

    // 초기 생성 후에도 자동 머지 체크
    const { board: mergedBoard } = checkAndMergeCoinsRecursive(board, null, 0, 0);
    
    // 머지된 보드를 원본 보드에 반영
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        board[row][col] = mergedBoard[row][col];
      }
    }

    return coins;
  }

  function createRandomCoin(
    position: { row: number; col: number },
    eventType: string | null
  ): Coin {
    let currency: Currency;
    
    if (eventType === 'yen_spawn' && Math.random() < 0.6) {
      currency = 'JPY';
    } else {
      const currencies: Currency[] = ['KRW', 'USD', 'JPY'];
      currency = currencies[Math.floor(Math.random() * currencies.length)];
    }

    const config = CURRENCY_CONFIG[currency];
    const value = config.values[0];

    return {
      id: `${Date.now()}-${Math.random()}`,
      currency,
      value,
      position,
      isNew: true,
    };
  }

  function getRandomEmptyPositions(
    board: (Coin | null)[][],
    count: number
  ): { row: number; col: number }[] {
    const empty: { row: number; col: number }[] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col]) {
          empty.push({ row, col });
        }
      }
    }

    const shuffled = empty.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, empty.length));
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver) return;

    const clickedCoin = gameState.board[row][col];

    if (exchangeMode) {
      if (clickedCoin && gameState.exchangeTokens > 0) {
        exchangeCoin(row, col);
      }
      return;
    }

    if (selectedCell) {
      const selectedCoin = gameState.board[selectedCell.row][selectedCell.col];
      
      if (selectedCoin && !clickedCoin) {
        moveCoin(selectedCell, { row, col });
      }
      
      setSelectedCell(null);
    } else {
      if (clickedCoin) {
        setSelectedCell({ row, col });
      }
    }
  }, [gameState, selectedCell, exchangeMode]);

  function moveCoin(
    from: { row: number; col: number },
    to: { row: number; col: number }
  ) {
    // 먼저 코인 이동
    setGameState((prev) => {
      const newBoard = prev.board.map((row) => [...row]);
      const coin = newBoard[from.row][from.col];
      
      if (!coin) return prev;

      newBoard[from.row][from.col] = null;
      newBoard[to.row][to.col] = { ...coin, position: to, isNew: false };

      return {
        ...prev,
        board: newBoard,
      };
    });

    // 이동 후 애니메이션과 함께 순차적으로 merge 처리
    setTimeout(() => {
      performMergeChain();
    }, 100);
  }

  function performMergeChain() {
    setGameState((prev) => {
      const result = performSingleMerge(prev.board, prev.currentEvent);
      
      if (!result.merged) {
        // 더 이상 merge할 것이 없으면 새 코인 추가
        const newCoins = addNewCoins(result.board, 1);
        return {
          ...prev,
          board: result.board,
          coins: newCoins,
        };
      }

      // Merge가 일어났으면 점수 업데이트
      if (result.mergeCount > 0) {
        setMergeCount((prevCount) => prevCount + result.mergeCount);
      }

      // Merge 애니메이션 표시
      setTimeout(() => {
        setGameState((current) => ({
          ...current,
          board: current.board.map((row) =>
            row.map((coin) =>
              coin ? { ...coin, isMerging: false } : null
            )
          ),
        }));

        // 다음 merge 체크 (연쇄 merge)
        setTimeout(() => {
          performMergeChain();
        }, 100);
      }, 300);

      return {
        ...prev,
        board: result.board,
        score: prev.score + result.score,
      };
    });
  }

  function performSingleMerge(
    board: (Coin | null)[][],
    currentEvent: GameEvent | null
  ): { board: (Coin | null)[][]; score: number; mergeCount: number; merged: boolean } {
    const newBoard = board.map((row) => [...row]);
    let mergeScore = 0;
    let mergeCount = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const coin = newBoard[row][col];
        if (!coin) continue;

        const neighbors = [
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 },
        ];

        for (const neighbor of neighbors) {
          if (
            neighbor.row >= 0 &&
            neighbor.row < GRID_SIZE &&
            neighbor.col >= 0 &&
            neighbor.col < GRID_SIZE
          ) {
            const neighborCoin = newBoard[neighbor.row][neighbor.col];
            
            if (
              neighborCoin &&
              neighborCoin.currency === coin.currency &&
              neighborCoin.value === coin.value
            ) {
              const config = CURRENCY_CONFIG[coin.currency];
              const currentIndex = config.values.indexOf(coin.value);
              
              if (currentIndex < config.values.length - 1) {
                const newValue = config.values[currentIndex + 1];
                const bonus = shouldApplyBonus(coin.currency, currentEvent);
                const points = newValue * (bonus ? 2 : 1);
                
                mergeScore += points;
                mergeCount += 1;

                newBoard[row][col] = {
                  ...coin,
                  value: newValue,
                  isMerging: true,
                };
                newBoard[neighbor.row][neighbor.col] = null;

                return {
                  board: newBoard,
                  score: mergeScore,
                  mergeCount,
                  merged: true,
                };
              }
            }
          }
        }
      }
    }

    return {
      board: newBoard,
      score: mergeScore,
      mergeCount,
      merged: false,
    };
  }

  function checkAndMergeCoinsRecursive(
    board: (Coin | null)[][],
    currentEvent: GameEvent | null,
    accumulatedScore: number,
    accumulatedMerges: number
  ): { board: (Coin | null)[][]; totalScore: number; totalMerges: number } {
    const newBoard = board.map((row) => [...row]);
    let merged = false;
    let mergeScore = 0;
    let mergeCount = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const coin = newBoard[row][col];
        if (!coin) continue;

        const neighbors = [
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 },
        ];

        for (const neighbor of neighbors) {
          if (
            neighbor.row >= 0 &&
            neighbor.row < GRID_SIZE &&
            neighbor.col >= 0 &&
            neighbor.col < GRID_SIZE
          ) {
            const neighborCoin = newBoard[neighbor.row][neighbor.col];
            
            if (
              neighborCoin &&
              neighborCoin.currency === coin.currency &&
              neighborCoin.value === coin.value
            ) {
              const config = CURRENCY_CONFIG[coin.currency];
              const currentIndex = config.values.indexOf(coin.value);
              
              if (currentIndex < config.values.length - 1) {
                const newValue = config.values[currentIndex + 1];
                const bonus = shouldApplyBonus(coin.currency, currentEvent);
                const points = newValue * (bonus ? 2 : 1);
                
                mergeScore += points;
                mergeCount += 1;

                newBoard[row][col] = {
                  ...coin,
                  value: newValue,
                };
                newBoard[neighbor.row][neighbor.col] = null;
                merged = true;
                break;
              }
            }
          }
        }
        
        if (merged) break;
      }
      if (merged) break;
    }

    if (merged) {
      // 재귀적으로 계속 merge 체크 (초기화 및 환전에서만 사용, 애니메이션 없이)
      return checkAndMergeCoinsRecursive(
        newBoard,
        currentEvent,
        accumulatedScore + mergeScore,
        accumulatedMerges + mergeCount
      );
    }

    return {
      board: newBoard,
      totalScore: accumulatedScore + mergeScore,
      totalMerges: accumulatedMerges + mergeCount,
    };
  }

  function shouldApplyBonus(currency: Currency, event: GameEvent | null): boolean {
    if (!event) return false;
    
    if (event.type === 'dollar_surge' && currency === 'USD') return true;
    if (event.type === 'won_strong' && currency === 'KRW') return true;
    
    return false;
  }

  function addNewCoins(
    board: (Coin | null)[][],
    count: number
  ): Coin[] {
    const positions = getRandomEmptyPositions(board, count);
    const effect = gameState.currentEvent?.effect || null;

    positions.forEach((pos) => {
      const coin = createRandomCoin(pos, effect);
      board[pos.row][pos.col] = coin;
    });

    return positions.map((pos) => board[pos.row][pos.col]!);
  }

  function exchangeCoin(row: number, col: number) {
    setGameState((prev) => {
      if (prev.exchangeTokens === 0) return prev;

      const newBoard = prev.board.map((row) => [...row]);
      const coin = newBoard[row][col];
      
      if (!coin) return prev;

      const currencies: Currency[] = ['KRW', 'USD', 'JPY'];
      const otherCurrencies = currencies.filter((c) => c !== coin.currency);
      const newCurrency = otherCurrencies[Math.floor(Math.random() * otherCurrencies.length)];
      
      const oldConfig = CURRENCY_CONFIG[coin.currency];
      const newConfig = CURRENCY_CONFIG[newCurrency];
      const valueIndex = oldConfig.values.indexOf(coin.value);
      const newValue = newConfig.values[Math.min(valueIndex, newConfig.values.length - 1)];

      newBoard[row][col] = {
        ...coin,
        currency: newCurrency,
        value: newValue,
      };

      // 환전 후에도 자동 머지 체크
      const { board: mergedBoard, totalScore, totalMerges } = checkAndMergeCoinsRecursive(
        newBoard,
        prev.currentEvent,
        0,
        0
      );
      
      if (totalMerges > 0) {
        setMergeCount((prevCount) => prevCount + totalMerges);
      }

      return {
        ...prev,
        board: mergedBoard,
        exchangeTokens: prev.exchangeTokens - 1,
        score: prev.score + totalScore,
      };
    });
    
    setExchangeMode(false);
  }

  function checkGameOver(): boolean {
    const { board } = gameState;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col]) return false;
      }
    }
    
    return true;
  }

  const startEvent = useCallback(() => {
    const event = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
    
    setGameState((prev) => ({
      ...prev,
      currentEvent: event,
      eventTimeLeft: event.duration,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initializeGame());
    setSelectedCell(null);
    setMergeCount(0);
    setExchangeMode(false);
  }, []);

  const toggleExchangeMode = useCallback(() => {
    if (gameState.exchangeTokens > 0) {
      setExchangeMode((prev) => !prev);
      setSelectedCell(null);
    }
  }, [gameState.exchangeTokens]);

  useEffect(() => {
    if (mergeCount > 0 && mergeCount % 10 === 0) {
      setGameState((prev) => ({
        ...prev,
        exchangeTokens: prev.exchangeTokens + 1,
      }));
    }
  }, [mergeCount]);

  useEffect(() => {
    const eventTimer = setInterval(() => {
      if (!gameState.currentEvent) {
        startEvent();
      }
    }, EVENT_INTERVAL);

    return () => clearInterval(eventTimer);
  }, [gameState.currentEvent, startEvent]);

  useEffect(() => {
    if (gameState.currentEvent && gameState.eventTimeLeft > 0) {
      const timer = setInterval(() => {
        setGameState((prev) => {
          const newTimeLeft = prev.eventTimeLeft - 1;
          
          if (newTimeLeft <= 0) {
            return {
              ...prev,
              currentEvent: null,
              eventTimeLeft: 0,
            };
          }
          
          return {
            ...prev,
            eventTimeLeft: newTimeLeft,
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.currentEvent, gameState.eventTimeLeft]);

  useEffect(() => {
    if (checkGameOver()) {
      setGameState((prev) => ({ ...prev, gameOver: true }));
    }
  }, [gameState.board]);

  return {
    gameState,
    selectedCell,
    exchangeMode,
    handleCellClick,
    resetGame,
    toggleExchangeMode,
  };
}