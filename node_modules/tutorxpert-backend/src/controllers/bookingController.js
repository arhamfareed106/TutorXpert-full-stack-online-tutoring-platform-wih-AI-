import { query } from '../db/postgresql.js';
import { AppError } from '../middleware/errorHandler.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      tutorId,
      subjectId,
      scheduledAt,
      durationMinutes = 60,
      notes
    } = req.body;

    if (!tutorId || !subjectId || !scheduledAt) {
      throw new AppError('Tutor, subject, and scheduled time are required', 400);
    }

    const learnerId = req.user.userId;

    // Get tutor's hourly rate
    const tutorResult = await query(
      `SELECT hourly_rate, currency FROM tutor_profiles WHERE user_id = $1`,
      [tutorId]
    );

    if (tutorResult.rows.length === 0) {
      throw new AppError('Tutor not found', 404);
    }

    const tutor = tutorResult.rows[0];
    const totalAmount = (parseFloat(tutor.hourly_rate) * durationMinutes) / 60;

    // Check for scheduling conflicts
    const conflictCheck = await query(
      `SELECT booking_id FROM bookings
       WHERE tutor_id = $1
         AND scheduled_at = $2
         AND status IN ('pending', 'confirmed')`,
      [tutorId, scheduledAt]
    );

    if (conflictCheck.rows.length > 0) {
      throw new AppError('This time slot is already booked', 400);
    }

    // Create booking
    const result = await query(
      `INSERT INTO bookings (
        learner_id, tutor_id, subject_id, scheduled_at, duration_minutes,
        total_amount, currency, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        learnerId,
        tutorId,
        subjectId,
        scheduledAt,
        durationMinutes,
        totalAmount,
        tutor.currency || 'USD',
        notes || null
      ]
    );

    const booking = result.rows[0];

    // Create notification for tutor
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'new_booking', 'New Booking Request', 
         'You have a new booking request.', 
         json_build_object('booking_id', $2, 'learner_id', $3))`,
      [tutorId, booking.booking_id, learnerId]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings for user
export const getBookings = async (req, res, next) => {
  try {
    const { status, type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause;
    let values;

    if (userRole === 'learner' || type === 'learner') {
      whereClause = 'WHERE b.learner_id = $1';
      values = [userId];
    } else if (userRole === 'tutor' || type === 'tutor') {
      whereClause = 'WHERE b.tutor_id = $1';
      values = [userId];
    } else {
      whereClause = 'WHERE b.learner_id = $1 OR b.tutor_id = $1';
      values = [userId];
    }

    if (status) {
      whereClause += ` AND b.status = $${values.length + 1}`;
      values.push(status);
    }

    values.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT 
        b.*,
        s.name as subject_name,
        s.icon as subject_icon,
        learner.name as learner_name,
        learner.profile_pic as learner_pic,
        tutor.name as tutor_name,
        tutor.profile_pic as tutor_pic,
        tutor.rating as tutor_rating
      FROM bookings b
      JOIN subjects s ON b.subject_id = s.subject_id
      JOIN users learner ON b.learner_id = learner.user_id
      JOIN users tutor ON b.tutor_id = tutor.user_id
      ${whereClause}
      ORDER BY b.scheduled_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b ${whereClause}`,
      values.slice(0, values.length - 2)
    );

    res.json({
      success: true,
      data: {
        bookings: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        b.*,
        s.name as subject_name,
        s.description as subject_description,
        learner.name as learner_name,
        learner.email as learner_email,
        learner.profile_pic as learner_pic,
        tutor.name as tutor_name,
        tutor.email as tutor_email,
        tutor.profile_pic as tutor_pic,
        tutor.rating as tutor_rating,
        tp.introduction as tutor_intro
      FROM bookings b
      JOIN subjects s ON b.subject_id = s.subject_id
      JOIN users learner ON b.learner_id = learner.user_id
      JOIN users tutor ON b.tutor_id = tutor.user_id
      LEFT JOIN tutor_profiles tp ON tutor.user_id = tp.user_id
      WHERE b.booking_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = result.rows[0];

    // Check permissions
    if (
      booking.learner_id !== req.user.userId &&
      booking.tutor_id !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Unauthorized', 403);
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Confirm booking (tutor action)
export const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE bookings 
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $1 AND tutor_id = $2
       RETURNING *`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found or unauthorized', 404);
    }

    // Create notification for learner
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       SELECT 
         learner_id,
         'booking_confirmed',
         'Booking Confirmed!',
         'Your tutoring session has been confirmed.',
         json_build_object('booking_id', $1)
       FROM bookings WHERE booking_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Booking confirmed',
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if user is learner or tutor of this booking
    const bookingCheck = await query(
      `SELECT * FROM bookings WHERE booking_id = $1`,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = bookingCheck.rows[0];

    if (
      booking.learner_id !== req.user.userId &&
      booking.tutor_id !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Unauthorized', 403);
    }

    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled', cancellation_reason = $1, updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $2
       RETURNING *`,
      [reason || null, id]
    );

    // Create notification for the other party
    const notifierId = booking.learner_id === req.user.userId ? booking.tutor_id : booking.learner_id;
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'booking_cancelled', 'Booking Cancelled', 
         'A tutoring session has been cancelled.', 
         json_build_object('booking_id', $2, 'reason', $3))`,
      [notifierId, id, reason]
    );

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Reschedule booking
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      throw new AppError('New scheduled time is required', 400);
    }

    const bookingCheck = await query(
      `SELECT * FROM bookings WHERE booking_id = $1`,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = bookingCheck.rows[0];

    // Check permissions
    if (
      booking.learner_id !== req.user.userId &&
      booking.tutor_id !== req.user.userId
    ) {
      throw new AppError('Unauthorized', 403);
    }

    // Check for conflicts at new time
    const conflictCheck = await query(
      `SELECT booking_id FROM bookings
       WHERE tutor_id = $1
         AND scheduled_at = $2
         AND status IN ('pending', 'confirmed')
         AND booking_id != $3`,
      [booking.tutor_id, scheduledAt, id]
    );

    if (conflictCheck.rows.length > 0) {
      throw new AppError('This time slot is already booked', 400);
    }

    const result = await query(
      `UPDATE bookings 
       SET scheduled_at = $1, updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $2
       RETURNING *`,
      [scheduledAt, id]
    );

    // Create notification for the other party
    const notifierId = booking.learner_id === req.user.userId ? booking.tutor_id : booking.learner_id;
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, 'booking_rescheduled', 'Booking Rescheduled', 
         'A tutoring session has been rescheduled.', 
         json_build_object('booking_id', $2, 'new_time', $3))`,
      [notifierId, id, scheduledAt]
    );

    res.json({
      success: true,
      message: 'Booking rescheduled',
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Get tutor availability
export const getTutorAvailability = async (req, res, next) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    // Get tutor's availability settings
    const tutorResult = await query(
      `SELECT availability FROM tutor_profiles WHERE user_id = $1`,
      [tutorId]
    );

    if (tutorResult.rows.length === 0) {
      throw new AppError('Tutor not found', 404);
    }

    const availability = tutorResult.rows[0].availability || [];

    // Get booked slots
    const bookedResult = await query(
      `SELECT scheduled_at, duration_minutes
       FROM bookings
       WHERE tutor_id = $1
         AND scheduled_at BETWEEN $2 AND $3
         AND status IN ('pending', 'confirmed')`,
      [tutorId, startDate, endDate]
    );

    const bookedSlots = bookedResult.rows.map(row => ({
      start: row.scheduled_at,
      end: new Date(new Date(row.scheduled_at).getTime() + row.duration_minutes * 60000)
    }));

    res.json({
      success: true,
      data: {
        availability,
        bookedSlots
      }
    });
  } catch (error) {
    next(error);
  }
};
