const { z } = require('zod');

const createHocKySchema = z.object({
    body: z.object({
        MaHK: z.string().min(1, 'Mã Học Kỳ không được để trống'),
        TenHK: z.string().min(1, 'Tên Học Kỳ không được để trống'),
        NamHocBatDau: z.number({ required_error: 'Năm học bắt đầu là bắt buộc' }),
        NamHocKetThuc: z.number({ required_error: 'Năm học kết thúc là bắt buộc' })
    })
});

const updateHocKySchema = z.object({
    body: z.object({
        TenHK: z.string().optional(),
        NamHocBatDau: z.number().optional(),
        NamHocKetThuc: z.number().optional()
    })
});

module.exports = {
    createHocKySchema,
    updateHocKySchema
};
