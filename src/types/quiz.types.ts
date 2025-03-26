import { z } from 'zod';

/**
 * Create quiz schema
 */
export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    moduleId: z.string().uuid(),
    passingScore: z.number().int().min(0).max(100),
    timeLimit: z.number().int().positive().optional(),
  }),
});

/**
 * Create quiz request type
 */
export type CreateQuizRequest = z.infer<typeof createQuizSchema>['body'];

/**
 * Update quiz schema
 */
export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimit: z.number().int().positive().optional().nullable(),
  }),
});

/**
 * Update quiz request type
 */
export type UpdateQuizRequest = z.infer<typeof updateQuizSchema>['body'];
export type UpdateQuizParams = z.infer<typeof updateQuizSchema>['params'];

/**
 * Quiz ID params schema
 */
export const quizIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Quiz ID params type
 */
export type QuizIdParams = z.infer<typeof quizIdParamsSchema>['params'];

/**
 * Create quiz question schema
 */
export const createQuizQuestionSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Quiz ID
  }),
  body: z.object({
    question: z.string().min(3, { message: 'Question must be at least 3 characters long' }),
    options: z.array(z.string()).min(2, { message: 'At least 2 options are required' }),
    correctOptionIndex: z.number().int().min(0),
    explanation: z.string().optional(),
    points: z.number().int().positive().default(1),
  }).refine(data => data.correctOptionIndex < data.options.length, {
    message: 'Correct option index must be valid',
    path: ['correctOptionIndex'],
  }),
});

/**
 * Create quiz question request type
 */
export type CreateQuizQuestionParams = z.infer<typeof createQuizQuestionSchema>['params'];
export type CreateQuizQuestionRequest = z.infer<typeof createQuizQuestionSchema>['body'];

/**
 * Update quiz question schema
 */
export const updateQuizQuestionSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Question ID
  }),
  body: z.object({
    question: z.string().min(3).optional(),
    options: z.array(z.string()).min(2).optional(),
    correctOptionIndex: z.number().int().min(0).optional(),
    explanation: z.string().optional(),
    points: z.number().int().positive().optional(),
  }).refine(data => {
    if (data.options && data.correctOptionIndex !== undefined) {
      return data.correctOptionIndex < data.options.length;
    }
    return true;
  }, {
    message: 'Correct option index must be valid',
    path: ['correctOptionIndex'],
  }),
});

/**
 * Update quiz question request type
 */
export type UpdateQuizQuestionParams = z.infer<typeof updateQuizQuestionSchema>['params'];
export type UpdateQuizQuestionRequest = z.infer<typeof updateQuizQuestionSchema>['body'];

/**
 * Question ID params schema
 */
export const questionIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Question ID params type
 */
export type QuestionIdParams = z.infer<typeof questionIdParamsSchema>['params'];

/**
 * Submit quiz attempt schema
 */
export const submitQuizAttemptSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Quiz ID
  }),
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      selectedOptionIndex: z.number().int().min(0),
    })),
  }),
});

/**
 * Submit quiz attempt request type
 */
export type SubmitQuizAttemptParams = z.infer<typeof submitQuizAttemptSchema>['params'];
export type SubmitQuizAttemptRequest = z.infer<typeof submitQuizAttemptSchema>['body'];

/**
 * Quiz attempt ID params schema
 */
export const quizAttemptIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/**
 * Quiz attempt ID params type
 */
export type QuizAttemptIdParams = z.infer<typeof quizAttemptIdParamsSchema>['params'];

/**
 * Get quiz attempts query schema
 */
export const getQuizAttemptsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid(), // Quiz ID
  }),
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    userId: z.string().uuid().optional(),
    passed: z.string().optional().transform(val => val === 'true'),
  }),
});

/**
 * Get quiz attempts query type
 */
export type GetQuizAttemptsParams = z.infer<typeof getQuizAttemptsQuerySchema>['params'];
export type GetQuizAttemptsQuery = z.infer<typeof getQuizAttemptsQuerySchema>['query'];

/**
 * Quiz response object
 */
export interface QuizResponse {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
  module?: {
    id: string;
    title: string;
    courseId: string;
    course: {
      id: string;
      title: string;
    };
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

/**
 * Detailed quiz response with questions
 */
export interface DetailedQuizResponse extends QuizResponse {
  questions: {
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string | null;
    points: number;
  }[];
}

/**
 * Quiz question response
 */
export interface QuizQuestionResponse {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string | null;
  points: number;
  quizId: string;
}

/**
 * Quiz attempt response
 */
export interface QuizAttemptResponse {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  attemptedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  answers: {
    id: string;
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    question: {
      question: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string | null;
    };
  }[];
}