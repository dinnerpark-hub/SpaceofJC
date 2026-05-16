"use client";

import { useState, useEffect } from "react";

/* ===================================
   NoticeModals 컴포넌트
   - 공지사항 목록 조회 및 글쓰기 기능
   - 글쓰기 시 비밀번호 보안 (1025)
   - #notices 해시로 트리거
   =================================== */

interface Notice {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export default function NoticeModals() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ title: "", content: "" });

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notices");
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#notices") {
        setIsOpen(true);
        fetchNotices();
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
    setIsWriteMode(false);
    setIsAuth(false);
    setPassword("");
    setFormData({ title: "", content: "" });
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
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("공지사항이 등록되었습니다.");
        setIsWriteMode(false);
        setIsAuth(false);
        setFormData({ title: "", content: "" });
        fetchNotices();
      }
    } catch (error) {
      alert("등록 실패");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="glass relative w-full max-w-2xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
            {/* 헤더 */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📢 공지사항
              </h2>
              <div className="flex items-center gap-3">
                {!isWriteMode && (
                  <button 
                    onClick={() => setIsWriteMode(true)}
                    className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                  >
                    글쓰기
                  </button>
                )}
                <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isWriteMode ? (
                /* ── 글쓰기 모드 ── */
                !isAuth ? (
                  /* 비밀번호 확인 */
                  <div className="py-10 flex flex-col items-center">
                    <h3 className="text-white font-bold mb-4">관리자 인증</h3>
                    <form onSubmit={handleAuth} className="flex gap-2 w-full max-w-xs">
                      <input 
                        type="password" 
                        placeholder="비밀번호" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button type="submit" className="bg-indigo-500 px-4 rounded-xl font-bold">확인</button>
                    </form>
                    <button onClick={() => setIsWriteMode(false)} className="mt-4 text-xs text-slate-500 hover:text-slate-300">목록으로 돌아가기</button>
                  </div>
                ) : (
                  /* 글쓰기 폼 */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="제목을 입력하세요" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white font-bold outline-none focus:border-indigo-500"
                      required
                    />
                    <textarea 
                      placeholder="내용을 입력하세요" 
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full h-40 rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-indigo-500 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all">등록하기</button>
                      <button type="button" onClick={() => setIsWriteMode(false)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/10">취소</button>
                    </div>
                  </form>
                )
              ) : (
                /* ── 목록 모드 ── */
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="py-20 text-center text-slate-500">불러오는 중...</p>
                  ) : notices.length === 0 ? (
                    <p className="py-20 text-center text-slate-500">등록된 공지사항이 없습니다.</p>
                  ) : (
                    notices.map(notice => (
                      <div key={notice.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{notice.title}</h3>
                          <span className="text-[10px] text-slate-500">{new Date(notice.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
