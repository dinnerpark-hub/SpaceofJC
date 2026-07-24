"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* =======================================================
   ArcadeModal 컴포넌트 (정찬T네 오락실)
   - 2048 게임: 타일 슬라이딩 이동 & 그리드 정렬
   - 카드 뒤집기: 3D 카드리버스 게임
   - ⚡ 스피드 암산 왕: 타임어택 4지선다 연산 퀴즈
   - 🔢 24 만들기: 난이도 선택(쉬움/일반) & 2단계 힌트
   - 💣 합쳐서 10!: 타일 합 10 팝업 터뜨리기 퍼즐
   - 🧩 미니 스도쿠: 4x4 2x2 서브블록 구분선 & 12종+퍼즐
   ======================================================= */

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
  isMergedTo?: string;
}

interface Make10Tile {
  id: string;
  val: number;
  selected: boolean;
}

const EMOJIS = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🥑", "🍍"];

// ── [24 만들기 퍼즐 데이터 (쉬움 / 일반)] ──
interface Make24Puzzle {
  nums: number[];
  step1Hint: string;
  step2Hint: string;
}

const MAKE24_EASY_PUZZLES: Make24Puzzle[] = [
  { nums: [6, 4, 1, 1], step1Hint: "6과 4를 곱해보세요!", step2Hint: "6 × 4 × 1 × 1" },
  { nums: [3, 8, 1, 1], step1Hint: "3과 8을 곱해보세요!", step2Hint: "3 × 8 × 1 ÷ 1" },
  { nums: [2, 3, 4, 1], step1Hint: "2 × 3 = 6을 만들고 4를 곱해보세요!", step2Hint: "2 × 3 × 4 × 1" },
  { nums: [6, 2, 2, 1], step1Hint: "6 × 2 × 2를 계산해보세요!", step2Hint: "6 × 2 × 2 × 1" },
  { nums: [4, 6, 2, 1], step1Hint: "4와 6을 곱해보세요!", step2Hint: "4 × 6 × (2 - 1)" },
  { nums: [3, 7, 3, 1], step1Hint: "7 + 1 = 8을 만들고 3을 곱해보세요!", step2Hint: "(7 + 1) × 3" },
  { nums: [9, 3, 2, 1], step1Hint: "9 - 1 = 8을 만들고 3을 곱해보세요!", step2Hint: "(9 - 1) × 3" },
  { nums: [5, 5, 7, 7], step1Hint: "5 × 5 = 25를 만들고 7-7=0을 빼보세요!", step2Hint: "5 × 5 - (7 - 7)" },
  { nums: [4, 4, 4, 3], step1Hint: "4 × 4 = 16을 먼저 만드세요!", step2Hint: "4 × 4 + 4 + 4" },
  { nums: [2, 2, 8, 1], step1Hint: "2 + 1 = 3을 만든 뒤 8을 곱해보세요!", step2Hint: "(2 + 1) × 8" }
];

const MAKE24_NORMAL_PUZZLES: Make24Puzzle[] = [
  { nums: [3, 8, 2, 1], step1Hint: "3 - 1 = 2와 8 + 2 = 10을 활용해보세요!", step2Hint: "(3 - 1) × (8 + 2)" },
  { nums: [2, 3, 4, 6], step1Hint: "2 + 4 - 3 = 3을 만들어 보세요!", step2Hint: "(2 + 4 - 3) × 6" },
  { nums: [1, 2, 3, 4], step1Hint: "1 + 2 + 3 = 6을 만들어 보세요!", step2Hint: "(1 + 2 + 3) × 4" },
  { nums: [4, 4, 4, 6], step1Hint: "4 - 4 = 0을 활용해보세요!", step2Hint: "(4 - 4) + 4 × 6" },
  { nums: [2, 4, 8, 8], step1Hint: "8 - 4 = 4를 활용해보세요!", step2Hint: "(8 - 4) × 8 / 2" },
  { nums: [5, 6, 7, 8], step1Hint: "5 + 7 = 12와 8 - 6 = 2를 만들어 보세요!", step2Hint: "(5 + 7) × (8 - 6)" },
  { nums: [1, 1, 4, 6], step1Hint: "1 + 1 + 4 = 6을 만들어 보세요!", step2Hint: "(1 + 1 + 4) × 6" },
  { nums: [2, 3, 8, 9], step1Hint: "9 - 3 = 6과 8 - 4=4 대신 (8-4)를 활용해보세요!", step2Hint: "(9 - 3) × (8 - 4)" },
  { nums: [1, 4, 5, 6], step1Hint: "1 - 5/6 = 1/6을 만드는 고급 수식입니다!", step2Hint: "4 / (1 - 5 / 6)" },
  { nums: [3, 3, 8, 8], step1Hint: "3 - 8/3 = 1/3을 만드는 난이도 높은 수식입니다!", step2Hint: "8 / (3 - 8 / 3)" }
];

// ── [스도쿠 퍼즐 데이터 (12종+, 적절한 난이도 4~5개 힌트)] ──
interface SudokuPuzzle {
  solution: number[][];
  initial: number[][];
}

