"use client";

import { useState, useEffect } from "react";

/* ===================================
   StudentEntry 컴포넌트 (개선 버전)
   - [특징 1] '시작하기' 클릭 시 모달로 입력창 노출
   - [특징 2] 학년별 필터링 기능 제공 (학생 목록)
   - [특징 3] LocalStorage 연동 및 정렬
   =================================== */

interface Student {
  id: string;
  grade: string;
  classNum: string;
  number: string;
  name: string;
  timestamp: number;
}

export default function StudentEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("전체");
  
  const [formData, setFormData] = useState({
    grade: "",
    classNum: "",
    number: "",
    name: "",
  });

  // 초기 데이터 로드 및 해시 감지
  useEffect(() => {
    const saved = localStorage.getItem("students");
    if (saved) {
      setStudents(JSON.parse(saved));
    }

    // URL 해시가 #register이면 모달 열기 (Hero 버튼 연동)
    const handleHashChange = () => {
      if (window.location.hash === "#register") {
        setIsModalOpen(true);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // 초기 실행
    
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 모달 닫을 때 해시 제거
  const closeModal = () => {
    setIsModalOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // 데이터 저장 및 정렬
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grade || !formData.classNum || !formData.number || !formData.name) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      ...formData,
      timestamp: Date.now(),
    };

    const updatedStudents = [...students, newStudent].sort((a, b) => {
      if (a.grade !== b.grade) return parseInt(a.grade) - parseInt(b.grade);
      if (a.classNum !== b.classNum) return parseInt(a.classNum) - parseInt(b.classNum);
      return parseInt(a.number) - parseInt(b.number);
    });

    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setFormData({ grade: "", classNum: "", number: "", name: "" });
    closeModal();
    alert("정보가 저장되었습니다!");
  };

  const deleteStudent = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      localStorage.setItem("students", JSON.stringify(updated));
    }
  };

  // 필터링된 학생 목록
  const filteredStudents = selectedGrade === "전체" 
    ? students 
    : students.filter(s => s.grade === selectedGrade);

  // 학년 종류 추출
  const grades = ["전체", ...Array.from(new Set(students.map(s => s.grade))).sort()];

  return (
    <section id="student-list" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      
      {/* ── 상단 영역: 타이틀 및 필터 ── */}
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold text-white">학생 목록 📋</h2>
          <p className="mt-2 text-slate-400">등록된 학생들을 학년별로 확인할 수 있습니다.</p>
        </div>

        {/* 학년 필터 버튼 */}
        <div className="flex flex-wrap gap-2">
          {grades.map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                selectedGrade === grade 
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
                : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {grade === "전체" ? "전체보기" : `${grade}학년`}
            </button>
          ))}
        </div>
      </div>

      {/* ── 목록 표시 영역 ── */}
      <div className="glass overflow-hidden rounded-3xl shadow-2xl">
        <div className="min-h-[300px] overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-500">
              <span className="mb-2 text-4xl">🔍</span>
              <p>{selectedGrade === "전체" ? "등록된 학생이 없습니다." : `${selectedGrade}학년 학생이 없습니다.`}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">학년-반-번호</th>
                  <th className="px-6 py-4 font-semibold">이름</th>
                  <th className="px-6 py-4 font-semibold">등록일</th>
                  <th className="px-6 py-4 text-right font-semibold">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <span className="font-mono text-indigo-400">{student.grade}학년 {student.classNum}반 {student.number}번</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(student.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── 정보 입력 모달 (isModalOpen 시 노출) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* 모달 콘텐츠 */}
          <div className="glass relative w-full max-w-md animate-fade-in-up rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">학생 정보 등록 🎒</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">학년</label>
                  <input
                    type="number"
                    placeholder="학년"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">반</label>
                  <input
                    type="number"
                    placeholder="반"
                    value={formData.classNum}
                    onChange={(e) => setFormData({ ...formData, classNum: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">번호</label>
                  <input
                    type="number"
                    placeholder="번호"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-500 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 active:scale-[0.98]"
                >
                  등록 완료하기
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
