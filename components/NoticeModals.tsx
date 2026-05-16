"use client";

import { useState, useEffect } from "react";

/* ===================================
   NoticeModals 컴포넌트 (업그레이드 버전)
   - 공지사항 목록/상세보기/글쓰기
   - 삭제 기능 및 상세 팝업 추가
   - 제목 클릭 시 내용 확인 가능
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
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
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
    setSelectedNotice(null);
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
      } else {
        const errorData = await response.json();
        alert(`등록 실패: ${errorData.error}`);
      }
    } catch (error) {
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const deleteNotice = async (id: string) => {
    if (!isAuth) {
      alert("관리자 인증이 필요합니다.");
      return;
    }
    if (!confirm("이 공지사항을 정말로 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("삭제되었습니다.");
        fetchNotices();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="glass relative w-full max-w-3xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
            {/* 상단바 */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📢 공지사항
              </h2>
              <div className="flex items-center gap-3">
                {!isWriteMode && (
                  <button 
                    onClick={() => setIsWriteMode(true)}
                    className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    글쓰기
                  </button>
                )}
                <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isWriteMode ? (
                /* ── [1] 글쓰기 모드 ── */
                !isAuth ? (
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
                      <button type="submit" className="bg-indigo-500 px-6 rounded-xl font-bold">확인</button>
                    </form>
                    <button onClick={() => setIsWriteMode(false)} className="mt-4 text-xs text-slate-500">목록으로</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="제목" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white font-bold outline-none focus:border-indigo-500"
                      required
                    />
                    <textarea 
                      placeholder="내용" 
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full h-40 rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-indigo-500 py-4 rounded-xl font-bold hover:bg-indigo-400 transition-all">등록하기</button>
                      <button type="button" onClick={() => setIsWriteMode(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-slate-400">취소</button>
                    </div>
                  </form>
                )
              ) : selectedNotice ? (
                /* ── [2] 상세 보기 모드 ── */
                <div className="animate-fade-in">
                  <div className="mb-6 flex flex-col gap-2 border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-white">{selectedNotice.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>작성자: <span className="text-indigo-400 font-bold">정찬T</span></span>
                      <span>작성일: {new Date(selectedNotice.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base min-h-[200px]">
                    {selectedNotice.content}
                  </div>
                  <div className="mt-8 flex justify-end gap-2">
                    <button 
                      onClick={() => deleteNotice(selectedNotice.id)}
                      className="text-xs text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all"
                    >
                      삭제
                    </button>
                    <button 
                      onClick={() => setSelectedNotice(null)}
                      className="bg-white/5 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-white/10"
                    >
                      목록으로 돌아가기
                    </button>
                  </div>
                </div>
              ) : (
                /* ── [3] 목록 모드 ── */
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">제목</th>
                        <th className="px-6 py-4">작성일</th>
                        <th className="px-6 py-4">작성자</th>
                        <th className="px-6 py-4 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-500">불러오는 중...</td></tr>
                      ) : notices.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-500">등록된 공지사항이 없습니다.</td></tr>
                      ) : (
                        notices.map(notice => (
                          <tr key={notice.id} className="hover:bg-white/5 group transition-colors">
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setSelectedNotice(notice)}
                                className="text-white font-medium hover:text-indigo-400 text-left transition-colors truncate max-w-[200px] sm:max-w-xs"
                              >
                                {notice.title}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              {new Date(notice.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-400">정찬T</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => {
                                  if (!isAuth) {
                                    const pw = prompt("삭제하려면 비밀번호를 입력하세요:");
                                    if (pw === "1025") {
                                      setIsAuth(true);
                                      deleteNotice(notice.id);
                                    } else {
                                      alert("비밀번호가 틀렸습니다.");
                                    }
                                  } else {
                                    deleteNotice(notice.id);
                                  }
                                }}
                                className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
