"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

declare global {
  interface Window {
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
    katex?: any;
  }
}

const sampleQuestions = [
  "📐 이차방정식 근의 공식 공식 알려줘",
  "📐 피타고라스 정리 쉬운 예시 알려줘",
  "📐 미분과 적분의 차이가 뭐야?",
  "📐 삼각비 Sin, Cos, Tan 개념 설명해줘",
];

export default function MathChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕! 수학교사 정찬T의 **AI 수학 조교**야 📐✨\n수학 문제, 개념, 공식이나 풀이 과정에 대해 무엇이든 편하게 물어봐! 수식은 **LaTeX($...$)** 포맷으로 선명하게 표시돼.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // KaTeX 스크립트 로드
  useEffect(() => {
    if (!document.getElementById("katex-script")) {
      const script = document.createElement("script");
      script.id = "katex-script";
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
      script.async = true;
      document.body.appendChild(script);

      const renderScript = document.createElement("script");
      renderScript.id = "katex-render-script";
      renderScript.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/auto-render.min.js";
      renderScript.async = true;
      document.body.appendChild(renderScript);
    }
  }, []);

  // 메시지 업데이트 시 KaTeX 수학 수식 자동 렌더링
  useEffect(() => {
    const triggerKaTeX = () => {
      if (chatContainerRef.current && window.renderMathInElement) {
        window.renderMathInElement(chatContainerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      }
    };

    const timer = setTimeout(triggerKaTeX, 100);
    return () => clearTimeout(timer);
  }, [messages, isOpen, loading]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#math-chat") {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const closeModal = () => {
    setIsOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const apiPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/math-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ 오류가 발생했습니다: ${data.error || "답변을 가져오지 못했습니다."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ 네트워크 연결 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("대화 내역을 초기화하시겠습니까?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "대화 내역이 초기화되었습니다! 궁금한 수학 문제를 다시 질문해 보세요 📐✨",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={closeModal}
      />

      {/* 모달 컨테이너 */}
      <div className="glass relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 animate-fade-in-up">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl text-white shadow-md">
              📐
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>정찬T의 AI 수학 챗봇</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                  GPT-4o
                </span>
              </h2>
              <p className="text-xs text-slate-400">수학 풀이, 개념, 공식 질문 24시간 실시간 답변</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="대화 초기화"
            >
              초기화 🔄
            </button>
            <button
              onClick={closeModal}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white text-xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* 대화 영역 */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`flex max-w-[85%] gap-3 rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-500/10"
                    : "bg-slate-900/80 border border-white/10 text-slate-100 rounded-bl-none shadow-md backdrop-blur-md"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="text-xl shrink-0 mt-0.5">📐</span>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {m.content}
                </div>
              </div>
              <span className="mt-1 px-1 text-[10px] text-slate-500">
                {m.timestamp}
              </span>
            </div>
          ))}

          {/* 로딩 표시 */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-white/10 bg-slate-900/80 p-4 text-sm text-indigo-300">
                <span className="animate-spin text-lg">📐</span>
                <span className="animate-pulse">정찬T AI 조교가 답안을 작성하는 중입니다...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 추천 질문 칩 */}
        <div className="border-t border-white/5 bg-slate-900/40 px-6 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-[11px] font-bold text-indigo-400 shrink-0">추천 질문:</span>
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q.replace("📐 ", ""))}
                disabled={loading}
                className="shrink-0 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200 transition-all hover:bg-indigo-500/30 hover:text-white disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 입력 폼 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-3 border-t border-white/10 bg-slate-900/90 p-4 backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="수학 질문이나 풀고 싶은 문제를 입력하세요... (예: 이차방정식 x^2 - 4x + 4 = 0 풀이해줘)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <span>질문 전송</span>
            <span>🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
}
