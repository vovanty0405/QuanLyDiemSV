const { SinhVien, KetQuaHocTap, LopHocPhan, MonHoc, HocKy, LopHanhChinh, Khoa, Nganh, GiangVien, QuyDinhTotNghiep, KhungChuongTrinh } = require('../models');
const AppError = require('../utils/AppError');

// Hàm chuyển đổi điểm hệ 10 sang chữ và hệ 4
const getGradeInfo = (diemTongKet) => {
    if (diemTongKet === null || diemTongKet === undefined) return { letter: '', he4: 0 };
    if (diemTongKet >= 9.0) return { letter: 'A+', he4: 4.0 };
    if (diemTongKet >= 8.5) return { letter: 'A', he4: 3.8 }; // Hoặc 4.0 tùy trường
    if (diemTongKet >= 8.0) return { letter: 'B+', he4: 3.5 };
    if (diemTongKet >= 7.0) return { letter: 'B', he4: 3.0 };
    if (diemTongKet >= 6.5) return { letter: 'C+', he4: 2.5 };
    if (diemTongKet >= 5.5) return { letter: 'C', he4: 2.0 };
    if (diemTongKet >= 5.0) return { letter: 'D+', he4: 1.5 };
    if (diemTongKet >= 4.0) return { letter: 'D', he4: 1.0 };
    return { letter: 'F', he4: 0.0 };
};

// Hàm phân loại tốt nghiệp/xếp loại
const getClassification = (gpa) => {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
};

