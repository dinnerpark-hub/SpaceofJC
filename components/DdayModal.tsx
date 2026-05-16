"use client";

import { useState, useEffect } from "react";

interface DdayEvent {
  id: string;
  title: string;
  targetDate: string;
}

export default function DdayModal() {
  const [events, setEvents] = useState<DdayEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [formData, setFormData] = useState({ title: "", targetDate: "" });
  const [isAddMode, setIsAddMode] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/dday");
      if (res.ok) setEvents(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const handler = () => {
      if (window.location.hash === "#dday") { setIsOpen(true); fetchEvents(); }
      else setIsOpen(false);
    };
    window.addEventListener("hashchange", handler);
    handler();
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const close = () => { setIsOpen(false); setIsAddMode(false); setIsAuthRequired(false); setPassword(""); window.history.replaceState(null, "", window.location.pathname); };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1025") { setIsAuth(true); setIsAuthRequired(false); setPassword(""); if (pendingAction) { pendingAction(); setPendingAction(null); } }
    else { alert("비밀번호가 틀렸습니다."); setPassword(""); }
  };

  const runWithAuth = (action: () => void) => {
    if (isAuth) action();
    else { setPendingAction(() => action); setIsAuthRequired(true); }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dday", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setFormData({ title: "", targetDate: "" }); setIsAddMode(false); fetchEvents(); }
    } catch (e) { alert("등록 오류"); }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try { const res = await fetch(`/api/dday/${id}`, { method: "DELETE" }); if (res.ok) fetchEvents(); } catch (e) { alert("삭제 오류"); }
  };

  const getDday = (dateStr: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "D-Day!";
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
      <div className="glass relative w-full max-w-lg max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">⏰ D-Day 카운터</h2>
          <div className="flex items-center gap-3">
            {!isAddMode && !isAuthRequired && <button onClick={() => runWithAuth(() => setIsAddMode(true))} className="text-xs bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-xl font-bold">추가</button>}
            <button onClick={close} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isAuthRequired ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="mb-6 h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">관리자 인증</h3>
              <p className="text-slate-400 mb-6 text-sm">비밀번호를 입력하세요.</p>
              <form onSubmit={handleAuth} className="flex gap-2 w-full max-w-xs">
                <input type="password" placeholder="비밀번호" autoFocus value={password} onChange={e => setPassword(e.target.value)} className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 text-white outline-none focus:border-indigo-500" />
                <button type="submit" className="bg-indigo-500 px-6 rounded-xl font-bold text-white">확인</button>
              </form>
              <button onClick={() => { setIsAuthRequired(false); setIsAddMode(false); }} className="mt-4 text-xs text-slate-500">돌아가기</button>
            </div>
          ) : isAddMode ? (
            <form onSubmit={addEvent} className="space-y-4">
              <input type="text" placeholder="이벤트 이름 (예: 중간고사)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-indigo-500" required />
              <input type="date" value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-indigo-500" required />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-rose-500 py-4 rounded-xl font-bold text-white hover:bg-rose-400">등록</button>
                <button type="button" onClick={() => setIsAddMode(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-slate-400">취소</button>
              </div>
            </form>
          ) : events.length === 0 ? (
            <p className="py-20 text-center text-slate-500">등록된 D-Day가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-rose-500/20 transition-all">
                  <div>
                    <p className="font-bold text-white">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(ev.targetDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-rose-400">{getDday(ev.targetDate)}</span>
                    <button onClick={() => runWithAuth(() => deleteEvent(ev.id))} className="text-xs text-slate-600 hover:text-red-400">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
