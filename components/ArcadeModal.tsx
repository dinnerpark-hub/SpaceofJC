"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* =======================================================
   ArcadeModal 컴포넌트 (오락실)
   - 2048 게임 및 카드 뒤집기(메모리 게임) 수록
   - 해시(#arcade) 감지로 팝업 작동
   ======================================================= */

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🥑", "🍍"];

export default function ArcadeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<"menu" | "2048" | "cards">("menu");

  // ── [2048 State] ──
  const [board, setBoard] = useState<number[][]>(Array(4).fill(null).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver2048, setIsGameOver2048] = useState(false);

  // ── [Card Game State] ──
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWonCards, setIsWonCards] = useState(false);
  const [isCheckingCards, setIsCheckingCards] = useState(false);

  // 모달 제어
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
  const addRandomTile = useCallback((currentBoard: number[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }, []);

  const init2048 = useCallback(() => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsGameOver2048(false);
    const savedBest = localStorage.getItem("bestScore2048");
    if (savedBest) setBestScore(parseInt(savedBest));
  }, [addRandomTile]);

  // 한 행 밀기 로직
  const slide = (row: number[]) => {
    let arr = row.filter((val) => val !== 0);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
  };

  // 한 행 합치기 로직
  const merge = (row: number[], addScore: (val: number) => void) => {
    for (let i = 0; i < 3; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] = row[i] * 2;
        addScore(row[i]);
        row[i + 1] = 0;
      }
    }
    return row;
  };

  // 게임 오버 체크
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

    setBoard((prevBoard) => {
      let nextBoard = prevBoard.map((row) => [...row]);
      let localScoreAddition = 0;

      const addLocalScore = (val: number) => {
        localScoreAddition += val;
      };

      // 회전/변환 헬퍼
      const rotateLeft = (matrix: number[][]) => {
        return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex])).reverse();
      };

      let rotations = 0;
      if (direction === "UP") rotations = 1;
      else if (direction === "RIGHT") rotations = 2;
      else if (direction === "DOWN") rotations = 3;

      for (let i = 0; i < rotations; i++) {
        nextBoard = rotateLeft(nextBoard);
      }

      // 왼쪽 슬라이드 + 합치기
      for (let r = 0; r < 4; r++) {
        nextBoard[r] = slide(nextBoard[r]);
        nextBoard[r] = merge(nextBoard[r], addLocalScore);
        nextBoard[r] = slide(nextBoard[r]);
      }

      // 원래대로 회전 복구
      const restoreRotations = (4 - rotations) % 4;
      for (let i = 0; i < restoreRotations; i++) {
        nextBoard = rotateLeft(nextBoard);
      }

      // 움직임이 있었는지 체크
      let boardChanged = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (nextBoard[r][c] !== prevBoard[r][c]) {
            boardChanged = true;
            break;
          }
        }
      }

      if (boardChanged) {
        addRandomTile(nextBoard);
        setScore((prev) => {
          const newScore = prev + localScoreAddition;
          setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, newScore);
            localStorage.setItem("bestScore2048", nextBest.toString());
            return nextBest;
          });
          return newScore;
        });

        if (checkGameOver(nextBoard)) {
          setIsGameOver2048(true);
        }
      }

      return nextBoard;
    });
  }, [isGameOver2048, addRandomTile]);

  // 키보드 리스너 등록
  useEffect(() => {
    if (activeGame !== "2048") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); // 스크롤 방지
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


  // ── [카드 뒤집기 Logic] ──
  const initCards = () => {
    const pairEmojis = [...EMOJIS, ...EMOJIS];
    // 피셔-예이츠 셔플
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
        // 일치
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c, i) =>
              i === first || i === second ? { ...c, isMatched: true } : c
            );
            // 전체 매칭 완료 체크
            if (updated.every((c) => c.isMatched)) {
              setIsWonCards(true);
            }
            return updated;
          });
          setSelectedIndices([]);
          setIsCheckingCards(false);
        }, 500);
      } else {
        // 불일치 - 원상 복구
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


  // ── [2048 타일 색상 반환 함수] ──
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

      <div className="glass relative w-full max-w-xl max-h-[90vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        {/* 상단바 */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center min-h-[400px]">
          {activeGame === "menu" && (
            /* ── [메뉴 화면] ── */
            <div className="space-y-6 animate-fade-in text-center">
              <p className="text-sm text-slate-400">교실에서 가볍게 즐길 수 있는 미니 게임입니다!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <button
                  onClick={() => { setActiveGame("2048"); init2048(); }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl group-hover:scale-110 transition-transform">🧩</div>
                  <h3 className="text-base font-bold text-white">2048</h3>
                  <p className="text-xs text-slate-400">숫자를 병합해 2048 만들기</p>
                </button>

                <button
                  onClick={() => { setActiveGame("cards"); initCards(); }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl group-hover:scale-110 transition-transform">🃏</div>
                  <h3 className="text-base font-bold text-white">카드 뒤집기</h3>
                  <p className="text-xs text-slate-400">기억력을 발휘해 짝을 맞추기</p>
                </button>
              </div>
            </div>
          )}

          {activeGame === "2048" && (
            /* ── [2048 게임 화면] ── */
            <div className="animate-fade-in flex flex-col items-center w-full">
              {/* 스코어보드 */}
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

              {/* 보드 */}
              <div className="relative bg-slate-900 p-4 rounded-3xl border border-white/10 shadow-2xl w-full max-w-[340px] aspect-square flex flex-col justify-between">
                {Array(4).fill(null).map((_, r) => (
                  <div key={r} className="flex justify-between w-full h-[22%]">
                    {Array(4).fill(null).map((_, c) => {
                      const value = board[r][c];
                      return (
                        <div
                          key={c}
                          className={`w-[22%] h-full rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-100 ${
                            value === 0 ? "bg-slate-800/40 border border-white/5 text-transparent" : getTileBg(value)
                          }`}
                        >
                          {value !== 0 && value}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* 게임오버 레이어 */}
                {isGameOver2048 && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
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

              {/* 조작 설명 */}
              <p className="mt-4 text-[11px] text-slate-500 text-center">
                키보드 방향키(↑ ↓ ← →)를 누르면 블록들이 이동합니다.
              </p>

              {/* 모바일 화면용 가상 조이패드 */}
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

              {/* 카드 그리드 */}
              <div className="relative w-full max-w-[340px] grid grid-cols-4 gap-3 aspect-square">
                {cards.map((card, index) => {
                  const isShown = card.isFlipped || card.isMatched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(index)}
                      className={`relative w-full h-full rounded-2xl transition-all duration-300 perspective-1000 ${
                        card.isMatched
                          ? "opacity-50 cursor-default scale-95"
                          : "cursor-pointer active:scale-95"
                      }`}
                    >
                      {/* 카드 바깥 테두리 및 3D 플립 스타일 처리 */}
                      <div className={`w-full h-full rounded-2xl border transition-all duration-500 transform-style-3d ${
                        isShown
                          ? "border-emerald-500/20 bg-emerald-500/10 rotate-y-180"
                          : "border-white/10 bg-gradient-to-br from-slate-800 to-slate-900"
                      }`}>
                        {/* 앞면 (뒤집혔을 때 혹은 매칭 시) */}
                        <div className={`absolute inset-0 flex items-center justify-center text-3xl backface-hidden rotate-y-180 ${
                          isShown ? "block" : "hidden"
                        }`}>
                          {card.emoji}
                        </div>

                        {/* 뒷면 (초기 상태) */}
                        <div className={`absolute inset-0 flex items-center justify-center text-slate-500 font-black text-xl backface-hidden ${
                          isShown ? "hidden" : "block"
                        }`}>
                          ❓
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* 성공 레이어 */}
                {isWonCards && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
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
        </div>
      </div>
    </div>
  );
}
