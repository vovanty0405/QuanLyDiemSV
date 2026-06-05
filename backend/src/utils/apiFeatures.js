const { Op } = require('sequelize');

class APIFeatures {
    /**
     * Chuyển đổi req.query thành options cho Sequelize
     * @param {Object} query - req.query
     * @param {Array} searchFields - Mảng các cột cho phép tìm kiếm mờ (LIKE)
     */
    static getSequelizeOptions(query, searchFields = []) {
        const { page = 1, limit = 10000, sort, search, ...filters } = query;
        
        let options = {
            where: {},
            order: []
        };

        // 1. Phân trang (Pagination)
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        if (parsedLimit > 0) {
            options.limit = parsedLimit;
            options.offset = (parsedPage - 1) * parsedLimit;
        }

        // 2. Sắp xếp (Sorting)
        // Ví dụ: ?sort=TenKhoa,asc hoặc ?sort=NgaySinh,desc
        if (sort) {
            const [field, order = 'ASC'] = sort.split(',');
            options.order.push([field, order.toUpperCase()]);
        }

        // 3. Tìm kiếm mờ (Search)
        // Ví dụ: ?search=CNTT
        if (search && searchFields.length > 0) {
            options.where[Op.or] = searchFields.map(field => ({
                [field]: {
                    [Op.like]: `%${search}%`
                }
            }));
        }

        // 4. Lọc chính xác (Filtering)
        // Ví dụ: ?MaKhoa=CNTT
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                options.where[key] = filters[key];
            }
        });

        return options;
    }
}

module.exports = APIFeatures;
