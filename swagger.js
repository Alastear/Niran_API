const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Niran Cars API',
      version: '1.0.0',
      description: 'API สำหรับระบบซื้อ-ขายรถยนต์ Niran Cars',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Development' },
    ],
    'x-env-vars-required': [
      'DATABASE_URL',
      'TOKEN_KEY',
      'REFRESH_TOKEN_KEY',
      'BLOB_READ_WRITE_TOKEN',
    ],
    components: {
      securitySchemes: {
        AccessToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-access-token',
          description: 'JWT access token ที่ได้จาก /api/user/login',
        },
      },
      schemas: {
        CarStore: {
          type: 'object',
          properties: {
            _id: { type: 'integer', example: 1 },
            cars_title: { type: 'string', example: 'Toyota Camry 2024' },
            brand_name: { type: 'string', example: 'Toyota' },
            model_name: { type: 'string', example: 'Camry' },
            cars_image_default: { type: 'string', example: 'abc123.jpeg' },
            cars_image: { type: 'array', items: { type: 'string' } },
            cars_detail: { type: 'object', example: { year: '2024', color: 'ขาว', mileage: '50000' } },
            cars_subdetail: { type: 'array', items: { type: 'object' } },
            cars_description: { type: 'string' },
            cars_status: { type: 'string', enum: ['SELL', 'SOLD', 'BOOKING'] },
            cars_tag: { type: 'string' },
            createDate: { type: 'string', format: 'date-time' },
            updateDate: { type: 'string', format: 'date-time' },
          },
        },
        Brand: {
          type: 'object',
          properties: {
            _id: { type: 'integer', example: 1 },
            brand_name: { type: 'string', example: 'Toyota' },
            brand_description: { type: 'string' },
            brand_image: { type: 'string' },
            updateDate: { type: 'string', format: 'date-time' },
          },
        },
        Model: {
          type: 'object',
          properties: {
            _id: { type: 'integer', example: 1 },
            model_name: { type: 'string', example: 'Camry' },
            brand_name: { type: 'string', example: 'Toyota' },
            model_submodel: { type: 'array', items: { type: 'string' }, example: ['2.0 G', '2.5 HV'] },
            model_description: { type: 'string' },
            model_image: { type: 'array', items: { type: 'string' } },
            updateDate: { type: 'string', format: 'date-time' },
          },
        },
        CarDetail: {
          type: 'object',
          properties: {
            _id: { type: 'integer', example: 1 },
            cardt_title: { type: 'string', example: 'ระบบเครื่องยนต์' },
            cardt_type: { type: 'string', example: 'engine' },
            cardt_description: { type: 'string', example: 'เครื่องยนต์ 2.5L 4 สูบ' },
            updateDate: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@niran.com' },
            tel: { type: 'string', example: '0812345678' },
            position: { type: 'string', enum: ['ADMIN', ''], example: 'ADMIN' },
            createDate: { type: 'string', format: 'date-time' },
            updateDate: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./Routes/*.js'],
};

module.exports = swaggerJsdoc(options);
