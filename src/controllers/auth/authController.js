import User from '../../models/User.js';

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Prepare user data (without sensitive info)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    avatarUrl: `/uploads/avatars/${user.avatar}`
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if required fields exist
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: name, email, password, role'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Validate password manually
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 8 ký tự'
      });
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 1 chữ hoa'
      });
    }

    // Check for number
    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 1 số'
      });
    }

    // Check for special character
    if (!/[@$!%*?&#]/.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &, #)'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không hợp lệ'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get current logged in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      avatarUrl: `/uploads/avatars/${user.avatar}`,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Log user out / clear cookie
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};