const SUDOKU_BASE_PUZZLES: SudokuPuzzle[] = [
  {
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ],
    initial: [
      [1, 0, 0, 0],
      [0, 4, 0, 2],
      [2, 0, 4, 0],
      [0, 0, 0, 1]
    ]
  },
  {
    solution: [
      [4, 3, 2, 1],
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3]
    ],
    initial: [
      [0, 3, 0, 0],
      [1, 0, 0, 4],
      [0, 4, 1, 0],
      [0, 0, 4, 0]
    ]
  },
  {
    solution: [
      [2, 4, 1, 3],
      [1, 3, 2, 4],
      [4, 2, 3, 1],
      [3, 1, 4, 2]
    ],
    initial: [
      [2, 0, 0, 3],
      [0, 3, 0, 0],
      [0, 0, 3, 0],
      [3, 0, 0, 2]
    ]
  },
  {
    solution: [
      [3, 1, 4, 2],
      [4, 2, 1, 3],
      [1, 3, 2, 4],
      [2, 4, 3, 1]
    ],
    initial: [
      [3, 0, 0, 0],
      [0, 2, 1, 0],
      [0, 3, 2, 0],
      [0, 0, 0, 1]
    ]
  },
  {
    solution: [
      [1, 4, 2, 3],
      [2, 3, 1, 4],
      [3, 1, 4, 2],
      [4, 2, 3, 1]
    ],
    initial: [
      [0, 4, 0, 0],
      [2, 0, 1, 0],
      [0, 1, 0, 2],
      [0, 0, 3, 0]
    ]
  },
  {
    solution: [
      [4, 1, 3, 2],
      [3, 2, 4, 1],
      [1, 4, 2, 3],
      [2, 3, 1, 4]
    ],
    initial: [
      [4, 0, 0, 2],
      [0, 2, 0, 0],
      [0, 0, 2, 0],
      [2, 0, 0, 4]
    ]
  },
  {
    solution: [
      [2, 1, 4, 3],
      [4, 3, 2, 1],
      [1, 2, 3, 4],
      [3, 4, 1, 2]
    ],
    initial: [
      [0, 1, 0, 3],
      [4, 0, 0, 0],
      [0, 0, 0, 4],
      [3, 0, 1, 0]
    ]
  },
  {
    solution: [
      [3, 4, 2, 1],
      [2, 1, 3, 4],
      [4, 3, 1, 2],
      [1, 2, 4, 3]
    ],
    initial: [
      [3, 0, 0, 1],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 0, 0, 3]
    ]
  }
];

type GameType = "menu" | "2048" | "cards" | "speedMath" | "make24" | "make10" | "sudoku";

