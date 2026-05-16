"use client";

import { useState, useEffect } from "react";

/* ===================================
   StudentEntry 컴포넌트
   - 학생 정보 입력 (학년, 반, 번호, 이름)
   - LocalStorage를 이용한 데이터 저장
   - 저장된 명단 정렬 출력
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
  const [formData, setFormData] = useState({
    grade: "",
    classNum: "",
    number: "",
    name: "",
  });

  // 초기 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem("students");
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

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
    alert("정보가 저장되었습니다!");
  };

  const deleteStudent = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      localStorage.setItem("students", JSON.stringify(updated));
    }
  };

  return (
    <section id="student-entry" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* ── 입력 폼 (왼쪽) ── */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h2 className="mb-6 text-2xl font-bold text-white">학생 정보 입력 🎒</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">학년</label>
                <input
                  type="number"
                  placeholder="학년"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">반</label>
                <input
                  type="number"
                  placeholder="반"
                  value={formData.classNum}
                  onChange={(e) => setFormData({ ...formData, classNum: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">번호</label>
                <input
                  type="number"
                  placeholder="번호"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">이름</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-500 py-4 font-bold text-white transition-all hover:bg-indigo-400 active:scale-[0.98]"
            >
              학생 등록하기
            </button>
          </form>
        </div>

        {/* ── 정렬된 목록 (오른쪽) ── */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">우리반 명단 📋</h2>
            <span className="text-sm text-slate-400">총 {students.length}명</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {students.length === 0 ? (
              <p className="py-20 text-center text-slate-500">등록된 학생이 없습니다.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#1e293b] text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3 pl-4 pt-2">정보</th>
                    <th className="pb-3 pt-2">이름</th>
                    <th className="pb-3 pt-2 text-right pr-4">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((student) => (
                    <tr key={student.id} className="group hover:bg-white/5">
                      <td className="py-4 pl-4">
                        <span className="text-indigo-300">{student.grade}</span>-
                        <span className="text-indigo-300">{student.classNum}</span>-
                        <span className="text-indigo-300">{student.number}</span>
                      </td>
                      <td className="py-4 font-medium text-white">{student.name}</td>
                      <td className="py-4 text-right pr-4">
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
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
      </div>
    </section>
  );
}
