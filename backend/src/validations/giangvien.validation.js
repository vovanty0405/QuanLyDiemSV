const { z } = require('zod');

const createGiangVienSchema = z.object({
    body: z.object({
        MaGV: z.string().min(1, 'Mã GV không được để trống'),
        HoTen: z.string().min(1, 'Họ tên không được để trống'),
        NgaySinh: z.string().optional(),
        GioiTinh: z.string().optional(),
        Email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
        SDT: z.string().optional(),
        HocVi: z.string().optional(),
        MaKhoa: z.string().optional(),
        CCCD: z.string().optional()
    })
});

const updateGiangVienSchema = z.object({
    body: z.object({
        HoTen: z.string().min(1).optional(),
        NgaySinh: z.string().optional(),
        GioiTinh: z.string().optional(),
        Email: z.string().email().optional().or(z.literal('')),
        SDT: z.string().optional(),
        HocVi: z.string().optional(),
        MaKhoa: z.string().optional(),
        CCCD: z.string().optional()
    })
});

module.exports = {
    createGiangVienSchema,
    updateGiangVienSchema
};
