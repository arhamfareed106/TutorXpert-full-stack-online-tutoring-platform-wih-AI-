import { query } from '../db/postgresql.js';
import { SessionTools, SessionChat } from '../models/SessionModels.js';
import { AppError } from '../middleware/errorHandler.js';

// Create a new session
export const createSession = async (req, res, next) => {
  try {
    const { bookingId, videoRoomId } = req.body;

    if (!bookingId) {
      throw new AppError('Booking ID is required', 400);
    }

    // Get booking details
    const bookingResult = await query(
      `SELECT * FROM bookings WHERE booking_id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = bookingResult.rows[0];

    // Check permissions
    if (
      booking.learner_id !== req.user.userId &&
      booking.tutor_id !== req.user.userId
    ) {
      throw new AppError('Unauthorized', 403);
    }

    // Create session
    const result = await query(
      `INSERT INTO sessions (booking_id, video_room_id, start_time)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [bookingId, videoRoomId || null]
    );

    // Update booking status
    await query(
      `UPDATE bookings SET status = 'completed' WHERE booking_id = $1`,
      [bookingId]
    );

    // Initialize session tools in MongoDB
    await SessionTools.create({
      sessionId: result.rows[0].session_id,
      bookingId: bookingId
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Get session by ID
export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        s.*,
        b.subject_id,
        b.learner_id,
        b.tutor_id,
        sub.name as subject_name,
        learner.name as learner_name,
        tutor.name as tutor_name
      FROM sessions s
      JOIN bookings b ON s.booking_id = b.booking_id
      JOIN subjects sub ON b.subject_id = sub.subject_id
      JOIN users learner ON b.learner_id = learner.user_id
      JOIN users tutor ON b.tutor_id = tutor.user_id
      WHERE s.session_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    const session = result.rows[0];

    // Check permissions
    if (
      session.learner_id !== req.user.userId &&
      session.tutor_id !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Unauthorized', 403);
    }

    // Get session tools data from MongoDB
    const toolsData = await SessionTools.findOne({ sessionId: id });

    res.json({
      success: true,
      data: {
        session,
        toolsData: toolsData || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update session notes
export const updateSessionNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await query(
      `UPDATE sessions SET notes = $1 WHERE session_id = $2
       RETURNING *`,
      [notes, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    res.json({
      success: true,
      message: 'Session notes updated',
      data: { session: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Save session tools data
export const saveSessionTools = async (req, res, next) => {
  try {
    const { id } = req.params;
    const toolsData = req.body;

    const session = await SessionTools.findOneAndUpdate(
      { sessionId: id },
      {
        ...toolsData,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Session tools data saved',
      data: { toolsData: session }
    });
  } catch (error) {
    next(error);
  }
};

// Add chat message to session
export const addSessionChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, messageType = 'text', metadata } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const chatMessage = await SessionChat.create({
      sessionId: id,
      senderId: req.user.userId,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      messageType,
      metadata
    });

    res.status(201).json({
      success: true,
      data: { chatMessage }
    });
  } catch (error) {
    next(error);
  }
};

// Get session chat history
export const getSessionChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const messages = await SessionChat.find({ sessionId: id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's sessions
export const getUserSessions = async (req, res, next) => {
  try {
    const { type = 'all', status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;

    let whereClause;
    let values;

    if (type === 'learner') {
      whereClause = 'WHERE b.learner_id = $1';
      values = [userId];
    } else if (type === 'tutor') {
      whereClause = 'WHERE b.tutor_id = $1';
      values = [userId];
    } else {
      whereClause = 'WHERE b.learner_id = $1 OR b.tutor_id = $1';
      values = [userId];
    }

    values.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT 
        s.*,
        b.subject_id,
        b.scheduled_at,
        b.status as booking_status,
        s.start_time,
        s.end_time,
        sub.name as subject_name,
        learner.name as learner_name,
        tutor.name as tutor_name
      FROM sessions s
      JOIN bookings b ON s.booking_id = b.booking_id
      JOIN subjects sub ON b.subject_id = sub.subject_id
      JOIN users learner ON b.learner_id = learner.user_id
      JOIN users tutor ON b.tutor_id = tutor.user_id
      ${whereClause}
      ORDER BY s.start_time DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json({
      success: true,
      data: { sessions: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

// Complete session
export const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, attendance } = req.body;

    const result = await query(
      `UPDATE sessions 
       SET notes = $1, attendance = $2, end_time = CURRENT_TIMESTAMP
       WHERE session_id = $3
       RETURNING *`,
      [notes, attendance || {}, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    res.json({
      success: true,
      message: 'Session completed',
      data: { session: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};
