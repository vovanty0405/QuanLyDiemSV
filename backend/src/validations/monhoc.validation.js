const { z } = require('zod');

const createMonHocSchema = z.object({
    body: z.object({
        MaMon: z.string().min(1, 'Mã Môn không được để trống'),
        TenMon: z.string().min(1, 'Tên Môn không được để trống'),
        SoTinChi: z.number().min(1, 'Số tín chỉ phải lớn hơn 0'),
        SoTietLyThuyet: z.number().min(0).optional(),
        SoTietThucHanh: z.number().min(0).optional(),
        MaKhoa: z.string().optional(),
        MonTienQuyetIds: z.array(z.string()).optional() // Danh sách mã môn tiên quyết
    })
});

const updateMonHocSchema = z.object({
    body: z.object({
        TenMon: z.string().min(1).optional(),
        SoTinChi: z.number().min(1).optional(),
        SoTietLyThuyet: z.number().min(0).optional(),
        SoTietThucHanh: z.number().min(0).optional(),
        MaKhoa: z.string().optional(),
        MonTienQuyetIds: z.array(z.string()).optional()
    })
});

module.exports = {
    createMonHocSchema,
    updateMonHocSchema
};
