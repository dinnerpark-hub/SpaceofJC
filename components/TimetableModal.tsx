"use client";
import { useState, useEffect } from "react";

const DAYS = ["월", "화", "수", "목", "금"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

interface Cell { dayOfWeek: number; period: number; subject: string; }

export default function TimetableModal() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const fetchData = async () => {
    try { const r = await fetch("/api/timetable"); if (r.ok) setCells(await r.json()); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const h = () => { if (window.location.hash === "#timetable") { setIsOpen(true); fetchData(); } else setIsOpen(false); };
    window.addEventListener("hashchange", h); h();
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const close = () => { setIsOpen(false); setIsEditMode(false); setIsAuthRequired(false); window.history.replaceState(null, "", window.location.pathname); };
  const handleAuth = (e: React.FormEvent) => { e.preventDefault(); if (password === "1025") { setIsAuth(true); setIsAuthRequired(false); setPassword(""); if (pendingAction) { pendingAction(); setPendingAction(null); } } else { alert("비밀번호가 틀렸습니다."); setPassword(""); } };
  const runWithAuth = (a: () => void) => { if (isAuth) a(); else { setPendingAction(() => a); setIsAuthRequired(true); } };
  const getSubject = (day: number, period: number) => cells.find(c => c.dayOfWeek === day && c.period === period)?.subject || "";

  const saveCell = async (day: number, period: number, subject: string) => {
    try { await fetch("/api/timetable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dayOfWeek: day, period, subject }) }); fetchData(); } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
      <div className="glass relative w-full max-w-3xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">📅 시간표</h2>
          <div className="flex items-center gap-3">
            {!isAuthRequired && (
              <button onClick={() => isEditMode ? setIsEditMode(false) : runWithAuth(() => setIsEditMode(true))} className={`text-xs px-4 py-2 rounded-xl font-bold ${isEditMode ? "bg-emerald-500 text-white" : "bg-blue-500 text-white hover:bg-blue-400"}`}>
                {isEditMode ? "완료" : "편집"}
              </button>
            )}
            <button onClick={close} className="text-slate-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {isAuthRequired ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="mb-6 h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">관리자 인증</h3>
              <p className="text-slate-400 mb-6 text-sm">비밀번호를 입력하세요.</p>
              <form onSubmit={handleAuth} className="flex gap-2 w-full max-w-xs">
                <input type="password" placeholder="비밀번호" autoFocus value={password} onChange={e => setPassword(e.target.value)} className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 text-white outline-none focus:border-indigo-500" />
                <button type="submit" className="bg-indigo-500 px-6 rounded-xl font-bold text-white">확인</button>
              </form>
              <button onClick={() => setIsAuthRequired(false)} className="mt-4 text-xs text-slate-500">돌아가기</button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-center text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-3 py-3 text-xs text-slate-500 font-bold">교시</th>
                    {DAYS.map((d, i) => <th key={i} className="px-3 py-3 text-xs font-bold text-slate-400">{d}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PERIODS.map(p => (
                    <tr key={p} className="hover:bg-white/5">
                      <td className="px-3 py-3 text-xs text-slate-500 font-bold">{p}교시</td>
                      {DAYS.map((_, di) => (
                        <td key={di} className="px-2 py-2">
                          {isEditMode ? (
                            <input type="text" defaultValue={getSubject(di + 1, p)} onBlur={e => saveCell(di + 1, p, e.target.value)} className="w-full text-center bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500" placeholder="과목" />
                          ) : (
                            <span className="text-white text-xs font-medium">{getSubject(di + 1, p) || <span className="text-slate-600">-</span>}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
