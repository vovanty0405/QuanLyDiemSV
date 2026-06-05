const { z } = require('zod');

const createKhoaSchema = z.object({
    body: z.object({
        MaKhoa: z.string().min(1, 'Mã Khoa không được để trống'),
        TenKhoa: z.string().min(1, 'Tên Khoa không được để trống'),
        NgayThanhLap: z.string().optional(),
        TruongKhoa: z.string().optional()
    })
});

const updateKhoaSchema = z.object({
    body: z.object({
        TenKhoa: z.string().min(1, 'Tên Khoa không được để trống').optional(),
        NgayThanhLap: z.string().optional(),
        TruongKhoa: z.string().optional()
    })
});

module.exports = {
    createKhoaSchema,
    updateKhoaSchema
};
