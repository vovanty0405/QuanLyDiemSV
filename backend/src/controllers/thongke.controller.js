const { Op, fn, col, literal } = require('sequelize');
const {
    sequelize,
    SinhVien,
    GiangVien,
    LopHocPhan,
    MonHoc,
    KetQuaHocTap,
    HocKy,
    Khoa,
    Nganh,
    LopHanhChinh
} = require('../models');

// 1. Tổng quan hệ thống
exports.getTongQuan = async (req, res, next) => {
    try {
        const [tongSV, tongGV, tongLHP, tongMon] = await Promise.all([
            SinhVien.count(),
            GiangVien.count(),
            LopHocPhan.count(),
            MonHoc.count()
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                tongSinhVien: tongSV,
                tongGiangVien: tongGV,
                tongLopHocPhan: tongLHP,
                tongMonHoc: tongMon
            }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Phân bố điểm tổng kết (theo khoảng 0-1, 1-2, ..., 9-10)
exports.getPhanBoDiem = async (req, res, next) => {
    try {
        const { maHK } = req.query;

        // Build WHERE clause
        const whereClause = {
            DiemTongKet: { [Op.not]: null }
        };

        // If filtering by semester, need to join with LopHocPhan
        let includeClause = [];
        if (maHK) {
            includeClause = [{
                model: LopHocPhan,
                attributes: [],
                where: { MaHK: maHK },
                required: true
            }];
        }

        const results = await KetQuaHocTap.findAll({
            attributes: [
                [literal(`
                    CASE
                        WHEN DiemTongKet >= 0 AND DiemTongKet < 1 THEN '0-1'
                        WHEN DiemTongKet >= 1 AND DiemTongKet < 2 THEN '1-2'
                        WHEN DiemTongKet >= 2 AND DiemTongKet < 3 THEN '2-3'
                        WHEN DiemTongKet >= 3 AND DiemTongKet < 4 THEN '3-4'
                        WHEN DiemTongKet >= 4 AND DiemTongKet < 5 THEN '4-5'
                        WHEN DiemTongKet >= 5 AND DiemTongKet < 6 THEN '5-6'
                        WHEN DiemTongKet >= 6 AND DiemTongKet < 7 THEN '6-7'
                        WHEN DiemTongKet >= 7 AND DiemTongKet < 8 THEN '7-8'
                        WHEN DiemTongKet >= 8 AND DiemTongKet < 9 THEN '8-9'
                        WHEN DiemTongKet >= 9 AND DiemTongKet <= 10 THEN '9-10'
                    END
                `), 'khoangDiem'],
                [fn('COUNT', col('MaKQ')), 'soLuong']
            ],
            where: whereClause,
            include: includeClause,
            group: [literal(`
                CASE
                    WHEN DiemTongKet >= 0 AND DiemTongKet < 1 THEN '0-1'
                    WHEN DiemTongKet >= 1 AND DiemTongKet < 2 THEN '1-2'
                    WHEN DiemTongKet >= 2 AND DiemTongKet < 3 THEN '2-3'
                    WHEN DiemTongKet >= 3 AND DiemTongKet < 4 THEN '3-4'
                    WHEN DiemTongKet >= 4 AND DiemTongKet < 5 THEN '4-5'
                    WHEN DiemTongKet >= 5 AND DiemTongKet < 6 THEN '5-6'
                    WHEN DiemTongKet >= 6 AND DiemTongKet < 7 THEN '6-7'
                    WHEN DiemTongKet >= 7 AND DiemTongKet < 8 THEN '7-8'
                    WHEN DiemTongKet >= 8 AND DiemTongKet < 9 THEN '8-9'
                    WHEN DiemTongKet >= 9 AND DiemTongKet <= 10 THEN '9-10'
                END
            `)],
            raw: true
        });

        // Ensure all ranges exist (fill empty ones with 0)
        const allRanges = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'];
        const filled = allRanges.map(range => {
            const found = results.find(r => r.khoangDiem === range);
            return {
                khoangDiem: range,
                soLuong: found ? parseInt(found.soLuong) : 0
            };
        });

        res.status(200).json({
            status: 'success',
            data: filled
        });
    } catch (error) {
        next(error);
    }
};

// 3. Xếp loại học lực (DiemChu)
exports.getXepLoai = async (req, res, next) => {
    try {
        const { maHK } = req.query;

        const whereClause = {
            DiemChu: { [Op.not]: null, [Op.ne]: '' }
        };

        let includeClause = [];
        if (maHK) {
            includeClause = [{
                model: LopHocPhan,
                attributes: [],
                where: { MaHK: maHK },
                required: true
            }];
        }

        const results = await KetQuaHocTap.findAll({
            attributes: [
                'DiemChu',
                [fn('COUNT', col('MaKQ')), 'soLuong']
            ],
            where: whereClause,
            include: includeClause,
            group: ['DiemChu'],
            raw: true
        });

        // Ensure all letter grades exist
        const allGrades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
        const filled = allGrades.map(grade => {
            const found = results.find(r => r.DiemChu === grade);
            return {
                diemChu: grade,
                soLuong: found ? parseInt(found.soLuong) : 0
            };
        });

        res.status(200).json({
            status: 'success',
            data: filled
        });
    } catch (error) {
        next(error);
    }
};

// 4. GPA trung bình theo Khoa
exports.getGPATheoKhoa = async (req, res, next) => {
    try {
        const { maHK } = req.query;

        let maHKCondition = '';
        let replacements = {};
        if (maHK) {
            maHKCondition = 'AND lhp.MaHK = :maHK';
            replacements.maHK = maHK;
        }

        const results = await sequelize.query(`
            SELECT 
                k.MaKhoa,
                k.TenKhoa,
                ROUND(AVG(kq.DiemTongKet), 2) AS gpaAvg,
                COUNT(DISTINCT sv.MaSV) AS tongSV
            FROM KetQuaHocTap kq
            INNER JOIN SinhVien sv ON kq.MaSV = sv.MaSV
            INNER JOIN LopHanhChinh lhc ON sv.MaLop = lhc.MaLop
            INNER JOIN Nganh n ON lhc.MaNganh = n.MaNganh
            INNER JOIN Khoa k ON n.MaKhoa = k.MaKhoa
            INNER JOIN LopHocPhan lhp ON kq.MaLHP = lhp.MaLHP
            WHERE kq.DiemTongKet IS NOT NULL
            ${maHKCondition}
            GROUP BY k.MaKhoa, k.TenKhoa
            ORDER BY gpaAvg DESC
        `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            status: 'success',
            data: results.map(r => ({
                maKhoa: r.MaKhoa,
                tenKhoa: r.TenKhoa,
                gpaAvg: parseFloat(r.gpaAvg) || 0,
                tongSV: parseInt(r.tongSV)
            }))
        });
    } catch (error) {
        next(error);
    }
};

// 5. Top sinh viên điểm cao nhất
exports.getTopSinhVien = async (req, res, next) => {
    try {
        const { maHK, limit = 10 } = req.query;

        let maHKCondition = '';
        let replacements = { limit: parseInt(limit) };
        if (maHK) {
            maHKCondition = 'AND lhp.MaHK = :maHK';
            replacements.maHK = maHK;
        }

        const results = await sequelize.query(`
            SELECT 
                sv.MaSV,
                sv.HoTen,
                lhc.TenLop,
                k.TenKhoa,
                ROUND(AVG(kq.DiemTongKet), 2) AS gpaAvg,
                COUNT(kq.MaKQ) AS soMon
            FROM KetQuaHocTap kq
            INNER JOIN SinhVien sv ON kq.MaSV = sv.MaSV
            INNER JOIN LopHanhChinh lhc ON sv.MaLop = lhc.MaLop
            INNER JOIN Nganh n ON lhc.MaNganh = n.MaNganh
            INNER JOIN Khoa k ON n.MaKhoa = k.MaKhoa
            INNER JOIN LopHocPhan lhp ON kq.MaLHP = lhp.MaLHP
            WHERE kq.DiemTongKet IS NOT NULL
            ${maHKCondition}
            GROUP BY sv.MaSV, sv.HoTen, lhc.TenLop, k.TenKhoa
            ORDER BY gpaAvg DESC
            LIMIT :limit
        `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            status: 'success',
            data: results.map((r, index) => ({
                hang: index + 1,
                maSV: r.MaSV,
                hoTen: r.HoTen,
                tenLop: r.TenLop,
                tenKhoa: r.TenKhoa,
                gpaAvg: parseFloat(r.gpaAvg) || 0,
                soMon: parseInt(r.soMon)
            }))
        });
    } catch (error) {
        next(error);
    }
};
