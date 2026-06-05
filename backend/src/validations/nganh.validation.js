const { z } = require('zod');

const createNganhSchema = z.object({
    body: z.object({
        MaNganh: z.string().min(1, 'Mã Ngành không được để trống'),
        TenNganh: z.string().min(1, 'Tên Ngành không được để trống'),
        MaKhoa: z.string().min(1, 'Mã Khoa không được để trống')
    })
});

const updateNganhSchema = z.object({
    body: z.object({
        TenNganh: z.string().min(1, 'Tên Ngành không được để trống').optional(),
        MaKhoa: z.string().optional()
    })
});

module.exports = {
    createNganhSchema,
    updateNganhSchema
};
