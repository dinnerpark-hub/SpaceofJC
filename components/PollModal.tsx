"use client";
import { useState, useEffect } from "react";

interface PollOption { text: string; votes: number; }
interface Poll { id: string; title: string; options: PollOption[]; isActive: boolean; timestamp: string; }

export default function PollModal() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);

  const fetchData = async () => { try { const r = await fetch("/api/polls"); if (r.ok) setPolls(await r.json()); } catch (e) {} };

  useEffect(() => {
    const saved = localStorage.getItem("votedPolls");
    if (saved) setVotedPolls(JSON.parse(saved));
    const h = () => { if (window.location.hash === "#polls") { setIsOpen(true); fetchData(); } else setIsOpen(false); };
    window.addEventListener("hashchange", h); h();
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const close = () => { setIsOpen(false); setIsCreateMode(false); setIsAuthRequired(false); window.history.replaceState(null, "", window.location.pathname); };
  const handleAuth = (e: React.FormEvent) => { e.preventDefault(); if (password === "1025") { setIsAuth(true); setIsAuthRequired(false); setPassword(""); if (pendingAction) { pendingAction(); setPendingAction(null); } } else { alert("비밀번호 오류"); setPassword(""); } };
  const runWithAuth = (a: () => void) => { if (isAuth) a(); else { setPendingAction(() => a); setIsAuthRequired(true); } };

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newOptions.filter(o => o.trim());
    if (!newTitle || validOptions.length < 2) { alert("제목과 2개 이상의 선택지를 입력하세요."); return; }
    try { const r = await fetch("/api/polls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle, options: validOptions }) }); if (r.ok) { setNewTitle(""); setNewOptions(["", ""]); setIsCreateMode(false); fetchData(); } } catch (e) { alert("오류"); }
  };

  const vote = async (pollId: string, optionIndex: number) => {
    if (votedPolls.includes(pollId)) { alert("이미 투표하셨습니다."); return; }
    try {
      const r = await fetch(`/api/polls/${pollId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ optionIndex }) });
      if (r.ok) {
        const updated = [...votedPolls, pollId];
        setVotedPolls(updated);
        localStorage.setItem("votedPolls", JSON.stringify(updated));
        fetchData();
      }
    } catch (e) { alert("오류"); }
  };

  const deletePoll = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try { await fetch(`/api/polls/${id}`, { method: "DELETE" }); fetchData(); } catch (e) {}
  };

  const getTotalVotes = (options: PollOption[]) => options.reduce((s, o) => s + o.votes, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
      <div className="glass relative w-full max-w-2xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">🗳️ 투표 / 설문</h2>
          <div className="flex items-center gap-3">
            {!isCreateMode && !isAuthRequired && <button onClick={() => runWithAuth(() => setIsCreateMode(true))} className="text-xs bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl font-bold">만들기</button>}
            <button onClick={close} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
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
              <button onClick={() => { setIsAuthRequired(false); setIsCreateMode(false); }} className="mt-4 text-xs text-slate-500">돌아가기</button>
            </div>
          ) : isCreateMode ? (
            <form onSubmit={createPoll} className="space-y-4">
              <input type="text" placeholder="투표 제목" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white font-bold outline-none focus:border-amber-500" required />
              {newOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder={`선택지 ${i + 1}`} value={opt} onChange={e => { const n = [...newOptions]; n[i] = e.target.value; setNewOptions(n); }} className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none text-sm" />
                  {newOptions.length > 2 && <button type="button" onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))} className="text-red-400 text-xs px-2">✕</button>}
                </div>
              ))}
              <button type="button" onClick={() => setNewOptions([...newOptions, ""])} className="text-xs text-amber-400 hover:underline">+ 선택지 추가</button>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-amber-500 py-4 rounded-xl font-bold text-white">만들기</button>
                <button type="button" onClick={() => setIsCreateMode(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-slate-400">취소</button>
              </div>
            </form>
          ) : polls.length === 0 ? (
            <p className="py-20 text-center text-slate-500">등록된 투표가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => {
                const total = getTotalVotes(poll.options);
                const hasVoted = votedPolls.includes(poll.id);
                return (
                  <div key={poll.id} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-white">{poll.title}</h3>
                      <button onClick={() => runWithAuth(() => deletePoll(poll.id))} className="text-[10px] text-slate-600 hover:text-red-400">삭제</button>
                    </div>
                    <div className="space-y-2">
                      {poll.options.map((opt, i) => {
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        return (
                          <button key={i} onClick={() => !hasVoted && vote(poll.id, i)} disabled={hasVoted} className={`w-full text-left p-3 rounded-xl border text-sm transition-all relative overflow-hidden ${hasVoted ? "border-white/5 cursor-default" : "border-white/10 hover:border-amber-500/30 cursor-pointer"}`}>
                            {hasVoted && <div className="absolute inset-y-0 left-0 bg-amber-500/10 transition-all" style={{ width: `${pct}%` }} />}
                            <div className="relative flex justify-between">
                              <span className="text-white">{opt.text}</span>
                              {hasVoted && <span className="text-amber-400 font-bold text-xs">{pct}% ({opt.votes})</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">{total}명 참여 · {new Date(poll.timestamp).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
