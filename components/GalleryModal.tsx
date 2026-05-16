"use client";
import { useState, useEffect } from "react";

interface GalleryItem { id: string; title: string; imageUrl: string; timestamp: string; }

export default function GalleryModal() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedImg, setSelectedImg] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "" });

  const fetchData = async () => { try { const r = await fetch("/api/gallery"); if (r.ok) setImages(await r.json()); } catch (e) {} };

  useEffect(() => {
    const h = () => { if (window.location.hash === "#gallery") { setIsOpen(true); fetchData(); } else setIsOpen(false); };
    window.addEventListener("hashchange", h); h();
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const close = () => { setIsOpen(false); setIsAddMode(false); setSelectedImg(null); setIsAuthRequired(false); window.history.replaceState(null, "", window.location.pathname); };
  const handleAuth = (e: React.FormEvent) => { e.preventDefault(); if (password === "1025") { setIsAuth(true); setIsAuthRequired(false); setPassword(""); if (pendingAction) { pendingAction(); setPendingAction(null); } } else { alert("비밀번호 오류"); setPassword(""); } };
  const runWithAuth = (a: () => void) => { if (isAuth) a(); else { setPendingAction(() => a); setIsAuthRequired(true); } };

  const addImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try { const r = await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); if (r.ok) { setFormData({ title: "", imageUrl: "" }); setIsAddMode(false); fetchData(); } } catch (e) { alert("오류"); }
  };

  const deleteImage = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try { await fetch(`/api/gallery/${id}`, { method: "DELETE" }); setSelectedImg(null); fetchData(); } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} />
      <div className="glass relative w-full max-w-4xl max-h-[85vh] animate-fade-in-up rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">📸 학급 갤러리</h2>
          <div className="flex items-center gap-3">
            {!isAddMode && !isAuthRequired && !selectedImg && <button onClick={() => runWithAuth(() => setIsAddMode(true))} className="text-xs bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-xl font-bold">사진 추가</button>}
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
              <button onClick={() => { setIsAuthRequired(false); setIsAddMode(false); }} className="mt-4 text-xs text-slate-500">돌아가기</button>
            </div>
          ) : isAddMode ? (
            <form onSubmit={addImage} className="space-y-4">
              <input type="text" placeholder="사진 제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-purple-500" required />
              <input type="url" placeholder="이미지 URL (https://...)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-purple-500" required />
              {formData.imageUrl && <img src={formData.imageUrl} alt="미리보기" className="w-full max-h-40 object-cover rounded-xl" onError={e => (e.target as HTMLImageElement).style.display = "none"} />}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-purple-500 py-4 rounded-xl font-bold text-white">등록</button>
                <button type="button" onClick={() => setIsAddMode(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-slate-400">취소</button>
              </div>
            </form>
          ) : selectedImg ? (
            <div className="animate-fade-in">
              <img src={selectedImg.imageUrl} alt={selectedImg.title} className="w-full max-h-[50vh] object-contain rounded-2xl mb-4 bg-black/20" />
              <h3 className="font-bold text-white text-lg">{selectedImg.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{new Date(selectedImg.timestamp).toLocaleDateString()}</p>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => runWithAuth(() => deleteImage(selectedImg.id))} className="text-xs text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg">삭제</button>
                <button onClick={() => setSelectedImg(null)} className="bg-white/5 px-6 py-2 rounded-xl text-sm font-bold text-white">목록으로</button>
              </div>
            </div>
          ) : images.length === 0 ? (
            <p className="py-20 text-center text-slate-500">아직 사진이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(img => (
                <button key={img.id} onClick={() => setSelectedImg(img)} className="group overflow-hidden rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-2 bg-white/5"><p className="text-xs text-white font-medium truncate">{img.title}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
