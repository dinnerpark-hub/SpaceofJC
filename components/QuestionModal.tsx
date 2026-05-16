"use client";
import { useState, useEffect } from "react";

interface Question { id: string; content: string; answer: string | null; timestamp: string; }

export default function QuestionModal() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const fetchData = async () => {
    try { const r = await fetch("/api/questions"); if (r.ok) setQuestions(await r.json()); } catch (e) {}
  };

  useEffect(() => {
    const h = () => { if (window.location.hash === "#questions") { setIsOpen(true); fetchData(); } else setIsOpen(false); };
    window.addEventListener("hashchange", h); h();
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const close = () => { setIsOpen(false); setIsAuthRequired(false); setPassword(""); setAnsweringId(null); window.history.replaceState(null, "", window.location.pathname); };
  const handleAuth = (e: React.FormEvent) => { e.preventDefault(); if (password === "1025") { setIsAuth(true); setIsAuthRequired(false); setPassword(""); if (pendingAction) { pendingAction(); setPendingAction(null); } } else { alert("비밀번호가 틀렸습니다."); setPassword(""); } };
  const runWithAuth = (action: () => void) => { if (isAuth) action(); else { setPendingAction(() => action); setIsAuthRequired(true); } };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try { const r = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: newQuestion }) }); if (r.ok) { setNewQuestion(""); fetchData(); alert("질문이 등록되었습니다!"); } } catch (e) { alert("오류"); }
  };

  const submitAnswer = async (id: string) => {
    try { await fetch(`/api/questions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer: answerText }) }); setAnsweringId(null); setAnswerText(""); fetchData(); } catch (e) { alert("오류"); }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try { await fetch(`/api/questions/${id}`, { method: "DELETE" }); fetchData(); } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
      <div className="glass relative w-full max-w-2xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">💬 익명 질문함</h2>
          <button onClick={close} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isAuthRequired ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="mb-6 h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">관리자 인증</h3>
              <form onSubmit={handleAuth} className="flex gap-2 w-full max-w-xs">
                <input type="password" placeholder="비밀번호" autoFocus value={password} onChange={e => setPassword(e.target.value)} className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 text-white outline-none focus:border-indigo-500" />
                <button type="submit" className="bg-indigo-500 px-6 rounded-xl font-bold text-white">확인</button>
              </form>
              <button onClick={() => setIsAuthRequired(false)} className="mt-4 text-xs text-slate-500">돌아가기</button>
            </div>
          ) : (
            <>
              <form onSubmit={submitQuestion} className="flex gap-2 mb-6">
                <input type="text" placeholder="익명으로 질문하기..." value={newQuestion} onChange={e => setNewQuestion(e.target.value)} className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-emerald-500 text-sm" />
                <button type="submit" className="bg-emerald-500 px-5 rounded-xl font-bold text-white text-sm hover:bg-emerald-400">전송</button>
              </form>
              {questions.length === 0 ? (
                <p className="py-10 text-center text-slate-500">아직 질문이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map(q => (
                    <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start">
                        <p className="text-white text-sm font-medium">{q.content}</p>
                        <div className="flex gap-2 ml-2 shrink-0">
                          {!q.answer && <button onClick={() => runWithAuth(() => { setAnsweringId(q.id); setAnswerText(""); })} className="text-[10px] text-emerald-400 hover:underline">답변</button>}
                          <button onClick={() => runWithAuth(() => deleteQuestion(q.id))} className="text-[10px] text-slate-600 hover:text-red-400">삭제</button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">{new Date(q.timestamp).toLocaleDateString()}</p>
                      {q.answer && <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><p className="text-xs text-emerald-300"><span className="font-bold">정찬T:</span> {q.answer}</p></div>}
                      {answeringId === q.id && (
                        <div className="mt-3 flex gap-2">
                          <input type="text" placeholder="답변 입력..." value={answerText} onChange={e => setAnswerText(e.target.value)} className="flex-1 rounded-lg bg-white/5 border border-white/10 p-2 text-white text-xs outline-none" autoFocus />
                          <button onClick={() => submitAnswer(q.id)} className="bg-emerald-500 px-3 rounded-lg text-xs font-bold text-white">등록</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