exports.getAllStudentSummary = async (req, res, next) => {
    try {
        const { user } = req;
        
        // Điều kiện query
        let sinhVienWhere = {};
        
        // Nếu là Giảng viên, chỉ lấy SV thuộc lớp mình quản lý
        if (user.RoleID === 2) {
            const giangVien = await GiangVien.findOne({ where: { UserID: user.UserID } });
            if (!giangVien) {
                return next(new AppError(403, 'Không tìm thấy thông tin giảng viên'));
            }
            // Tìm các lớp hành chính giảng viên này làm GVCN
            const lops = await LopHanhChinh.findAll({ where: { MaGVCN: giangVien.MaGV } });
            const maLops = lops.map(l => l.MaLop);
            sinhVienWhere.MaLop = maLops;
        }

        const sinhViens = await SinhVien.findAll({
            where: sinhVienWhere,
            include: [
                {
                    model: LopHanhChinh,
                    include: [{ model: Nganh, include: [Khoa] }]
                },
                {
                    model: KetQuaHocTap,
                    include: [{
                        model: LopHocPhan,
                        include: [MonHoc]
                    }]
                }
            ]
        });

        const result = sinhViens.map(sv => {
            let totalCredits = 0;
            let totalPoint10 = 0;
            let totalPoint4 = 0;

            const ketQuas = sv.KetQuaHocTaps || [];
            
            ketQuas.forEach(kq => {
                // Chỉ tính môn đã có điểm tổng kết
                if (kq.DiemTongKet !== null) {
                    const credits = kq.LopHocPhan?.MonHoc?.SoTinChi || 0;
                    const gradeInfo = getGradeInfo(kq.DiemTongKet);
                    
                    if (gradeInfo.letter !== 'F') { // Đậu mới tính tín chỉ tích lũy (tùy quy chế)
                        totalCredits += credits;
                    }
                    
                    // Tuy nhiên điểm trung bình thường tính tất cả các môn đã học (trừ khi học lại lấy điểm cao hơn - logic phức tạp hơn)
                    // Ở đây tính đơn giản: trung bình tất cả
                    totalPoint10 += kq.DiemTongKet * credits;
                    totalPoint4 += gradeInfo.he4 * credits;
                }
            });

            // Tổng tín chỉ đã học (kể cả rớt) để chia trung bình
            const totalAttemptedCredits = ketQuas.reduce((sum, kq) => sum + (kq.LopHocPhan?.MonHoc?.SoTinChi || 0), 0);

            const gpa10 = totalAttemptedCredits > 0 ? (totalPoint10 / totalAttemptedCredits).toFixed(2) : 0;
            const gpa4 = totalAttemptedCredits > 0 ? (totalPoint4 / totalAttemptedCredits).toFixed(2) : 0;

            return {
                id: sv.MaSV,
                name: sv.HoTen,
                className: sv.MaLop,
                department: sv.LopHanhChinh?.Nganh?.Khoa?.TenKhoa || 'Chưa rõ',
                gpa: parseFloat(gpa10), // Giữ API cũ tương thích gpa = hệ 10
                gpa4: parseFloat(gpa4),
                credits: totalCredits // Tín chỉ tích lũy (các môn đậu)
            };
        });

        res.status(200).json({
            status: 'success',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

exports.getStudentTranscriptDetail = async (req, res, next) => {
    try {
        const { masv } = req.params;
        const { user } = req;

        // Sinh viên chỉ được xem của chính mình
        if (user.RoleID === 3) {
            const currentSV = await SinhVien.findOne({ where: { UserID: user.UserID } });
            if (!currentSV || currentSV.MaSV !== masv) {
                return next(new AppError(403, 'Bạn không có quyền xem điểm của sinh viên khác'));
            }
        }

        const sv = await SinhVien.findOne({
            where: { MaSV: masv },
            include: [
                {
                    model: LopHanhChinh,
                    include: [
                        { model: Nganh, include: [Khoa] },
                        { model: GiangVien } // GVCN
                    ]
                },
                {
                    model: KetQuaHocTap,
                    include: [{
                        model: LopHocPhan,
                        include: [MonHoc, HocKy]
                    }]
                }
            ]
        });

        if (!sv) {
            return next(new AppError(404, 'Không tìm thấy sinh viên'));
        }

        const maNganh = sv.LopHanhChinh?.Nganh?.MaNganh;
        let quyDinhTotNghiep = null;
        let dsKhung = [];
        
        if (maNganh) {
            quyDinhTotNghiep = await QuyDinhTotNghiep.findOne({ where: { MaNganh: maNganh } });
            dsKhung = await KhungChuongTrinh.findAll({ where: { MaNganh: maNganh } });
        }
        
        const khungMap = {};
        dsKhung.forEach(k => {
            khungMap[k.MaMon] = k.LoaiMon;
        });

        const targetTongTTC = quyDinhTotNghiep ? quyDinhTotNghiep.TongTTC : 130;
        const targetTCBatBuoc = quyDinhTotNghiep ? quyDinhTotNghiep.TCBatBuoc : 100;
        const targetMinGPA = quyDinhTotNghiep ? quyDinhTotNghiep.MinGPA : 2.0;

        const ketQuas = sv.KetQuaHocTaps || [];
        
        // Nhóm điểm theo học kỳ
        const semestersMap = {};
        let totalCompletedCredits = 0;
        let totalCompletedBatBuoc = 0;
        let totalAttemptedCredits = 0;
        let totalPoint10 = 0;
        let totalPoint4 = 0;
        let failedSubjects = [];
        let failedBatBuoc = [];

        // Lọc môn học có điểm cao nhất để kiểm tra nợ môn Bắt buộc
        const bestGrades = {};

        ketQuas.forEach(kq => {
            if (!kq.LopHocPhan || !kq.LopHocPhan.HocKy) return;
            
            const hk = kq.LopHocPhan.HocKy;
            const hkName = hk.TenHK + ' ' + hk.NamHocBatDau + '-' + hk.NamHocKetThuc;
            
            if (!semestersMap[hk.MaHK]) {
                semestersMap[hk.MaHK] = {
                    name: hkName,
                    subjects: [],
                    totalCreditsForAvg: 0,
                    totalPoint10: 0,
                    totalPoint4: 0,
                    passedCredits: 0
                };
            }

            const monHoc = kq.LopHocPhan.MonHoc;
            const credits = monHoc ? monHoc.SoTinChi : 0;
            const gradeInfo = getGradeInfo(kq.DiemTongKet);

            semestersMap[hk.MaHK].subjects.push({
                id: monHoc ? monHoc.MaMon : '',
                maLHP: kq.MaLHP,
                name: monHoc ? monHoc.TenMon : '',
                credits: credits,
                processGrade: kq.DiemGK !== null ? kq.DiemGK : '-',
                examGrade: kq.DiemCK !== null ? kq.DiemCK : '-',
                exam1: kq.DiemThiLan1 !== null ? kq.DiemThiLan1 : '-',
                exam2: kq.DiemThiLan2 !== null ? kq.DiemThiLan2 : '-',
                total10: kq.DiemTongKet !== null ? kq.DiemTongKet : '-',
                total4: gradeInfo.he4 || '-',
                letter: kq.DiemChu || gradeInfo.letter
            });

            if (kq.DiemTongKet !== null) {
                const loaiMon = monHoc ? (khungMap[monHoc.MaMon] || 'Tự chọn') : 'Tự chọn';
                
                // Track best grades to accurately determine if student ultimately failed a required course
                if (monHoc) {
                    if (!bestGrades[monHoc.MaMon] || bestGrades[monHoc.MaMon].DiemTongKet < kq.DiemTongKet) {
                        bestGrades[monHoc.MaMon] = {
                            DiemTongKet: kq.DiemTongKet,
                            TenMon: monHoc.TenMon,
                            LoaiMon: loaiMon,
                            Letter: gradeInfo.letter
                        };
                    }
                }

                semestersMap[hk.MaHK].totalCreditsForAvg += credits;
                semestersMap[hk.MaHK].totalPoint10 += kq.DiemTongKet * credits;
                semestersMap[hk.MaHK].totalPoint4 += gradeInfo.he4 * credits;
                
                totalAttemptedCredits += credits;
                totalPoint10 += kq.DiemTongKet * credits;
                totalPoint4 += gradeInfo.he4 * credits;

                if (gradeInfo.letter === 'F') {
                    failedSubjects.push(monHoc ? monHoc.TenMon : 'Unknown');
                } else {
                    semestersMap[hk.MaHK].passedCredits += credits;
                    totalCompletedCredits += credits;
                    if (loaiMon === 'Bắt buộc') {
                        totalCompletedBatBuoc += credits;
                    }
                }
            }
        });

        const semestersArray = Object.values(semestersMap).map(sem => {
            const avg10 = sem.totalCreditsForAvg > 0 ? (sem.totalPoint10 / sem.totalCreditsForAvg).toFixed(2) : 0;
            const avg4 = sem.totalCreditsForAvg > 0 ? (sem.totalPoint4 / sem.totalCreditsForAvg).toFixed(2) : 0;
            return {
                name: sem.name,
                subjects: sem.subjects,
                summary: {
                    avg10: parseFloat(avg10),
                    avg4: parseFloat(avg4),
                    passedCredits: sem.passedCredits,
                    classification: getClassification(avg4)
                }
            };
        });

        const cumulativeGpa10 = totalAttemptedCredits > 0 ? (totalPoint10 / totalAttemptedCredits).toFixed(2) : 0;
        const cumulativeGpa4 = totalAttemptedCredits > 0 ? (totalPoint4 / totalAttemptedCredits).toFixed(2) : 0;
        
        // Determine ultimately failed mandatory subjects
        const ultimateFailedBatBuoc = Object.values(bestGrades)
            .filter(g => g.Letter === 'F' && g.LoaiMon === 'Bắt buộc')
            .map(g => g.TenMon);
            
        const isEligible = totalCompletedCredits >= targetTongTTC && 
                           totalCompletedBatBuoc >= targetTCBatBuoc &&
                           ultimateFailedBatBuoc.length === 0 && 
                           cumulativeGpa4 >= targetMinGPA;

        const transcriptData = {
            studentInfo: {
                id: sv.MaSV,
                name: sv.HoTen,
                className: sv.MaLop,
                department: sv.LopHanhChinh?.Nganh?.Khoa?.TenKhoa || 'Chưa rõ',
                major: sv.LopHanhChinh?.Nganh?.TenNganh || 'Chưa rõ',
                advisor: sv.LopHanhChinh?.GiangVien?.HoTen || 'Chưa phân công'
            },
            progress: {
                completedCredits: totalCompletedCredits,
                totalCredits: targetTongTTC,
                isGraduationEligible: isEligible,
                graduationType: getClassification(cumulativeGpa4),
                failedSubjects: ultimateFailedBatBuoc.length > 0 ? ultimateFailedBatBuoc : [...new Set(failedSubjects)]
            },
            totalSummary: {
                cumulativeGpa10: parseFloat(cumulativeGpa10),
                cumulativeGpa4: parseFloat(cumulativeGpa4),
                cumulativeCredits: totalCompletedCredits,
                classification: getClassification(cumulativeGpa4)
            },
            semesters: semestersArray
        };

        res.status(200).json({
            status: 'success',
            data: transcriptData
        });

    } catch (error) {
        next(error);
    }
};
