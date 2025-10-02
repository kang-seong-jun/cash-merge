(function () {
  const GRID_SIZE = 5;
  const EVENT_INTERVAL = 20000; // 20s

  const CURRENCY_CONFIG = {
    KRW: {
      name: '원화', symbol: '₩', values: [100, 500, 1000, 5000, 10000, 50000],
      colors: { base: 'coin--krw', light: 'light', dark: 'dark' },
    },
    USD: {
      name: '달러', symbol: '$', values: [1, 5, 10, 20, 50, 100],
      colors: { base: 'coin--usd', light: 'light', dark: 'dark' },
    },
    JPY: {
      name: '엔화', symbol: '¥', values: [100, 500, 1000, 5000, 10000, 50000],
      colors: { base: 'coin--jpy', light: 'light', dark: 'dark' },
    },
  };

  const GAME_EVENTS = [
    { type: 'dollar_surge', name: '💵 달러 강세!', description: '달러 코인 합칠 때 2배 보너스!', duration: 15, effect: 'usd_bonus' },
    { type: 'yen_weak', name: '💴 엔저 현상!', description: '엔화 코인이 더 자주 등장!', duration: 15, effect: 'yen_spawn' },
    { type: 'won_strong', name: '💰 원화 강세!', description: '원화 코인 합칠 때 2배 보너스!', duration: 15, effect: 'krw_bonus' },
  ];

  const state = {
    board: createEmptyBoard(),
    score: 0,
    currentEvent: null,
    eventTimeLeft: 0,
    gameOver: false,
    exchangeTokens: 3,
    selectedCell: null,
    exchangeMode: false,
    mergeCount: 0,
    hasStarted: false,
  };

  // DOM refs
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const tokensEl = document.getElementById('tokens');
  const eventBannerEl = document.getElementById('eventBanner');
  const eventNameEl = document.getElementById('eventName');
  const eventDescEl = document.getElementById('eventDesc');
  const timeLeftEl = document.getElementById('timeLeft');
  const exchangeModeEl = document.getElementById('exchangeMode');
  const gameOverEl = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const couponEl = document.getElementById('coupon');
  const resetBtn = document.getElementById('resetBtn');
  const restartBtn = document.getElementById('restartBtn');
  const exchangeBtn = document.getElementById('exchangeBtn');

  // Init
  initializeGame();
  attachHandlers();
  renderAll();
  startEventTicker();

  function createEmptyBoard() {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  }

  function initializeGame() {
    state.board = createEmptyBoard();
    state.score = 0;
    state.currentEvent = null;
    state.eventTimeLeft = 0;
    state.gameOver = false;
    state.exchangeTokens = 3;
    state.selectedCell = null;
    state.exchangeMode = false;
    state.mergeCount = 0;
    state.hasStarted = false;

    // Ensure the game over modal is hidden on init
    if (gameOverEl) gameOverEl.classList.add('hidden');

    const initialPositions = getRandomEmptyPositions(8);
    for (const pos of initialPositions) {
      const coin = createRandomCoin(pos, null);
      state.board[pos.row][pos.col] = { ...coin, isNew: true };
    }
    // immediate merge without animations
    const result = checkAndMergeCoinsRecursive(state.board, state.currentEvent, 0, 0);
    state.board = result.board;
  }

  function attachHandlers() {
    resetBtn.addEventListener('click', () => {
      initializeGame();
      renderAll();
    });

    restartBtn.addEventListener('click', () => {
      gameOverEl.classList.add('hidden');
      initializeGame();
      renderAll();
    });

    exchangeBtn.addEventListener('click', () => {
      if (state.exchangeTokens > 0) {
        state.exchangeMode = !state.exchangeMode;
        state.selectedCell = null;
        renderExchangeMode();
      }
    });
  }

  function getRandomEmptyPositions(count) {
    const empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!state.board[r][c]) empty.push({ row: r, col: c });
      }
    }
    const shuffled = empty.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  function createRandomCoin(position, effect) {
    let currency;
    if (effect === 'yen_spawn' && Math.random() < 0.6) {
      currency = 'JPY';
    } else {
      const currencies = ['KRW', 'USD', 'JPY'];
      currency = currencies[Math.floor(Math.random() * currencies.length)];
    }
    const cfg = CURRENCY_CONFIG[currency];
    const value = cfg.values[0];
    return { id: `${Date.now()}-${Math.random()}`, currency, value, position };
  }

  function handleCellClick(row, col) {
    if (state.gameOver) return;
    const clicked = state.board[row][col];

    if (state.exchangeMode) {
      if (clicked && state.exchangeTokens > 0) {
        exchangeCoin(row, col);
      }
      return;
    }

    if (state.selectedCell) {
      const from = state.selectedCell;
      const selectedCoin = state.board[from.row][from.col];

      if (selectedCoin && !clicked) {
        // 빈 칸으로 이동
        moveCoin(from, { row, col });
        state.hasStarted = true;
        state.selectedCell = null;
        return;
      }

      if (selectedCoin && clicked) {
        // 코인 <-> 코인 스왑
        swapCoins(from, { row, col });
        state.hasStarted = true;
        state.selectedCell = null;
        return;
      }

      // 선택 해제
      state.selectedCell = null;
      renderBoard();
    } else {
      // 첫 번째 선택은 코인이 있는 칸만 허용
      if (clicked) {
        state.selectedCell = { row, col };
        renderBoard();
      }
    }
  }

  function swapCoins(a, b) {
    const aCoin = state.board[a.row][a.col];
    const bCoin = state.board[b.row][b.col];
    if (!aCoin || !bCoin) return;
    state.board[a.row][a.col] = { ...bCoin, position: { row: a.row, col: a.col }, isNew: false };
    state.board[b.row][b.col] = { ...aCoin, position: { row: b.row, col: b.col }, isNew: false };
    renderBoard();
    setTimeout(() => performMergeChain(), 100);
  }

  function moveCoin(from, to) {
    const coin = state.board[from.row][from.col];
    if (!coin) return;
    state.board[from.row][from.col] = null;
    state.board[to.row][to.col] = { ...coin, position: to, isNew: false };
    renderBoard();

    setTimeout(() => {
      performMergeChain();
    }, 100);
  }

  function performMergeChain() {
    const result = performSingleMerge(state.board, state.currentEvent);
    if (!result.merged) {
      // 한 턴 종료 시 새 코인 2개 스폰
      addNewCoins(result.board, 2);
      // BUGFIX: result.board에만 추가되던 코인을 실제 상태에 반영
      state.board = result.board;
      renderAll();
      return;
    }
    if (result.mergeCount > 0) state.mergeCount += result.mergeCount;
    state.board = result.board;
    state.score += result.score;
    renderHUD();
    renderBoard(true);
    setTimeout(() => {
      // clear merging flags
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const coin = state.board[r][c];
          if (coin) coin.isMerging = false;
        }
      }
      renderBoard();
      setTimeout(() => performMergeChain(), 100);
    }, 300);
  }

  function performSingleMerge(board, currentEvent) {
    const newBoard = board.map((row) => row.slice());
    let mergeScore = 0;
    let mergeCount = 0;
    // Merge priority: bottom to top, right to left
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      for (let c = GRID_SIZE - 1; c >= 0; c--) {
        const coin = newBoard[r][c];
        if (!coin) continue;
        // Neighbor priority: down → right → up → left
        const neighbors = [
          { row: r + 1, col: c },
          { row: r, col: c + 1 },
          { row: r - 1, col: c },
          { row: r, col: c - 1 },
        ];
        for (const n of neighbors) {
          if (n.row>=0 && n.row<GRID_SIZE && n.col>=0 && n.col<GRID_SIZE) {
            const nCoin = newBoard[n.row][n.col];
            if (nCoin && nCoin.currency === coin.currency && nCoin.value === coin.value) {
              const cfg = CURRENCY_CONFIG[coin.currency];
              const idx = cfg.values.indexOf(coin.value);
              if (idx < cfg.values.length - 1) {
                const newValue = cfg.values[idx + 1];
                const bonus = shouldApplyBonus(coin.currency, currentEvent);
                const points = newValue * (bonus ? 2 : 1);
                mergeScore += points; mergeCount += 1;
                // Place merged coin up (for vertical) or left (for horizontal)
                const isVertical = n.col === c;
                const destRow = isVertical ? Math.min(r, n.row) : r;
                const destCol = isVertical ? c : Math.min(c, n.col);
                // Clear both originals
                newBoard[r][c] = null;
                newBoard[n.row][n.col] = null;
                // Place merged at destination
                newBoard[destRow][destCol] = {
                  ...coin,
                  value: newValue,
                  isMerging: true,
                  position: { row: destRow, col: destCol },
                };
                return { board: newBoard, score: mergeScore, mergeCount, merged: true };
              }
            }
          }
        }
      }
    }
    return { board: newBoard, score: mergeScore, mergeCount, merged: false };
  }

  function checkAndMergeCoinsRecursive(board, currentEvent, accScore, accMerges) {
    const newBoard = board.map((row) => row.slice());
    let merged = false; let mergeScore = 0; let mergeCount = 0;
    // Same priority as single merge: bottom→top, right→left
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      for (let c = GRID_SIZE - 1; c >= 0; c--) {
        const coin = newBoard[r][c];
        if (!coin) continue;
        // Neighbor priority: down → right → up → left
        const neighbors = [
          { row: r + 1, col: c },
          { row: r, col: c + 1 },
          { row: r - 1, col: c },
          { row: r, col: c - 1 },
        ];
        for (const n of neighbors) {
          if (n.row>=0 && n.row<GRID_SIZE && n.col>=0 && n.col<GRID_SIZE) {
            const nCoin = newBoard[n.row][n.col];
            if (nCoin && nCoin.currency === coin.currency && nCoin.value === coin.value) {
              const cfg = CURRENCY_CONFIG[coin.currency];
              const idx = cfg.values.indexOf(coin.value);
              if (idx < cfg.values.length - 1) {
                const newValue = cfg.values[idx + 1];
                const bonus = shouldApplyBonus(coin.currency, currentEvent);
                const points = newValue * (bonus ? 2 : 1);
                mergeScore += points; mergeCount += 1;
                const isVertical = n.col === c;
                const destRow = isVertical ? Math.min(r, n.row) : r;
                const destCol = isVertical ? c : Math.min(c, n.col);
                newBoard[r][c] = null;
                newBoard[n.row][n.col] = null;
                newBoard[destRow][destCol] = { ...coin, value: newValue, position: { row: destRow, col: destCol } };
                merged = true; break;
              }
            }
          }
        }
        if (merged) break;
      }
      if (merged) break;
    }
    if (merged) return checkAndMergeCoinsRecursive(newBoard, currentEvent, accScore + mergeScore, accMerges + mergeCount);
    return { board: newBoard, totalScore: accScore + mergeScore, totalMerges: accMerges + mergeCount };
  }

  function shouldApplyBonus(currency, event) {
    if (!event) return false;
    if (event.type === 'dollar_surge' && currency === 'USD') return true;
    if (event.type === 'won_strong' && currency === 'KRW') return true;
    return false;
  }

  function addNewCoins(board, count) {
    const positions = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!board[r][c]) positions.push({ row: r, col: c });
      }
    }
    const shuffled = positions.sort(() => Math.random() - 0.5).slice(0, Math.min(count, positions.length));
    for (const pos of shuffled) {
      const coin = createRandomCoin(pos, state.currentEvent?.effect || null);
      board[pos.row][pos.col] = { ...coin, isNew: true };
    }
    return shuffled.map((p) => board[p.row][p.col]);
  }

  function exchangeCoin(row, col) {
    if (state.exchangeTokens === 0) return;
    const coin = state.board[row][col];
    if (!coin) return;
    state.hasStarted = true;
    const currencies = ['KRW', 'USD', 'JPY'];
    const others = currencies.filter((c) => c !== coin.currency);
    const newCurrency = others[Math.floor(Math.random() * others.length)];
    const oldCfg = CURRENCY_CONFIG[coin.currency];
    const newCfg = CURRENCY_CONFIG[newCurrency];
    const valueIndex = oldCfg.values.indexOf(coin.value);
    const newValue = newCfg.values[Math.min(valueIndex, newCfg.values.length - 1)];
    state.board[row][col] = { ...coin, currency: newCurrency, value: newValue };

    const { board: mergedBoard, totalScore, totalMerges } = checkAndMergeCoinsRecursive(state.board, state.currentEvent, 0, 0);
    state.board = mergedBoard;
    if (totalMerges > 0) state.mergeCount += totalMerges;
    state.exchangeTokens -= 1;
    state.score += totalScore;
    state.exchangeMode = false;
    // 환전도 한 턴으로 간주: 새 코인 2개 스폰
    addNewCoins(state.board, 2);
    renderAll();
  }

  function checkGameOver() {
    // 1) 빈 칸이 있으면 게임 오버 아님
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!state.board[r][c]) return false;
      }
    }
    // 2) 인접한 같은 코인(같은 통화/같은 값)이 있으면 아직 합칠 수 있으므로 오버 아님
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const coin = state.board[r][c];
        if (!coin) continue;
        const neighbors = [
          { row: r - 1, col: c },
          { row: r + 1, col: c },
          { row: r, col: c - 1 },
          { row: r, col: c + 1 },
        ];
        for (const n of neighbors) {
          if (n.row >= 0 && n.row < GRID_SIZE && n.col >= 0 && n.col < GRID_SIZE) {
            const nCoin = state.board[n.row][n.col];
            if (nCoin && nCoin.currency === coin.currency && nCoin.value === coin.value) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  function startEventTicker() {
    setInterval(() => {
      if (!state.currentEvent) startEvent();
    }, EVENT_INTERVAL);

    setInterval(() => {
      if (state.currentEvent && state.eventTimeLeft > 0) {
        state.eventTimeLeft -= 1;
        if (state.eventTimeLeft <= 0) {
          state.currentEvent = null; state.eventTimeLeft = 0;
        }
        renderEvent();
      }
    }, 1000);
  }

  function startEvent() {
    const ev = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
    state.currentEvent = ev;
    state.eventTimeLeft = ev.duration;
    renderEvent();
  }

  function renderAll() {
    renderHUD();
    renderEvent();
    renderExchangeMode();
    renderBoard();
    if (state.hasStarted && checkGameOver()) {
      state.gameOver = true;
      finalScoreEl.textContent = state.score.toLocaleString();
      couponEl.textContent = getCouponMessage(state.score);
      gameOverEl.classList.remove('hidden');
    }
  }

  function renderHUD() {
    scoreEl.textContent = state.score.toLocaleString();
    tokensEl.textContent = String(state.exchangeTokens);
    exchangeBtn.disabled = state.exchangeTokens === 0;
  }

  function renderEvent() {
    if (!state.currentEvent) {
      eventBannerEl.className = 'event event--idle';
      eventNameEl.textContent = '환율 이벤트 대기 중...';
      eventDescEl.textContent = '';
      timeLeftEl.textContent = '0';
      return;
    }
    const e = state.currentEvent;
    eventNameEl.textContent = e.name;
    eventDescEl.textContent = e.description;
    timeLeftEl.textContent = String(state.eventTimeLeft);
    let cls = 'event ';
    if (e.type === 'dollar_surge') cls += 'event--dollar';
    else if (e.type === 'yen_weak') cls += 'event--yen';
    else if (e.type === 'won_strong') cls += 'event--won';
    else cls += 'event--idle';
    eventBannerEl.className = cls;
  }

  function renderExchangeMode() {
    exchangeModeEl.classList.toggle('hidden', !state.exchangeMode);
  }

  function renderBoard(withMerging) {
    boardEl.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (state.selectedCell && state.selectedCell.row === r && state.selectedCell.col === c ? ' selected' : '');
        cell.addEventListener('click', () => handleCellClick(r, c));
        const coin = state.board[r][c];
        if (coin) {
          const cfg = CURRENCY_CONFIG[coin.currency];
          const idx = cfg.values.indexOf(coin.value);
          const colorTier = idx <= 1 ? 'light' : (idx >= cfg.values.length - 2 ? 'dark' : '');
          const coinDiv = document.createElement('div');
          coinDiv.className = `coin ${cfg.colors.base} ${colorTier}` + (withMerging && coin.isMerging ? ' merging' : '');
          const sym = document.createElement('span'); sym.className = 'symbol'; sym.textContent = cfg.symbol;
          const val = document.createElement('span'); val.className = 'val'; val.textContent = coin.value.toLocaleString();
          coinDiv.appendChild(sym); coinDiv.appendChild(val);
          cell.appendChild(coinDiv);
        }
        boardEl.appendChild(cell);
      }
    }
  }

  function getCouponMessage(score) {
    if (score >= 50000) return '🎉 환전 수수료 50% 우대 쿠폰 획득!';
    if (score >= 30000) return '🎊 환전 수수료 30% 우대 쿠폰 획득!';
    if (score >= 10000) return '🎁 환전 수수료 10% 우대 쿠폰 획득!';
    return '다음엔 더 높은 점수에 도전해보세요!';
  }
})();


