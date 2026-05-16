"use client";

import { useState, useEffect } from "react";

/* ===================================
   StudentModals 컴포넌트
   - [기능 1] 학생 등록 모달 (#register 해시로 트리거)
   - [기능 2] 학생 목록 모달 (#students 해시로 트리거)
   - [기능 3] 목록 조회 시 비밀번호 보안 (1025)
   =================================== */

interface Student {
  id: string;
  grade: string;
  classNum: string;
  number: string;
  name: string;
  timestamp: string;
}

export default function StudentModals() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("전체");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    grade: "",
    classNum: "",
    number: "",
    name: "",
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#register") {
        setIsRegisterOpen(true);
        setIsListOpen(false);
      } else if (hash === "#students") {
        setIsListOpen(true);
        setIsRegisterOpen(false);
        fetchStudents();
      } else {
        setIsRegisterOpen(false);
        setIsListOpen(false);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const closeModals = () => {
    setIsRegisterOpen(false);
    setIsListOpen(false);
    setIsAuth(false);
    setPassword("");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1025") {
      setIsAuth(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ grade: "", classNum: "", number: "", name: "" });
        closeModals();
        alert("등록 완료!");
      }
    } catch (error) {
      alert("등록 실패");
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (response.ok) fetchStudents();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const filteredStudents = selectedGrade === "전체" 
    ? students 
    : students.filter(s => s.grade === selectedGrade);

  const grades = ["전체", ...Array.from(new Set(students.map(s => s.grade))).sort()];

  return (
    <>
      {/* ── 1. 학생 등록 모달 ── */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModals} />
          <div className="glass relative w-full max-w-md animate-fade-in-up rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">학생 정보 등록 🎒</h2>
              <button onClick={closeModals} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="학년" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-indigo-500 outline-none" required />
                <input type="number" placeholder="반" value={formData.classNum} onChange={e => setFormData({...formData, classNum: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-indigo-500 outline-none" required />
                <input type="number" placeholder="번호" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-indigo-500 outline-none" required />
              </div>
              <input type="text" placeholder="이름" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-indigo-500 outline-none" required />
              <button type="submit" className="w-full rounded-xl bg-indigo-500 py-4 font-bold text-white hover:bg-indigo-400 transition-all">등록 완료</button>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. 학생 목록 모달 ── */}
      {isListOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModals} />
          
          <div className="glass relative w-full max-w-4xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-white">학생 목록 조회 📋</h2>
              <button onClick={closeModals} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!isAuth ? (
                /* 비밀번호 확인 화면 */
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="mb-6 h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl">🔒</div>
                  <h3 className="text-lg font-semibold text-white mb-2">보안 구역</h3>
                  <p className="text-slate-400 mb-6 text-sm">목록을 보려면 비밀번호를 입력하세요.</p>
                  <form onSubmit={handleAuth} className="flex gap-2 w-full max-w-xs">
                    <input 
                      type="password" 
                      placeholder="비밀번호" 
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="flex-1 rounded-xl bg-white/10 border border-white/10 p-3 text-white outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-500 px-6 rounded-xl font-bold hover:bg-indigo-400">확인</button>
                  </form>
                </div>
              ) : (
                /* 실제 목록 화면 */
                <>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {grades.map(grade => (
                      <button 
                        key={grade} 
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGrade === grade ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                      >
                        {grade === "전체" ? "전체" : `${grade}학년`}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-3">학년-반-번호</th>
                          <th className="px-6 py-3">이름</th>
                          <th className="px-6 py-3 text-right">삭제</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                          <tr><td colSpan={3} className="py-20 text-center">불러오는 중...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr><td colSpan={3} className="py-20 text-center text-slate-500">데이터가 없습니다.</td></tr>
                        ) : (
                          filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-white/5 group">
                              <td className="px-6 py-4 text-indigo-400 font-mono">{student.grade}-{student.classNum}-{student.number}</td>
                              <td className="px-6 py-4 text-white font-medium">{student.name}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => deleteStudent(student.id)} className="text-slate-500 hover:text-red-400 text-xs">삭제</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
