import { Router } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  getQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  submitQuizAttempt,
  getQuizAttempts,
  getQuizAttemptById
} from '../controllers/quiz.controller';
import {
  createQuizSchema,
  updateQuizSchema,
  quizIdParamsSchema,
  createQuizQuestionSchema,
  updateQuizQuestionSchema,
  questionIdParamsSchema,
  submitQuizAttemptSchema,
  getQuizAttemptsQuerySchema,
  quizAttemptIdParamsSchema
} from '../types/quiz.types';

const router = Router();

/**
 * @route GET /api/v1/quizzes
 * @desc Get all quizzes
 * @access Public
 */
router.get('/', getQuizzes);

/**
 * @route GET /api/v1/quizzes/:id
 * @desc Get quiz by ID
 * @access Public
 */
router.get('/:id', validate(quizIdParamsSchema), getQuizById);

/**
 * @route POST /api/v1/quizzes
 * @desc Create a new quiz (admin only)
 * @access Private/Admin
 */
router.post('/', authenticate, adminOnly, validate(createQuizSchema), createQuiz);

/**
 * @route PUT /api/v1/quizzes/:id
 * @desc Update quiz (admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticate, adminOnly, validate(updateQuizSchema), updateQuiz);

/**
 * @route DELETE /api/v1/quizzes/:id
 * @desc Delete quiz (soft delete, admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, validate(quizIdParamsSchema), deleteQuiz);

/**
 * @route POST /api/v1/quizzes/:id/questions
 * @desc Add question to quiz (admin only)
 * @access Private/Admin
 */
router.post(
  '/:id/questions',
  authenticate,
  adminOnly,
  validate(createQuizQuestionSchema),
  createQuizQuestion
);

/**
 * @route GET /api/v1/quizzes/:id/questions
 * @desc Get all questions for a quiz
 * @access Public
 */
router.get('/:id/questions', validate(quizIdParamsSchema), getQuizQuestions);

/**
 * @route PUT /api/v1/quizzes/questions/:id
 * @desc Update quiz question (admin only)
 * @access Private/Admin
 */
router.put(
  '/questions/:id',
  authenticate,
  adminOnly,
  validate(updateQuizQuestionSchema),
  updateQuizQuestion
);

/**
 * @route DELETE /api/v1/quizzes/questions/:id
 * @desc Delete quiz question (admin only)
 * @access Private/Admin
 */
router.delete(
  '/questions/:id',
  authenticate,
  adminOnly,
  validate(questionIdParamsSchema),
  deleteQuizQuestion
);

/**
 * @route POST /api/v1/quizzes/:id/attempt
 * @desc Submit a quiz attempt
 * @access Private
 */
router.post(
  '/:id/attempt',
  authenticate,
  validate(submitQuizAttemptSchema),
  submitQuizAttempt
);

/**
 * @route GET /api/v1/quizzes/:id/attempts
 * @desc Get all attempts for a quiz (admin only)
 * @access Private/Admin
 */
router.get(
  '/:id/attempts',
  authenticate,
  adminOnly,
  validate(getQuizAttemptsQuerySchema),
  getQuizAttempts
);

/**
 * @route GET /api/v1/quizzes/attempts/:id
 * @desc Get quiz attempt by ID
 * @access Private
 */
router.get(
  '/attempts/:id',
  authenticate,
  validate(quizAttemptIdParamsSchema),
  getQuizAttemptById
);

export default router;