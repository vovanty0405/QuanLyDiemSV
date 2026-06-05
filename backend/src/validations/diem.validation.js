const { z } = require('zod');

// Schema điểm cơ bản: 0-10, phải là số
const diemField = z.number()
    .min(0, 'Điểm không được âm')
    .max(10, 'Điểm không được vượt quá 10');

const capNhatDiemSchema = z.object({
    body: z.object({
        DiemCC: diemField.optional(),
        DiemGK: diemField.optional(),
        DiemCK: diemField.optional(),
        password: z.string().min(1, 'Vui lòng nhập mật khẩu để xác nhận lưu điểm')
    })
});

const capNhatDiemHangLoatSchema = z.object({
    body: z.object({
        danhSachDiem: z.array(z.object({
            MaSV: z.string().min(1, 'Mã Sinh Viên không được để trống'),
            DiemCC: diemField.optional(),
            DiemGK: diemField.optional(),
            DiemCK: diemField.optional()
        })).min(1, 'Danh sách điểm không được rỗng'),
        password: z.string().min(1, 'Vui lòng nhập mật khẩu để xác nhận lưu điểm')
    })
});

const thiLaiCaiThienSchema = z.object({
    body: z.object({
        DiemCK: diemField,
        password: z.string().min(1, 'Vui lòng nhập mật khẩu để xác nhận lưu điểm')
    })
});

module.exports = {
    capNhatDiemSchema,
    capNhatDiemHangLoatSchema,
    thiLaiCaiThienSchema
};