export default function ArcadeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameType>("menu");

  // ── [1. 2048 State] ──
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver2048, setIsGameOver2048] = useState(false);
  const tileIdCounter = useRef(0);

  // ── [2. Card Game State] ──
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWonCards, setIsWonCards] = useState(false);
  const [isCheckingCards, setIsCheckingCards] = useState(false);

  // ── [3. 스피드 암산 왕 State] ──
  const [speedScore, setSpeedScore] = useState(0);
  const [speedBestScore, setSpeedBestScore] = useState(0);
  const [speedCombo, setSpeedCombo] = useState(0);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(30);
  const [speedIsActive, setSpeedIsActive] = useState(false);
  const [speedIsOver, setSpeedIsOver] = useState(false);
  const [speedQuestion, setSpeedQuestion] = useState<{ text: string; answer: number; options: number[] } | null>(null);
  const [speedFeedback, setSpeedFeedback] = useState<string | null>(null);

  // ── [4. 24 만들기 State] ──
  const [make24Mode, setMake24Mode] = useState<"easy" | "normal">("easy");
  const [make24PuzzleIndex, setMake24PuzzleIndex] = useState(0);
  const [make24Used, setMake24Used] = useState<boolean[]>([false, false, false, false]);
  const [make24Tokens, setMake24Tokens] = useState<string[]>([]);
  const [make24IsWon, setMake24IsWon] = useState(false);
  const [make24Score, setMake24Score] = useState(0);
  const [make24HintStep, setMake24HintStep] = useState<0 | 1 | 2>(0);
  const [make24Message, setMake24Message] = useState<string | null>(null);

  // ── [5. 합쳐서 10! State] ──
  const [make10Grid, setMake10Grid] = useState<Make10Tile[]>([]);
  const [make10Score, setMake10Score] = useState(0);
  const [make10BestScore, setMake10BestScore] = useState(0);
  const [make10TimeLeft, setMake10TimeLeft] = useState(60);
  const [make10IsActive, setMake10IsActive] = useState(false);
  const [make10IsOver, setMake10IsOver] = useState(false);
  const [make10Shake, setMake10Shake] = useState(false);

  // ── [6. 미니 스도쿠 State] ──
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>([]);
  const [sudokuInitial, setSudokuInitial] = useState<boolean[][]>([]);
  const [sudokuSelected, setSudokuSelected] = useState<{ r: number; c: number } | null>(null);
  const [sudokuTimer, setSudokuTimer] = useState(0);
  const [sudokuIsWon, setSudokuIsWon] = useState(false);
  const [sudokuIsActive, setSudokuIsActive] = useState(false);

  // 모달 제어 (해시감지)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#arcade") {
        setIsOpen(true);
        setActiveGame("menu");
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setActiveGame("menu");
    window.history.replaceState(null, "", window.location.pathname);
  };

  // ── [2048 Logic] ──
  const addTile = useCallback((boardTiles: Tile[]) => {
    const emptyCoords = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!boardTiles.some(t => t.row === r && t.col === c && !t.isMergedTo)) {
          emptyCoords.push({ r, c });
        }
      }
    }
    if (emptyCoords.length > 0) {
      const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
      const newTile: Tile = {
        id: `tile-${tileIdCounter.current++}-${Date.now()}`,
        value: Math.random() < 0.9 ? 2 : 4,
        row: r,
        col: c,
        isNew: true
      };
      return [...boardTiles, newTile];
    }
    return boardTiles;
  }, []);

  const init2048 = useCallback(() => {
    let initialTiles: Tile[] = [];
    initialTiles = addTile(initialTiles);
    initialTiles = addTile(initialTiles);
    setTiles(initialTiles);
    setScore(0);
    setIsGameOver2048(false);
    const savedBest = localStorage.getItem("bestScore2048");
    if (savedBest) setBestScore(parseInt(savedBest));
  }, [addTile]);

  const checkGameOver = (currentBoard: number[][]) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }
    return true;
  };

  const move2048 = useCallback((direction: "LEFT" | "RIGHT" | "UP" | "DOWN") => {
    if (isGameOver2048) return;

    let moved = false;
    let scoreGain = 0;

    const vector = {
      x: direction === "LEFT" ? -1 : direction === "RIGHT" ? 1 : 0,
      y: direction === "UP" ? -1 : direction === "DOWN" ? 1 : 0
    };

    setTiles((prevTiles) => {
      const grid: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
      const activeTiles = prevTiles.filter(t => !t.isMergedTo);
      activeTiles.forEach(t => {
        grid[t.row][t.col] = t;
      });

      const mergedIds = new Set<string>();
      const nextTiles: Tile[] = [];

      const rows = [0, 1, 2, 3];
      const cols = [0, 1, 2, 3];
      if (direction === "RIGHT") cols.reverse();
      if (direction === "DOWN") rows.reverse();

      const inBounds = (r: number, c: number) => r >= 0 && r < 4 && c >= 0 && c < 4;
      const nextGrid: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));

      for (let r of rows) {
        for (let c of cols) {
          const tile = grid[r][c];
          if (!tile) continue;

          let currR = r;
          let currC = c;
          let nextR = r + vector.y;
          let nextC = c + vector.x;

          while (inBounds(nextR, nextC) && !nextGrid[nextR][nextC]) {
            currR = nextR;
            currC = nextC;
            nextR += vector.y;
            nextC += vector.x;
          }

          let merged = false;
          if (inBounds(nextR, nextC)) {
            const hitTile = nextGrid[nextR][nextC];
            if (hitTile && hitTile.value === tile.value && !mergedIds.has(hitTile.id) && !hitTile.isMergedTo) {
              merged = true;
              mergedIds.add(hitTile.id);
              scoreGain += tile.value * 2;

              const movingTile: Tile = {
                ...tile,
                row: nextR,
                col: nextC,
                isMergedTo: hitTile.id
              };
              nextTiles.push(movingTile);

              const hitIndex = nextTiles.findIndex(t => t.id === hitTile.id);
              if (hitIndex !== -1) {
                nextTiles[hitIndex] = {
                  ...nextTiles[hitIndex],
                  value: tile.value * 2,
                  isMerged: true
                };
              }
              moved = true;
            }
          }

          if (!merged) {
            const movedTile: Tile = {
              ...tile,
              row: currR,
              col: currC
            };
            nextGrid[currR][currC] = movedTile;
            nextTiles.push(movedTile);
            if (currR !== r || currC !== c) {
              moved = true;
            }
          }
        }
      }

      if (moved) {
        let withNew = addTile(nextTiles);

        const checkBoard = Array(4).fill(null).map(() => Array(4).fill(0));
        withNew.filter(t => !t.isMergedTo).forEach(t => {
          checkBoard[t.row][t.col] = t.value;
        });

        if (checkGameOver(checkBoard)) {
          setIsGameOver2048(true);
        }

        setScore(prev => {
          const newScore = prev + scoreGain;
          setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, newScore);
            localStorage.setItem("bestScore2048", nextBest.toString());
            return nextBest;
          });
          return newScore;
        });

        setTimeout(() => {
          setTiles(current =>
            current.filter(t => !t.isMergedTo).map(t => ({ ...t, isNew: false, isMerged: false }))
          );
        }, 150);

        return withNew;
      }

      return prevTiles;
    });
  }, [isGameOver2048, addTile]);

  useEffect(() => {
    if (activeGame !== "2048") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowLeft": move2048("LEFT"); break;
        case "ArrowRight": move2048("RIGHT"); break;
        case "ArrowUp": move2048("UP"); break;
        case "ArrowDown": move2048("DOWN"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGame, move2048]);

  // ── [Card Game Logic] ──
  const initCards = () => {
    const pairEmojis = [...EMOJIS, ...EMOJIS];
    for (let i = pairEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairEmojis[i], pairEmojis[j]] = [pairEmojis[j], pairEmojis[i]];
    }

    const initialCards: Card[] = pairEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(initialCards);
    setSelectedIndices([]);
    setMoves(0);
    setIsWonCards(false);
    setIsCheckingCards(false);
  };

  const handleCardClick = (index: number) => {
    if (isCheckingCards || cards[index].isFlipped || cards[index].isMatched) return;

    const nextCards = [...cards];
    nextCards[index].isFlipped = true;
    setCards(nextCards);

    const nextSelected = [...selectedIndices, index];
    setSelectedIndices(nextSelected);

    if (nextSelected.length === 2) {
      setMoves((prev) => prev + 1);
      setIsCheckingCards(true);

      const [first, second] = nextSelected;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c, i) =>
              i === first || i === second ? { ...c, isMatched: true } : c
            );
            if (updated.every((c) => c.isMatched)) {
              setIsWonCards(true);
            }
            return updated;
          });
          setSelectedIndices([]);
          setIsCheckingCards(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === first || i === second ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedIndices([]);
          setIsCheckingCards(false);
        }, 1000);
      }
    }
  };

  // ── [3. 스피드 암산 왕 Logic] ──
  const generateSpeedQuestion = useCallback(() => {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0, b = 0, ans = 0;

    if (op === "+") {
      a = Math.floor(Math.random() * 40) + 1;
      b = Math.floor(Math.random() * 40) + 1;
      ans = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      ans = a * b;
    }

    const wrongSet = new Set<number>();
    while (wrongSet.size < 3) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const wrong = ans + offset;
      if (wrong > 0 && wrong !== ans) {
        wrongSet.add(wrong);
      }
    }
    const options = Array.from(wrongSet);
    options.push(ans);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setSpeedQuestion({ text: `${a} ${op} ${b} = ?`, answer: ans, options });
  }, []);

  const initSpeedMath = useCallback(() => {
    setSpeedScore(0);
    setSpeedCombo(0);
    setSpeedTimeLeft(30);
    setSpeedIsActive(true);
    setSpeedIsOver(false);
    setSpeedFeedback(null);
    const savedBest = localStorage.getItem("bestScoreSpeedMath");
    if (savedBest) setSpeedBestScore(parseInt(savedBest));
    generateSpeedQuestion();
  }, [generateSpeedQuestion]);

  useEffect(() => {
    if (!speedIsActive || speedTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setSpeedTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSpeedIsActive(false);
          setSpeedIsOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [speedIsActive, speedTimeLeft]);

  const handleSpeedAnswer = (chosen: number) => {
    if (!speedIsActive || !speedQuestion) return;

    if (chosen === speedQuestion.answer) {
      const earned = 100 + speedCombo * 20;
      const newScore = speedScore + earned;
      setSpeedScore(newScore);
      setSpeedCombo(prev => prev + 1);
      setSpeedFeedback(`+${earned} ${speedCombo > 0 ? `🔥 ${speedCombo + 1}연속!` : "정답!"}`);

      setSpeedBestScore(prev => {
        const nextBest = Math.max(prev, newScore);
        localStorage.setItem("bestScoreSpeedMath", nextBest.toString());
        return nextBest;
      });
    } else {
      setSpeedCombo(0);
      setSpeedFeedback("❌ 아쉽네요!");
    }
    generateSpeedQuestion();
  };

  // ── [4. 24 만들기 Logic] ──
  const getMake24Puzzles = useCallback(() => {
    return make24Mode === "easy" ? MAKE24_EASY_PUZZLES : MAKE24_NORMAL_PUZZLES;
  }, [make24Mode]);

  const initMake24 = useCallback(() => {
    const list = getMake24Puzzles();
    const nextIdx = Math.floor(Math.random() * list.length);
    setMake24PuzzleIndex(nextIdx);
    setMake24Used([false, false, false, false]);
    setMake24Tokens([]);
    setMake24IsWon(false);
    setMake24HintStep(0);
    setMake24Message(null);
  }, [getMake24Puzzles]);

  useEffect(() => {
    if (activeGame === "make24") {
      initMake24();
    }
  }, [make24Mode, activeGame, initMake24]);

  const handleMake24NumberClick = (index: number) => {
    if (make24Used[index] || make24IsWon) return;
    const currentList = getMake24Puzzles();
    const num = currentList[make24PuzzleIndex].nums[index];
    const newUsed = [...make24Used];
    newUsed[index] = true;
    setMake24Used(newUsed);
    setMake24Tokens(prev => [...prev, num.toString()]);
    setMake24Message(null);
  };

  const handleMake24OpClick = (op: string) => {
    if (make24IsWon) return;
    setMake24Tokens(prev => [...prev, op]);
    setMake24Message(null);
  };

  const handleMake24Undo = () => {
    if (make24Tokens.length === 0 || make24IsWon) return;
    const lastToken = make24Tokens[make24Tokens.length - 1];
    const newTokens = make24Tokens.slice(0, -1);
    setMake24Tokens(newTokens);
    setMake24Message(null);

    const currentList = getMake24Puzzles();
    const puzzleNums = currentList[make24PuzzleIndex].nums;
    for (let i = 0; i < 4; i++) {
      if (make24Used[i] && puzzleNums[i].toString() === lastToken) {
        const newUsed = [...make24Used];
        newUsed[i] = false;
        setMake24Used(newUsed);
        break;
      }
    }
  };

  const handleMake24Clear = () => {
    setMake24Used([false, false, false, false]);
    setMake24Tokens([]);
    setMake24Message(null);
  };

  const toggleMake24Hint = () => {
    setMake24HintStep(prev => (prev === 0 ? 1 : prev === 1 ? 2 : 0) as 0 | 1 | 2);
  };

  const evaluateMake24 = () => {
    if (!make24Used.every(Boolean)) {
      setMake24Message("⚠️ 4개 숫자를 모두 사용해야 합니다!");
      return;
    }
    const expr = make24Tokens.join(" ").replace(/×/g, "*").replace(/÷/g, "/");
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      if (Math.abs(result - 24) < 0.0001) {
        setMake24IsWon(true);
        setMake24Score(prev => prev + 100);
        setMake24Message("🎉 정답! 24가 완성되었습니다!");
      } else {
        setMake24Message(`계산 결과: ${Number(result.toFixed(2))} (24가 아닙니다)`);
      }
    } catch {
      setMake24Message("⚠️ 수식이 올바르지 않습니다!");
    }
  };

  // ── [5. 합쳐서 10! Logic] ──
  const initMake10 = useCallback(() => {
    const newGrid: Make10Tile[] = Array(16).fill(null).map((_, i) => ({
      id: `tile10-${i}-${Date.now()}`,
      val: Math.floor(Math.random() * 7) + 1,
      selected: false
    }));
    setMake10Grid(newGrid);
    setMake10Score(0);
    setMake10TimeLeft(60);
    setMake10IsActive(true);
    setMake10IsOver(false);
    setMake10Shake(false);
    const savedBest = localStorage.getItem("bestScoreMake10");
    if (savedBest) setMake10BestScore(parseInt(savedBest));
  }, []);

  useEffect(() => {
    if (!make10IsActive || make10TimeLeft <= 0) return;
    const timer = setInterval(() => {
      setMake10TimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setMake10IsActive(false);
          setMake10IsOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [make10IsActive, make10TimeLeft]);

  const handleMake10TileClick = (index: number) => {
    if (!make10IsActive) return;

    const nextGrid = make10Grid.map((t, i) =>
      i === index ? { ...t, selected: !t.selected } : t
    );
    setMake10Grid(nextGrid);

    const selected = nextGrid.filter(t => t.selected);
    const currentSum = selected.reduce((sum, t) => sum + t.val, 0);

    if (currentSum === 10) {
      const gained = selected.length * 100;
      const newScore = make10Score + gained;
      setMake10Score(newScore);

      setMake10BestScore(prev => {
        const nextBest = Math.max(prev, newScore);
        localStorage.setItem("bestScoreMake10", nextBest.toString());
        return nextBest;
      });

      setTimeout(() => {
        setMake10Grid(prev =>
          prev.map(t =>
            t.selected
              ? { id: `tile10-${Math.random()}`, val: Math.floor(Math.random() * 7) + 1, selected: false }
              : t
          )
        );
      }, 150);
    } else if (currentSum > 10) {
      setMake10Shake(true);
      setTimeout(() => {
        setMake10Grid(prev => prev.map(t => ({ ...t, selected: false })));
        setMake10Shake(false);
      }, 400);
    }
  };

  // ── [6. 미니 스도쿠 Logic (퍼즐 치환 수열 생성 & 2x2 서브블록 구분)] ──
  const checkSudokuConflicts = (board: number[][]) => {
    const conflicts = Array(4).fill(null).map(() => Array(4).fill(false));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val === 0) continue;
        for (let i = 0; i < 4; i++) {
          if (i !== c && board[r][i] === val) conflicts[r][c] = true;
          if (i !== r && board[i][c] === val) conflicts[r][c] = true;
        }
        const startR = Math.floor(r / 2) * 2;
        const startC = Math.floor(c / 2) * 2;
        for (let br = startR; br < startR + 2; br++) {
          for (let bc = startC; bc < startC + 2; bc++) {
            if ((br !== r || bc !== c) && board[br][bc] === val) {
              conflicts[r][c] = true;
            }
          }
        }
      }
    }
    return conflicts;
  };

  // 랜덤 숫자 순열 매핑으로 끝없는 퍼즐 변형 생성
  const permuteSudoku = (puzzle: SudokuPuzzle): SudokuPuzzle => {
    const digits = [1, 2, 3, 4];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    const map = (val: number) => (val === 0 ? 0 : digits[val - 1]);

    return {
      solution: puzzle.solution.map(row => row.map(map)),
      initial: puzzle.initial.map(row => row.map(map))
    };
  };

  const initSudoku = useCallback(() => {
    const baseP = SUDOKU_BASE_PUZZLES[Math.floor(Math.random() * SUDOKU_BASE_PUZZLES.length)];
    const p = permuteSudoku(baseP);

    const boardCopy = p.initial.map(row => [...row]);
    const initMap = p.initial.map(row => row.map(cell => cell !== 0));
    setSudokuBoard(boardCopy);
    setSudokuInitial(initMap);
    setSudokuSelected(null);
    setSudokuTimer(0);
    setSudokuIsWon(false);
    setSudokuIsActive(true);
  }, []);

  useEffect(() => {
    if (!sudokuIsActive || sudokuIsWon) return;
    const interval = setInterval(() => {
      setSudokuTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sudokuIsActive, sudokuIsWon]);

  const handleSudokuNumInput = (num: number) => {
    if (!sudokuSelected || !sudokuIsActive || sudokuIsWon) return;
    const { r, c } = sudokuSelected;
    if (sudokuInitial[r][c]) return;

    const nextBoard = sudokuBoard.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setSudokuBoard(nextBoard);

    const conflicts = checkSudokuConflicts(nextBoard);
    const hasConflict = conflicts.some(row => row.some(b => b));
    const isFilled = nextBoard.every(row => row.every(val => val !== 0));

    if (isFilled && !hasConflict) {
      setSudokuIsWon(true);
    }
  };

  const getTileBg = (value: number) => {
    switch (value) {
      case 2: return "bg-slate-200 text-slate-800";
      case 4: return "bg-slate-300 text-slate-800";
      case 8: return "bg-orange-400 text-white";
      case 16: return "bg-orange-500 text-white font-bold";
      case 32: return "bg-rose-400 text-white font-bold";
      case 64: return "bg-rose-500 text-white font-bold";
      case 128: return "bg-amber-300 text-slate-900 font-bold text-lg shadow-lg shadow-amber-300/20";
      case 256: return "bg-amber-400 text-slate-900 font-bold text-lg shadow-lg shadow-amber-400/30 animate-pulse";
      case 512: return "bg-yellow-300 text-slate-900 font-bold text-lg shadow-lg shadow-yellow-300/40";
      case 1024: return "bg-yellow-400 text-slate-900 font-bold text-lg shadow-lg shadow-yellow-400/50";
      case 2048: return "bg-emerald-400 text-white font-black text-xl shadow-lg shadow-emerald-400/60 animate-bounce";
      default: return "bg-slate-500 text-white font-black";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={closeModal} />

      <div className="glass relative w-full max-w-2xl max-h-[90vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        {/* 상단바 */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕹️</span>
            <h2 className="text-xl font-bold text-white">정찬T네 오락실</h2>
          </div>
          <div className="flex items-center gap-3">
            {activeGame !== "menu" && (
              <button
                onClick={() => setActiveGame("menu")}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl font-bold transition-all"
              >
                ◀ 다른게임
              </button>
            )}
            <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>

        {/* 바디 */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center min-h-[440px]">
          {activeGame === "menu" && (
            /* ── [메뉴 화면] ── */
            <div className="space-y-6 animate-fade-in text-center">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">🎮 게임 선택</h3>
                <p className="text-xs text-slate-400">교실에서 친구들과 가볍게 즐길 수 있는 미니게임 모음입니다!</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
                <button
                  onClick={() => { setActiveGame("2048"); init2048(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl shadow-indigo-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl group-hover:scale-110 transition-transform">🧩</div>
                  <h3 className="text-sm font-bold text-white">2048</h3>
                  <p className="text-[11px] text-slate-400">타일 합치기</p>
                </button>

                <button
                  onClick={() => { setActiveGame("cards"); initCards(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl shadow-emerald-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl group-hover:scale-110 transition-transform">🃏</div>
                  <h3 className="text-sm font-bold text-white">카드 뒤집기</h3>
                  <p className="text-[11px] text-slate-400">기억력 짝맞추기</p>
                </button>

                <button
                  onClick={() => { setActiveGame("speedMath"); initSpeedMath(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl shadow-amber-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-2xl group-hover:scale-110 transition-transform">⚡</div>
                  <h3 className="text-sm font-bold text-white">스피드 암산 왕</h3>
                  <p className="text-[11px] text-slate-400">30초 연산 퀴즈</p>
                </button>

                <button
                  onClick={() => { setActiveGame("make24"); initMake24(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl shadow-cyan-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-2xl group-hover:scale-110 transition-transform">🔢</div>
                  <h3 className="text-sm font-bold text-white">24 만들기</h3>
                  <p className="text-[11px] text-slate-400">사칙연산 24 퍼즐</p>
                </button>

                <button
                  onClick={() => { setActiveGame("make10"); initMake10(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-xl shadow-rose-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-2xl group-hover:scale-110 transition-transform">💣</div>
                  <h3 className="text-sm font-bold text-white">합쳐서 10!</h3>
                  <p className="text-[11px] text-slate-400">합10 팝업 터뜨리기</p>
                </button>

                <button
                  onClick={() => { setActiveGame("sudoku"); initSudoku(); }}
                  className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-xl shadow-purple-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl group-hover:scale-110 transition-transform">🧩</div>
                  <h3 className="text-sm font-bold text-white">미니 스도쿠</h3>
                  <p className="text-[11px] text-slate-400">4x4 논리 스도쿠</p>
                </button>
              </div>
            </div>
          )}

          {activeGame === "2048" && (
            /* ── [2048 게임 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full">
              <div className="flex gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                  <p className="text-lg font-black text-white">{score}</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Best</p>
                  <p className="text-lg font-black text-amber-400">{bestScore}</p>
                </div>
                <button
                  onClick={init2048}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  다시 시작
                </button>
              </div>

              <div className="relative bg-slate-900 p-4 rounded-3xl border border-white/10 shadow-2xl w-full max-w-[340px] aspect-square">
                <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-[4%] pointer-events-none">
                  {Array(16).fill(null).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-slate-800/40 border border-white/5 w-full h-full"
                    />
                  ))}
                </div>

                <div className="absolute inset-4">
                  {tiles.map((tile) => (
                    <div
                      key={tile.id}
                      className={`absolute w-[22%] h-[22%] rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-150 ${getTileBg(tile.value)} ${tile.isNew ? "animate-pop" : ""} ${tile.isMerged ? "scale-110" : ""}`}
                      style={{
                        left: `${tile.col * 26}%`,
                        top: `${tile.row * 26}%`,
                      }}
                    >
                      {tile.value}
                    </div>
                  ))}
                </div>

                {isGameOver2048 && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                    <span className="text-4xl mb-2">💀</span>
                    <h3 className="text-xl font-black text-white mb-1">게임 오버!</h3>
                    <p className="text-sm text-slate-400 mb-6">아쉽게도 합칠 수 있는 블록이 없습니다.</p>
                    <button
                      onClick={init2048}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-2xl text-base shadow-lg transition-all"
                    >
                      다시 도전하기
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11px] text-slate-500 text-center">
                키보드 방향키(↑ ↓ ← →)를 누르면 블록들이 부드럽게 이동합니다.
              </p>

              <div className="mt-6 flex flex-col items-center gap-1 sm:hidden">
                <button onClick={() => move2048("UP")} className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl flex items-center justify-center text-white">▲</button>
                <div className="flex gap-4">
                  <button onClick={() => move2048("LEFT")} className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl flex items-center justify-center text-white">◀</button>
                  <div className="w-12" />
                  <button onClick={() => move2048("RIGHT")} className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl flex items-center justify-center text-white">▶</button>
                </div>
                <button onClick={() => move2048("DOWN")} className="w-12 h-12 bg-white/10 active:bg-white/20 rounded-xl flex items-center justify-center text-white">▼</button>
              </div>
            </div>
          )}

          {activeGame === "cards" && (
            /* ── [카드 뒤집기 게임 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full">
              <div className="flex justify-between items-center w-full max-w-[340px] mb-4">
                <p className="text-sm font-bold text-slate-400">시도 횟수: <span className="text-white text-base">{moves}</span></p>
                <button
                  onClick={initCards}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                >
                  다시 시작
                </button>
              </div>

              <div className="relative w-full max-w-[340px] grid grid-cols-4 gap-3 aspect-square">
                {cards.map((card, index) => {
                  const isShown = card.isFlipped || card.isMatched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(index)}
                      className={`relative w-full h-full aspect-square perspective-1000 ${
                        card.isMatched
                          ? "opacity-50 cursor-default scale-95"
                          : "cursor-pointer active:scale-95"
                      }`}
                    >
                      <div className={`w-full h-full rounded-2xl border transition-all duration-500 transform-style-3d ${
                        isShown
                          ? "border-emerald-500/20 bg-emerald-500/10 rotate-y-180"
                          : "border-white/10 bg-gradient-to-br from-slate-800 to-slate-900"
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl backface-hidden rotate-y-180 bg-emerald-500/10 rounded-2xl">
                          {card.emoji}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-black text-xl backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl">
                          ❓
                        </div>
                      </div>
                    </button>
                  );
                })}

                {isWonCards && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                    <span className="text-5xl mb-3 animate-bounce">🎉</span>
                    <h3 className="text-2xl font-black text-white mb-1">성공! 축하합니다!</h3>
                    <p className="text-sm text-slate-400 mb-6">총 {moves}번 만에 모든 카드의 짝을 맞췄습니다.</p>
                    <button
                      onClick={initCards}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-2xl text-base shadow-lg transition-all"
                    >
                      한 판 더 하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeGame === "speedMath" && (
            /* ── [3. 스피드 암산 왕 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full max-w-md mx-auto">
              <div className="flex justify-between items-center w-full mb-6 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">SCORE</p>
                  <p className="text-xl font-black text-amber-400">{speedScore}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-center">TIME</p>
                  <p className={`text-xl font-black ${speedTimeLeft <= 5 ? "text-rose-500 animate-ping" : "text-white"}`}>
                    ⏱️ {speedTimeLeft}초
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-right">BEST</p>
                  <p className="text-xl font-black text-emerald-400 text-right">{speedBestScore}</p>
                </div>
              </div>

              {speedFeedback && (
                <div className="text-xs font-bold text-amber-300 mb-2 h-4 animate-fade-in">
                  {speedFeedback}
                </div>
              )}

              {speedIsActive && speedQuestion && (
                <div className="w-full flex flex-col items-center gap-6">
                  {/* 문제 수식 카드 */}
                  <div className="w-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-8 rounded-3xl text-center shadow-xl">
                    <span className="text-3xl font-black text-white tracking-widest">{speedQuestion.text}</span>
                  </div>

                  {/* 4지 선다 보기 버튼 */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {speedQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSpeedAnswer(opt)}
                        className="bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-400/50 border border-white/10 text-white font-bold py-4 rounded-2xl text-xl transition-all active:scale-95 shadow-md"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {speedIsOver && (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 text-center w-full animate-fade-in">
                  <span className="text-4xl mb-2 inline-block">🏆</span>
                  <h3 className="text-xl font-black text-white mb-1">타임 아웃!</h3>
                  <p className="text-sm text-slate-400 mb-4">최종 획득 점수: <span className="text-amber-400 font-bold text-lg">{speedScore}점</span></p>
                  <button
                    onClick={initSpeedMath}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black px-6 py-3 rounded-2xl text-base shadow-lg transition-all"
                  >
                    다시 도전하기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeGame === "make24" && (
            /* ── [4. 24 만들기 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full max-w-md mx-auto">
              <div className="flex justify-between items-center w-full mb-4">
                {/* 난이도 선택 토글 */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 gap-1">
                  <button
                    onClick={() => setMake24Mode("easy")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      make24Mode === "easy"
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🟢 쉬움 모드
                  </button>
                  <button
                    onClick={() => setMake24Mode("normal")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      make24Mode === "normal"
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🔴 일반 모드
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleMake24Hint}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                  >
                    💡 힌트 {make24HintStep > 0 ? `(${make24HintStep}/2단계)` : ""}
                  </button>
                  <button
                    onClick={initMake24}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                  >
                    새 문제
                  </button>
                </div>
              </div>

              {make24HintStep === 1 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 text-center mb-4 w-full animate-fade-in">
                  💡 1단계 힌트: <span className="font-bold text-white">{getMake24Puzzles()[make24PuzzleIndex].step1Hint}</span>
                </div>
              )}

              {make24HintStep === 2 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 text-center mb-4 w-full animate-fade-in">
                  💡 2단계 (완정 수식): <span className="font-bold text-white">{getMake24Puzzles()[make24PuzzleIndex].step2Hint}</span>
                </div>
              )}

              {/* 4개 지정 숫자 카카오 칩 */}
              <div className="flex justify-center gap-3 w-full mb-6">
                {getMake24Puzzles()[make24PuzzleIndex].nums.map((num, i) => (
                  <button
                    key={i}
                    disabled={make24Used[i]}
                    onClick={() => handleMake24NumberClick(i)}
                    className={`w-14 h-14 rounded-2xl text-2xl font-black transition-all shadow-lg ${
                      make24Used[i]
                        ? "bg-slate-800 text-slate-600 border border-slate-700 opacity-40 cursor-not-allowed scale-95"
                        : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border border-cyan-300/40 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 입력 수식 창 */}
              <div className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-center min-h-[60px] flex items-center justify-center mb-4 shadow-inner">
                <span className="text-xl font-bold text-cyan-300 tracking-wider">
                  {make24Tokens.length > 0 ? make24Tokens.join(" ") : "숫자와 연산자를 눌러 수식을 완성하세요"}
                </span>
              </div>

              {make24Message && (
                <div className="text-xs font-bold text-amber-300 mb-3 text-center">
                  {make24Message}
                </div>
              )}

              {/* 연산자 패드 및 기능 버튼 */}
              <div className="w-full grid grid-cols-6 gap-2 mb-4">
                {["+", "-", "×", "÷", "(", ")"].map((op) => (
                  <button
                    key={op}
                    onClick={() => handleMake24OpClick(op)}
                    className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold py-3 rounded-xl text-lg transition-all active:scale-95"
                  >
                    {op}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={handleMake24Undo}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-xs transition-all"
                >
                  ↩ 실행 취소
                </button>
                <button
                  onClick={handleMake24Clear}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-xs transition-all"
                >
                  🧹 전체 지우기
                </button>
                <button
                  onClick={evaluateMake24}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-3 rounded-xl text-xs transition-all shadow-md"
                >
                  = 계산하기
                </button>
              </div>
            </div>
          )}

          {activeGame === "make10" && (
            /* ── [5. 합쳐서 10! 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full max-w-md mx-auto">
              <div className="flex justify-between items-center w-full mb-4 bg-slate-900/60 p-3 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">SCORE</p>
                  <p className="text-lg font-black text-rose-400">{make10Score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-center">선택 합계</p>
                  <p className="text-xl font-black text-white text-center">
                    {make10Grid.filter(t => t.selected).reduce((s, t) => s + t.val, 0)} / 10
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-right">TIME</p>
                  <p className="text-lg font-black text-amber-400 text-right">⏱️ {make10TimeLeft}초</p>
                </div>
              </div>

              {/* 4x4 퍼즐 그리드 */}
              <div className={`grid grid-cols-4 gap-3 w-full max-w-[320px] aspect-square p-3 bg-slate-900 rounded-3xl border border-white/10 ${make10Shake ? "animate-bounce" : ""}`}>
                {make10Grid.map((tile, i) => (
                  <button
                    key={tile.id}
                    onClick={() => handleMake10TileClick(i)}
                    className={`w-full h-full rounded-2xl text-2xl font-black transition-all flex items-center justify-center ${
                      tile.selected
                        ? "bg-rose-500 text-white border-2 border-white scale-105 shadow-lg shadow-rose-500/40"
                        : "bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700"
                    }`}
                  >
                    {tile.val}
                  </button>
                ))}
              </div>

              {make10IsOver && (
                <div className="mt-4 bg-slate-900 border border-white/10 rounded-3xl p-6 text-center w-full animate-fade-in">
                  <span className="text-4xl mb-2 inline-block">💣</span>
                  <h3 className="text-xl font-black text-white mb-1">게임 완료!</h3>
                  <p className="text-sm text-slate-400 mb-4">최종 점수: <span className="text-rose-400 font-bold text-lg">{make10Score}점</span></p>
                  <button
                    onClick={initMake10}
                    className="bg-rose-500 hover:bg-rose-400 text-white font-black px-6 py-3 rounded-2xl text-base shadow-lg transition-all"
                  >
                    다시 하기
                  </button>
                </div>
              )}
            </div>
          )}

          {activeGame === "sudoku" && (
            /* ── [6. 미니 스도쿠 화면 (2x2 서브블록 명확 구분)] ── */
            <div className="animate-fade-in flex flex-col items-center w-full max-w-md mx-auto">
              <div className="flex justify-between items-center w-full mb-4">
                <p className="text-sm font-bold text-slate-400">진행 시간: <span className="text-white text-base">⏱️ {sudokuTimer}초</span></p>
                <button
                  onClick={initSudoku}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                >
                  새 퍼즐
                </button>
              </div>

              {/* 4x4 스도쿠 그리드 - 2x2 서브블록 4개 구조로 명확히 분리 */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-3xl border-2 border-purple-500/40 max-w-[300px] w-full aspect-square mb-4 shadow-2xl">
                {[0, 1].map((br) =>
                  [0, 1].map((bc) => (
                    <div
                      key={`${br}-${bc}`}
                      className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-purple-500/30 shadow-inner"
                    >
                      {[0, 1].map((rOffset) =>
                        [0, 1].map((cOffset) => {
                          const r = br * 2 + rOffset;
                          const c = bc * 2 + cOffset;
                          const val = sudokuBoard[r]?.[c] ?? 0;
                          const isInit = sudokuInitial[r]?.[c];
                          const isSel = sudokuSelected?.r === r && sudokuSelected?.c === c;
                          const conflicts = checkSudokuConflicts(sudokuBoard);
                          const isConf = conflicts[r]?.[c];

                          return (
                            <button
                              key={`${r}-${c}`}
                              onClick={() => !isInit && setSudokuSelected({ r, c })}
                              className={`w-full h-full text-xl font-black rounded-xl flex items-center justify-center transition-all aspect-square ${
                                isInit
                                  ? "bg-slate-800/90 text-purple-300 font-bold cursor-not-allowed border border-purple-500/20"
                                  : isSel
                                  ? "bg-purple-500 text-white ring-2 ring-white shadow-lg shadow-purple-500/50"
                                  : isConf
                                  ? "bg-rose-500/40 text-rose-200 border border-rose-400 animate-pulse"
                                  : val !== 0
                                  ? "bg-slate-800 text-purple-200 border border-white/10"
                                  : "bg-slate-900/60 text-slate-600 border border-white/5 hover:bg-white/10"
                              }`}
                            >
                              {val !== 0 ? val : ""}
                            </button>
                          );
                        })
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 숫자 입력 키패드 */}
              <div className="flex gap-2 w-full max-w-[300px]">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSudokuNumInput(n)}
                    className="flex-1 bg-purple-600/30 hover:bg-purple-600/60 border border-purple-400/30 text-white font-black py-3 rounded-xl text-lg transition-all active:scale-95"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleSudokuNumInput(0)}
                  className="bg-white/10 hover:bg-white/20 text-slate-300 font-bold px-3 py-3 rounded-xl text-xs"
                >
                  지우기
                </button>
              </div>

              {sudokuIsWon && (
                <div className="mt-4 bg-slate-900 border border-purple-500/40 rounded-3xl p-6 text-center w-full animate-fade-in">
                  <span className="text-4xl mb-2 inline-block">🎉</span>
                  <h3 className="text-xl font-black text-white mb-1">스도쿠 성공!</h3>
                  <p className="text-sm text-slate-400 mb-4">완성 시간: <span className="text-purple-400 font-bold">{sudokuTimer}초</span></p>
                  <button
                    onClick={initSudoku}
                    className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-2xl text-base shadow-lg transition-all"
                  >
                    다음 퍼즐하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
