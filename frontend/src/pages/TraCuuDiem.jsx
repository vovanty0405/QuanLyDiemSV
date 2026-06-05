import React, { useState, useEffect, useContext } from 'react';
import { 
  Search, Filter, CheckCircle, XCircle, ChevronLeft, 
  Download, Printer, Award, BookOpen, FileDigit, UserCircle, GraduationCap, Loader2, AlertCircle, X, Send
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// --- VIEW 1: STUDENT LIST VIEW ---
const StudentListView = ({ onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/tracuudiem');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(sv => 
    sv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map(sv => ({
      'Mã SV': sv.id,
      'Họ Tên': sv.name,
      'Lớp': sv.className,
      'Khoa': sv.department,
      'ĐTB Hệ 10': sv.gpa,
      'ĐTB Hệ 4': sv.gpa4,
      'STC': sv.credits
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachSV');
    XLSX.writeFile(wb, 'DanhSachTraCuuDiem.xlsx');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-lg border border-surface-hover">
        <div className="flex gap-4 w-full md:w-auto">
          <select className="bg-canvas border border-surface-hover text-text-primary px-4 py-2 rounded-md outline-none focus:border-[#4d8eff]">
            <option>Tất cả khoa</option>
            {/* Lấy từ data động sau nếu cần */}
          </select>
          <select className="bg-canvas border border-surface-hover text-text-primary px-4 py-2 rounded-md outline-none focus:border-[#4d8eff]">
            <option>Tất cả lớp</option>
          </select>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Tìm MSSV, Họ tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-canvas border border-surface-hover text-text-primary pl-10 pr-4 py-2 rounded-md outline-none focus:border-[#4d8eff]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-md hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2">
          <Award size={18} />
          SV Đủ ĐK Học bổng
        </button>
        <button className="px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-md hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2">
          <GraduationCap size={18} />
          SV Đủ ĐK Tốt nghiệp
        </button>
        <button onClick={handleExportExcel} className="px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-md hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2 ml-auto">
          <Download size={18} />
          Xuất File
        </button>
        <button onClick={handlePrint} className="px-4 py-2 bg-surface border border-surface-hover text-text-primary rounded-md hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2">
          <Printer size={18} />
          In Danh sách
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-surface rounded-lg border border-surface-hover">
        {loading ? (
          <div className="p-8 flex justify-center text-[#4d8eff]">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-semantic-error">{error}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#191b23] text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                <th className="p-4 font-medium">Mã SV</th>
                <th className="p-4 font-medium">Họ Tên</th>
                <th className="p-4 font-medium">Lớp</th>
                <th className="p-4 font-medium">Khoa</th>
                <th className="p-4 font-medium">ĐTB Tích lũy (Hệ 10)</th>
                <th className="p-4 font-medium">ĐTB Tích lũy (Hệ 4)</th>
                <th className="p-4 font-medium">STC Tích lũy</th>
                <th className="p-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-text-primary text-sm divide-y divide-[#32353c]">
              {filteredStudents.length > 0 ? currentItems.map((student) => (
                <tr key={student.id} className="hover:bg-surface-hover/30 transition-colors">
                  <td className="p-4">{student.id}</td>
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4">{student.className}</td>
                  <td className="p-4">{student.department}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${student.gpa >= 8.0 ? 'text-[#10B981]' : student.gpa < 5.0 ? 'text-[#df7412]' : ''}`}>
                      {student.gpa}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold text-[#4d8eff]`}>
                      {student.gpa4}
                    </span>
                  </td>
                  <td className="p-4">{student.credits}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onSelectStudent(student.id)}
                      className="text-[#4d8eff] hover:text-text-primary transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-muted">Không tìm thấy sinh viên nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 0 && (
        <div className="flex justify-between items-center bg-surface p-4 rounded-b-xl border border-surface-hover border-t-0">
            <span className="text-sm text-text-muted">
                Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredStudents.length)} trong tổng số {filteredStudents.length} sinh viên
            </span>
            <div className="flex gap-1">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                >
                    Trang trước
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                        <button 
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 text-sm rounded border ${currentPage === pageNum ? 'bg-primary border-primary text-white' : 'bg-surface border-surface-hover text-text-primary hover:bg-surface-hover'} transition-colors`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded bg-surface border border-surface-hover text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
                >
                    Trang sau
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- VIEW 2: STUDENT DETAIL VIEW ---
const StudentDetailView = ({ studentId, userRole, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [complaintModal, setComplaintModal] = useState({
    isOpen: false,
    subject: null
  });
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintType, setComplaintType] = useState('quatrinh');

  const handleOpenComplaint = (subject) => {
    setComplaintModal({ isOpen: true, subject });
    setComplaintReason('');
    setComplaintType('quatrinh');
  };

  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');

  const handleSubmitComplaint = async () => {
    if (!complaintReason.trim()) {
      toast.error('Vui lòng nhập lý do khiếu nại');
      return;
    }
    
    try {
      await axiosClient.post('/khieunai', {
        maLHP: complaintModal.subject.maLHP,
        lyDo: complaintReason,
        loaiDiem: complaintType
      });
      toast.success('Đã gửi đơn khiếu nại thành công!');
      setComplaintModal({ isOpen: false, subject: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi khiếu nại');
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/tracuudiem/${studentId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết sinh viên');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) {
      fetchDetail();
    }
  }, [studentId]);

  if (loading) {
    return <div className="flex justify-center p-12 text-[#4d8eff]"><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-surface-hover p-8 rounded-lg text-center">
        <p className="text-semantic-error mb-4">{error || 'Không có dữ liệu'}</p>
        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
          <button onClick={onBack} className="px-4 py-2 bg-surface-hover text-text-primary rounded hover:bg-semantic-error/20">Quay lại</button>
        )}
      </div>
    );
  }

  const progressPercent = data.progress.totalCredits > 0 
    ? Math.min(100, Math.round((data.progress.completedCredits / data.progress.totalCredits) * 100)) 
    : 0;

  const handleExportExcelDetail = () => {
    if (!data) return;
    const rows = [];
    data.semesters.forEach(sem => {
      sem.subjects.forEach((sub, index) => {
        rows.push({
          'Học Kỳ': sem.name,
          'STT': index + 1,
          'Mã MH': sub.id,
          'Tên Môn Học': sub.name,
          'STC': sub.credits,
          'Điểm QT': sub.processGrade,
          'Điểm Thi': sub.examGrade,
          'Thi L1': sub.exam1,
          'Thi L2': sub.exam2,
          'TK(10)': sub.total10,
          'TK(4)': sub.total4,
          'Điểm Chữ': sub.letter,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
    XLSX.writeFile(wb, `BangDiem_${data.studentInfo.id}.xlsx`);
  };

  const handlePrintDetail = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-surface border border-surface-hover p-6 rounded-lg relative">
        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
          <button 
            onClick={onBack}
            className="absolute top-6 right-6 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={18} />
            Quay lại
          </button>
        )}
        <div className="flex gap-4 justify-end absolute top-16 right-6">
           <button onClick={handleExportExcelDetail} className="px-3 py-1.5 bg-canvas border border-surface-hover text-text-primary text-sm rounded hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2">
            <Download size={16} /> Xuất bảng điểm
          </button>
          <button onClick={handlePrintDetail} className="px-3 py-1.5 bg-canvas border border-surface-hover text-text-primary text-sm rounded hover:border-[#4d8eff] hover:text-[#4d8eff] transition-colors flex items-center gap-2">
            <Printer size={16} /> In báo cáo
          </button>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <UserCircle className="text-[#4d8eff]" /> 
          Thông tin cá nhân
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-text-muted mb-1">Mã sinh viên</p>
            <p className="font-medium text-text-primary">{data.studentInfo.id}</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Họ và tên</p>
            <p className="font-medium text-text-primary">{data.studentInfo.name}</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Lớp</p>
            <p className="font-medium text-text-primary">{data.studentInfo.className}</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Khoa</p>
            <p className="font-medium text-text-primary">{data.studentInfo.department}</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Ngành học</p>
            <p className="font-medium text-text-primary">{data.studentInfo.major}</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Cố vấn học tập</p>
            <p className="font-medium text-text-primary">{data.studentInfo.advisor}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Progress & Graduation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface-hover p-6 rounded-lg">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <BookOpen className="text-[#4d8eff]" size={20} />
            Tiến độ học tập
          </h3>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-text-muted">Hoàn thành: {data.progress.completedCredits}/{data.progress.totalCredits} tín chỉ</span>
            <span className="font-medium text-[#10B981]">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#10B981] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-surface border border-surface-hover p-6 rounded-lg">
           <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <Award className="text-[#4d8eff]" size={20} />
            Xét tốt nghiệp
          </h3>
          {data.progress.isGraduationEligible ? (
             <div className="bg-[#10B981]/10 border border-[#10B981] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#10B981] font-semibold mb-3">
                  <CheckCircle size={20} />
                  <span>ĐỦ ĐIỀU KIỆN TỐT NGHIỆP - {data.progress.graduationType}</span>
                </div>
                <ul className="space-y-2 text-sm text-text-primary">
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> GPA {'>'}= 2.0</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Không có điểm F</li>
                  <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Đủ tín chỉ tích lũy</li>
                </ul>
             </div>
          ) : (
            <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#ffb4ab] font-semibold mb-3">
                  <XCircle size={20} />
                  <span>CHƯA ĐỦ ĐIỀU KIỆN TỐT NGHIỆP</span>
                </div>
                <p className="text-sm text-text-primary mb-2">Các môn bắt buộc chưa đạt:</p>
                <ul className="list-disc list-inside text-sm text-[#df7412] space-y-1">
                  {data.progress.failedSubjects.length > 0 ? data.progress.failedSubjects.map((sub, idx) => (
                    <li key={idx}>{sub}</li>
                  )) : <li>Chưa đủ tín chỉ hoặc GPA thấp</li>}
                </ul>
             </div>
          )}
        </div>
      </div>

      {/* Section 2: Transcript History */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <FileDigit className="text-[#4d8eff]" />
            Lịch sử học tập
            </h3>
            
            {data.semesters.length > 0 && (
                <select 
                    value={selectedSemesterFilter} 
                    onChange={e => setSelectedSemesterFilter(e.target.value)}
                    className="bg-canvas border border-surface-hover text-text-primary px-4 py-2 rounded-lg outline-none focus:border-[#4d8eff] shadow-sm"
                >
                    <option value="">Tất cả Học Kỳ</option>
                    {data.semesters.map((sem, idx) => (
                        <option key={idx} value={sem.name}>{sem.name}</option>
                    ))}
                </select>
            )}
        </div>
        
        {data.semesters.length === 0 ? (
          <div className="text-center text-text-muted bg-surface border border-surface-hover p-8 rounded-lg">
            Chưa có dữ liệu học kỳ nào
          </div>
        ) : (
          (selectedSemesterFilter ? data.semesters.filter(sem => sem.name === selectedSemesterFilter) : data.semesters).map((sem, idx) => (
            <div key={idx} className="bg-surface border border-surface-hover rounded-lg overflow-hidden">
               <div className="bg-[#191b23] p-4 border-b border-surface-hover">
                 <h4 className="text-[#4d8eff] font-medium">{sem.name}</h4>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                   <thead>
                     <tr className="bg-surface text-text-muted uppercase text-xs tracking-wider border-b border-surface-hover">
                       <th className="p-3 font-medium">STT</th>
                       <th className="p-3 font-medium">Mã MH</th>
                       <th className="p-3 font-medium">Tên Môn Học</th>
                       <th className="p-3 font-medium text-center">STC</th>
                       <th className="p-3 font-medium text-center">Điểm QT</th>
                       <th className="p-3 font-medium text-center">Điểm Thi</th>
                       <th className="p-3 font-medium text-center">Thi L1</th>
                       <th className="p-3 font-medium text-center">Thi L2</th>
                       <th className="p-3 font-medium text-center">TK(10)</th>
                       <th className="p-3 font-medium text-center">TK(4)</th>
                       <th className="p-3 font-medium text-center">Điểm Chữ</th>
                       {userRole === 'STUDENT' && <th className="p-3 font-medium text-center">Thao tác</th>}
                     </tr>
                   </thead>
                   <tbody className="text-text-primary text-sm divide-y divide-[#32353c]">
                     {sem.subjects.map((sub, sIdx) => (
                       <tr key={sIdx} className="hover:bg-surface-hover/30">
                         <td className="p-3">{sIdx + 1}</td>
                         <td className="p-3">{sub.id}</td>
                         <td className="p-3">{sub.name}</td>
                         <td className="p-3 text-center">{sub.credits}</td>
                         <td className="p-3 text-center">{sub.processGrade}</td>
                         <td className="p-3 text-center">{sub.examGrade}</td>
                         <td className="p-3 text-center">{sub.exam1}</td>
                         <td className="p-3 text-center">{sub.exam2 || '-'}</td>
                         <td className="p-3 text-center font-medium">{sub.total10}</td>
                         <td className="p-3 text-center text-[#4d8eff]">{sub.total4}</td>
                         <td className="p-3 text-center font-semibold">{sub.letter}</td>
                         {userRole === 'STUDENT' && (
                           <td className="p-3 text-center">
                             <button 
                               onClick={() => handleOpenComplaint(sub)}
                               className="text-text-primary hover:text-[#ffb4ab] transition-colors p-1 rounded-md hover:bg-[#ffb4ab]/10"
                               title="Gửi khiếu nại / Phúc khảo"
                             >
                               <AlertCircle size={18} />
                             </button>
                           </td>
                         )}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {/* Semester Summary */}
               <div className="bg-[#191b23] p-4 border-t border-surface-hover flex flex-wrap gap-6 text-sm text-text-muted">
                 <p>Điểm trung bình HK (Hệ 10): <span className="font-semibold text-text-primary">{sem.summary.avg10}</span></p>
                 <p>Điểm trung bình HK (Hệ 4): <span className="font-semibold text-text-primary">{sem.summary.avg4}</span></p>
                 <p>Số tín chỉ đạt: <span className="font-semibold text-text-primary">{sem.summary.passedCredits}</span></p>
                 <p>Phân loại: <span className="font-semibold text-[#10B981]">{sem.summary.classification}</span></p>
               </div>
            </div>
          ))
        )}

        {/* Total Course Summary */}
        {data.totalSummary && (
          <div className="bg-[#10B981]/10 border border-[#10B981] rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-[#10B981] mb-4 flex items-center gap-2">
              <Award size={20} />
              Tổng kết toàn khóa học
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#10B981]/80 text-sm mb-1">Điểm TB tích lũy (Hệ 10)</p>
                <p className="text-2xl font-bold text-text-primary">{data.totalSummary.cumulativeGpa10}</p>
              </div>
              <div>
                <p className="text-[#10B981]/80 text-sm mb-1">Điểm TB tích lũy (Hệ 4)</p>
                <p className="text-2xl font-bold text-text-primary">{data.totalSummary.cumulativeGpa4}</p>
              </div>
              <div>
                <p className="text-[#10B981]/80 text-sm mb-1">Số tín chỉ tích lũy</p>
                <p className="text-2xl font-bold text-text-primary">{data.totalSummary.cumulativeCredits}</p>
              </div>
              <div>
                <p className="text-[#10B981]/80 text-sm mb-1">Xếp loại toàn khóa</p>
                <p className="text-2xl font-bold text-text-primary">{data.totalSummary.classification}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Modal */}
      {complaintModal.isOpen && complaintModal.subject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-hover w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-surface-hover flex justify-between items-center bg-[#191b23]">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <AlertCircle size={20} className="text-[#df7412]" />
                Gửi Đơn Khiếu Nại Điểm
              </h3>
              <button onClick={() => setComplaintModal({isOpen: false, subject: null})} className="text-text-muted hover:text-[#ffb4ab] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Read Only Info */}
              <div className="bg-canvas border border-surface-hover p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Sinh viên:</span>
                  <span className="text-sm font-medium text-text-primary">{data.studentInfo.name} ({data.studentInfo.id})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Môn học:</span>
                  <span className="text-sm font-medium text-primary">{complaintModal.subject.name} ({complaintModal.subject.id})</span>
                </div>
                <div className="h-px bg-surface-hover w-full my-2"></div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">Quá trình</div>
                    <div className="text-sm font-semibold text-text-primary">{complaintModal.subject.processGrade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">Cuối kỳ</div>
                    <div className="text-sm font-semibold text-text-primary">{complaintModal.subject.examGrade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">Thi L1</div>
                    <div className="text-sm font-semibold text-text-primary">{complaintModal.subject.exam1}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted mb-1">Thi L2</div>
                    <div className="text-sm font-semibold text-text-primary">{complaintModal.subject.exam2 || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* Input Area */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Loại điểm cần khiếu nại <span className="text-[#ffb4ab]">*</span>
                  </label>
                  <select 
                    value={complaintType}
                    onChange={e => setComplaintType(e.target.value)}
                    className="w-full bg-canvas border border-surface-hover rounded-xl px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
                  >
                    <option value="quatrinh">Điểm quá trình</option>
                    <option value="cuoiky">Điểm cuối kỳ</option>
                  </select>
                </div>
                
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Lý do khiếu nại <span className="text-[#ffb4ab]">*</span>
                </label>
                <textarea 
                  value={complaintReason}
                  onChange={e => setComplaintReason(e.target.value)}
                  placeholder="Ghi rõ lý do bạn muốn khiếu nại/phúc khảo điểm số của môn này..."
                  className="w-full bg-canvas border border-surface-hover rounded-xl p-3 text-sm text-text-primary focus:border-primary outline-none h-28 resize-none"
                ></textarea>
                <p className="text-xs text-text-muted mt-2 italic">Lưu ý: Bạn chỉ nên gửi khiếu nại khi có căn cứ rõ ràng về sự sai sót trong quá trình chấm điểm.</p>
              </div>
            </div>
            <div className="p-4 border-t border-surface-hover flex justify-end gap-3 bg-[#191b23]">
              <button 
                onClick={() => setComplaintModal({isOpen: false, subject: null})}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitComplaint}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#4d8eff] text-white hover:bg-[#4d8eff]/90 rounded-lg transition-colors shadow-lg shadow-[#4d8eff]/20"
              >
                <Send size={16} /> Gửi Khiếu Nại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PARENT COMPONENT ---
export default function GradeLookupPage() {
  const { user } = useContext(AuthContext);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // user.RoleID (1: Admin, 2: Teacher, 3: Student)
  let userRole = 'ADMIN';
  if (user?.RoleID === 2) userRole = 'TEACHER';
  if (user?.RoleID === 3) userRole = 'STUDENT';

  // Nếu là sinh viên, lấy mã SV từ username
  // Giả sử username của SV chính là mã SV (như SV001, DTH235801)
  const studentMaSV = user?.Username;

  // If student, force view 2
  if (userRole === 'STUDENT') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Search size={24} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Tra cứu điểm & Tiến độ học tập</h1>
        </div>
        {studentMaSV ? (
          <StudentDetailView 
            studentId={studentMaSV} 
            userRole={userRole} 
            onBack={() => {}} 
          />
        ) : (
          <div className="p-4 bg-semantic-error/10 text-semantic-error rounded">Không tìm thấy mã sinh viên</div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Search size={24} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Tra cứu điểm sinh viên</h1>
      </div>
      
      {selectedStudent ? (
        <StudentDetailView 
          studentId={selectedStudent} 
          userRole={userRole}
          onBack={() => setSelectedStudent(null)} 
        />
      ) : (
        <StudentListView onSelectStudent={setSelectedStudent} />
      )}
    </div>
  );
}
