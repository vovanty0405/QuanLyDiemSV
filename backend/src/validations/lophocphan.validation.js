const { z } = require('zod');

const createLopHocPhanSchema = z.object({
    body: z.object({
        MaLHP: z.string().min(1, 'Mã Lớp Học Phần không được để trống'),
        MaMon: z.string().min(1, 'Mã Môn không được để trống'),
        MaHK: z.string().min(1, 'Mã Học Kỳ không được để trống'),
        TenLopHP: z.string().min(1, 'Tên Lớp Học Phần không được để trống'),
        SiSoToiDa: z.number().int().min(1, 'Sĩ số tối đa phải lớn hơn 0'),
        MaGV: z.string().optional(),
        PhongHoc: z.string().optional(),
        TrangThai: z.string().optional()
    })
});

const updateLopHocPhanSchema = z.object({
    body: z.object({
        TenLopHP: z.string().min(1).optional(),
        SiSoToiDa: z.number().int().min(1).optional(),
        MaGV: z.string().optional(),
        PhongHoc: z.string().optional(),
        TrangThai: z.string().optional()
    })
});

const dangKyHocPhanSchema = z.object({
    body: z.object({
        MaSV: z.string().min(1, 'Mã Sinh Viên không được để trống')
    })
});

module.exports = {
    createLopHocPhanSchema,
    updateLopHocPhanSchema,
    dangKyHocPhanSchema
};
