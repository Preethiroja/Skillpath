const Wishlist = require('../models/Wishlist');
const Resource = require('../models/Resource');
const Course = require('../models/Course');

// @desc    Get wishlist items for current user
// @route   GET /api/student/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('item');
    res.status(200).json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a resource or course to the wishlist
// @route   POST /api/student/wishlist
// @access  Private
const addToWishlist = async (req, res, next) => {
  const { itemType, itemId } = req.body;

  if (!itemType || !itemId || !['Resource', 'Course'].includes(itemType)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid itemType (Resource or Course) and itemId',
    });
  }

  try {
    const Model = itemType === 'Resource' ? Resource : Course;
    const exists = await Model.findById(itemId);
    if (!exists) {
      return res.status(404).json({ success: false, message: `${itemType} not found` });
    }

    let item = await Wishlist.findOne({ user: req.user.id, itemType, item: itemId });
    if (item) {
      await item.populate('item');
      return res.status(200).json({ success: true, item, message: 'Already in wishlist' });
    }

    item = await Wishlist.create({ user: req.user.id, itemType, item: itemId });
    await item.populate('item');
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from the wishlist
// @route   DELETE /api/student/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
