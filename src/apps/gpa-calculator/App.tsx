import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GraduationCap, RotateCcw } from 'lucide-react';

interface Course { id: string; name: string; credits: number; grade: string; }

const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 };
const gradeColors: Record<string, string> = { 'A+': 'text-green-400', 'A': 'text-green-400', 'A-': 'text-green-400', 'B+': 'text-blue-400', 'B': 'text-blue-400', 'B-': 'text-blue-400', 'C+': 'text-yellow-400', 'C': 'text-yellow-400', 'C-': 'text-yellow-400', 'D+': 'text-orange-400', 'D': 'text-orange-400', 'D-': 'text-orange-400', 'F': 'text-red-400' };

export default function App() {
  const [semesters, setSemesters] = useState<{ id: string; name: string; courses: Course[] }[]>([
    { id: '1', name: 'Semester 1', courses: [{ id: crypto.randomUUID(), name: '', credits: 3, grade: 'A' }] }
  ]);

  const addSemester = () => setSemesters(prev => [...prev, { id: crypto.randomUUID(), name: `Semester ${prev.length + 1}`, courses: [{ id: crypto.randomUUID(), name: '', credits: 3, grade: 'A' }] }]);

  const addCourse = (semId: string) => setSemesters(prev => prev.map(s => s.id === semId ? { ...s, courses: [...s.courses, { id: crypto.randomUUID(), name: '', credits: 3, grade: 'A' }] } : s));

  const updateCourse = (semId: string, courseId: string, field: keyof Course, value: string | number) => {
    setSemesters(prev => prev.map(s => s.id === semId ? { ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c) } : s));
  };

  const removeCourse = (semId: string, courseId: string) => setSemesters(prev => prev.map(s => s.id === semId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s));

  const removeSemester = (semId: string) => setSemesters(prev => prev.filter(s => s.id !== semId));

  const calcGPA = (courses: Course[]) => {
    const totalPoints = courses.reduce((sum, c) => sum + c.credits * (gradePoints[c.grade] || 0), 0);
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const allCourses = semesters.flatMap(s => s.courses);
  const cumulativeGPA = calcGPA(allCourses);
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);

  const gradeDist = Object.keys(gradePoints).map(g => ({ grade: g, count: allCourses.filter(c => c.grade === g).length })).filter(g => g.count > 0);
  const maxCount = Math.max(...gradeDist.map(g => g.count), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 text-purple-400" /> GPA Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate semester & cumulative GPA</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Cumulative GPA</p>
            <p className={`text-3xl font-bold ${cumulativeGPA >= 3.5 ? 'text-green-400' : cumulativeGPA >= 2.5 ? 'text-blue-400' : cumulativeGPA >= 1.5 ? 'text-yellow-400' : 'text-red-400'}`}>{cumulativeGPA.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Credits</p>
            <p className="text-3xl font-bold text-purple-400">{totalCredits}</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Courses</p>
            <p className="text-3xl font-bold text-cyan-400">{allCourses.length}</p>
          </div>
        </div>

        {gradeDist.length > 0 && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Grade Distribution</h3>
            <div className="flex items-end gap-2 h-24">
              {gradeDist.map(g => (
                <div key={g.grade} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">{g.count}</span>
                  <div className={`w-full rounded-t ${g.grade.startsWith('A') ? 'bg-green-500' : g.grade.startsWith('B') ? 'bg-blue-500' : g.grade.startsWith('C') ? 'bg-yellow-500' : g.grade.startsWith('D') ? 'bg-orange-500' : 'bg-red-500'}`} style={{ height: `${(g.count / maxCount) * 100}%`, minHeight: 4 }} />
                  <span className="text-xs text-gray-500">{g.grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {semesters.map(sem => {
          const semGPA = calcGPA(sem.courses);
          return (
            <div key={sem.id} className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4">
              <div className="flex items-center justify-between mb-3">
                <input value={sem.name} onChange={e => setSemesters(prev => prev.map(s => s.id === sem.id ? { ...s, name: e.target.value } : s))} className="bg-transparent text-lg font-semibold focus:outline-none focus:border-b focus:border-blue-500" />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">GPA: <span className="text-white font-medium">{semGPA.toFixed(2)}</span></span>
                  <button onClick={() => removeSemester(sem.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {sem.courses.map(course => (
                  <div key={course.id} className="flex items-center gap-3">
                    <input value={course.name} onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)} placeholder="Course name" className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    <input type="number" value={course.credits} onChange={e => updateCourse(sem.id, course.id, 'credits', parseInt(e.target.value) || 0)} className="w-20 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500" min={1} max={6} />
                    <select value={course.grade} onChange={e => updateCourse(sem.id, course.id, 'grade', e.target.value)} className={`w-20 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-center focus:outline-none ${gradeColors[course.grade]}`}>
                      {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button onClick={() => removeCourse(sem.id, course.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addCourse(sem.id)} className="mt-3 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"><Plus className="w-4 h-4" /> Add Course</button>
            </div>
          );
        })}
        <div className="flex gap-3">
          <button onClick={addSemester} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Semester</button>
          <button onClick={() => setSemesters([{ id: '1', name: 'Semester 1', courses: [{ id: crypto.randomUUID(), name: '', credits: 3, grade: 'A' }] }])} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><RotateCcw className="w-4 h-4" /> Reset</button>
        </div>
      </div>
    </div>
  );
}
