const { z } = require('zod');

// Regex: 3 chữ cái, 6 chữ số
const MaSVRegex = /^[a-zA-Z]{3}\d{6}$/;

const createSinhVienSchema = z.object({
    body: z.object({
        MaSV: z.string().regex(MaSVRegex, 'Mã SV phải gồm 3 chữ cái và 6 số (VD: DTH235811)'),
        HoTen: z.string().min(1, 'Họ tên không được để trống'),
        NgaySinh: z.string().optional(),
        GioiTinh: z.string().optional(),
        DiaChi: z.string().optional(),
        CCCD: z.string().optional(),
        Email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
        SDT: z.string().optional(),
        MaLop: z.string().optional(),
        TrangThai: z.string().optional()
    })
});

const updateSinhVienSchema = z.object({
    body: z.object({
        HoTen: z.string().min(1).optional(),
        NgaySinh: z.string().optional(),
        GioiTinh: z.string().optional(),
        DiaChi: z.string().optional(),
        CCCD: z.string().optional(),
        Email: z.string().email().optional().or(z.literal('')),
        SDT: z.string().optional(),
        MaLop: z.string().optional(),
        TrangThai: z.string().optional()
    })
});

module.exports = {
    createSinhVienSchema,
    updateSinhVienSchema
};
