const { z } = require('zod');

const loginSchema = z.object({
    body: z.object({
        username: z.string().min(1, 'Username không được để trống'),
        password: z.string().min(1, 'Mật khẩu không được để trống')
    })
});
module.exports = {
    loginSchema
};
