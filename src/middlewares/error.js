import ErrorResponse from '../utils/errorResponse.js';

/**
 * Middleware xử lý lỗi nâng cao
 * Xử lý các loại lỗi từ Mongoose và trả về response lỗi thống nhất
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi cho việc debug trong môi trường development
  console.error(err);

  // Mongoose - lỗi ObjectId không hợp lệ
  if (err.name === 'CastError') {
    const message = `Không tìm thấy tài nguyên với id: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose - lỗi trùng lặp giá trị unique
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Giá trị ${field} đã tồn tại trong hệ thống`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose - lỗi validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = new ErrorResponse(message, 401);
  }

  // Lỗi JWT hết hạn
  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn, vui lòng đăng nhập lại';
    error = new ErrorResponse(message, 401);
  }

  // Lỗi quá kích thước file upload
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = `File vượt quá kích thước tối đa cho phép`;
    error = new ErrorResponse(message, 400);
  }

  // Lỗi sai loại file upload
  if (err.message && err.message.includes('Chỉ chấp nhận file')) {
    error = new ErrorResponse(err.message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Lỗi máy chủ, vui lòng thử lại sau'
  });
};

export default errorHandler;