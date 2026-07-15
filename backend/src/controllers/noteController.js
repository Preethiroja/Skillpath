const Note = require('../models/Note');

// @desc    Get all notes for current user, optional search text and path filter
// @route   GET /api/student/notes?search=&pathId=
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const { search, pathId } = req.query;
    const query = { user: req.user.id };
    if (pathId) query.pathId = pathId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a note
// @route   POST /api/student/notes
// @access  Private
const createNote = async (req, res, next) => {
  const { title, content, tags, pathId } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Note content is required' });
  }

  try {
    const note = await Note.create({
      user: req.user.id,
      title: title || 'Untitled Note',
      content,
      tags: tags || [],
      pathId: pathId || null,
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/student/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const { title, content, tags, pinned } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (pinned !== undefined) note.pinned = pinned;

    await note.save();
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/student/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
