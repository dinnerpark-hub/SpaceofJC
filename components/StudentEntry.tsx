"use client";

import { useState, useEffect } from "react";

/* ===================================
   StudentEntry 컴포넌트 (DB 연동 버전)
   - Neon Postgres DB와 API를 통해 통신합니다.
   - 학년별 필터링 기능 유지
   =================================== */

interface Student {
  id: string;
  grade: string;
  classNum: string;
  number: string;
  name: string;
  timestamp: string;
}

export default function StudentEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("전체");
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    grade: "",
    classNum: "",
    number: "",
    name: "",
  });

  // API로부터 데이터 로드
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
    fetchStudents();

    const handleHashChange = () => {
      if (window.location.hash === "#register") {
        setIsModalOpen(true);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // DB에 데이터 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grade || !formData.classNum || !formData.number || !formData.name) return;

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ grade: "", classNum: "", number: "", name: "" });
        closeModal();
        alert("정보가 데이터베이스에 저장되었습니다!");
        fetchStudents(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  // DB에서 데이터 삭제
  const deleteStudent = async (id: string) => {
    if (!confirm("삭제하시겠습니까? (DB에서 영구 삭제됩니다)")) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStudents(); // 목록 새로고침
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredStudents = selectedGrade === "전체" 
    ? students 
    : students.filter(s => s.grade === selectedGrade);

  const grades = ["전체", ...Array.from(new Set(students.map(s => s.grade))).sort()];

  return (
    <section id="student-list" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold text-white">학생 목록 📋</h2>
          <p className="mt-2 text-slate-400">데이터베이스에 저장된 실시간 명단입니다.</p>
        </div>

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

      <div className="glass overflow-hidden rounded-3xl shadow-2xl">
        <div className="min-h-[300px] overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : filteredStudents.length === 0 ? (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
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
                  데이터베이스에 저장
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
