// src/controllers/category/categoryController.js
import Category from '../../models/category/Category.js';
import slugify from 'slugify';

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, type, description, icon } = req.body;
    
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: tên và loại danh mục'
      });
    }
    
    // Check if category already exists
    const categoryExists = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type
    });
    
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Danh mục này đã tồn tại'
      });
    }
    
    // Create slug from name
    const slug = slugify(name, {
      lower: true,
      strict: true
    });
    
    // Create category
    const category = await Category.create({
      name,
      type,
      slug,
      description: description || '',
      icon: icon || '',
      active: true
    });
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Đã tạo danh mục mới'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by type if provided
    if (req.params.type) {
      query.type = req.params.type;
    }
    
    // Filter by active status
    if (req.query.active === 'true') {
      query.active = true;
    } else if (req.query.active === 'false') {
      query.active = false;
    }
    
    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Get categories
    const categories = await Category.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy danh mục'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy danh mục'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, active } = req.body;
    
    // Find the category
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy danh mục'
      });
    }
    
    // Update fields
    if (name) {
      category.name = name;
      
      // Update slug if name is changed
      category.slug = slugify(name, {
        lower: true,
        strict: true
      });
    }
    
    if (description !== undefined) {
      category.description = description;
    }
    
    if (icon !== undefined) {
      category.icon = icon;
    }
    
    if (active !== undefined) {
      category.active = active;
    }
    
    // Save the updated category
    await category.save();
    
    res.status(200).json({
      success: true,
      data: category,
      message: 'Đã cập nhật danh mục'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy danh mục'
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa danh mục'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};