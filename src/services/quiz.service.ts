import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import { createPaginatedResponse, normalizePaginationOptions, getPrismaSkipTake } from '../utils/pagination';
import { GetQuizAttemptsQuery } from '../types/quiz.types';

/**
 * Quiz Service - Handles business logic for quizzes and assessments
 */
export class QuizService {
  /**
   * Get all quizzes
   */
  static async getQuizzes(moduleId?: string) {
    const where: any = { isDeleted: false };
    
    if (moduleId) {
      where.moduleId = moduleId;
    }
    
    return prisma.quiz.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });
  }
  
  /**
   * Get quiz by ID
   */
  static async getQuizById(id: string, includeQuestions: boolean = false) {
    return prisma.quiz.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        ...(includeQuestions ? {
          questions: {
            orderBy: {
              id: 'asc'
            }
          }
        } : {}),
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });
  }
  
  /**
   * Create a new quiz
   */
  static async createQuiz(data: {
    title: string;
    description?: string;
    moduleId: string;
    passingScore: number;
    timeLimit?: number;
  }) {
    // Check if module exists
    const module = await prisma.module.findFirst({
      where: {
        id: data.moduleId,
        isDeleted: false
      }
    });
    
    if (!module) {
      throw new ApiError('Module not found', 404);
    }
    
    return prisma.quiz.create({
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Update an existing quiz
   */
  static async updateQuiz(id: string, data: {
    title?: string;
    description?: string;
    passingScore?: number;
    timeLimit?: number | null;
  }) {
    // Check if quiz exists
    const quiz = await this.getQuizById(id);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    return prisma.quiz.update({
      where: { id },
      data,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Delete a quiz (soft delete)
   */
  static async deleteQuiz(id: string) {
    // Check if quiz exists
    const quiz = await this.getQuizById(id);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    return prisma.quiz.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
  
  /**
   * Create a quiz question
   */
  static async createQuizQuestion(quizId: string, data: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
    points: number;
  }) {
    // Check if quiz exists
    const quiz = await this.getQuizById(quizId);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    // Validate correctOptionIndex
    if (data.correctOptionIndex < 0 || data.correctOptionIndex >= data.options.length) {
      throw new ApiError('Invalid correctOptionIndex, must be a valid index in the options array', 400);
    }
    
    return prisma.quizQuestion.create({
      data: {
        ...data,
        quizId
      }
    });
  }
  
  /**
   * Get all questions for a quiz
   */
  static async getQuizQuestions(quizId: string) {
    // Check if quiz exists
    const quiz = await this.getQuizById(quizId);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    return prisma.quizQuestion.findMany({
      where: { quizId },
      orderBy: { id: 'asc' }
    });
  }
  
  /**
   * Update a quiz question
   */
  static async updateQuizQuestion(id: string, data: {
    question?: string;
    options?: string[];
    correctOptionIndex?: number;
    explanation?: string;
    points?: number;
  }) {
    // Check if question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id }
    });
    
    if (!question) {
      throw new ApiError('Question not found', 404);
    }
    
    // If updating options and correctOptionIndex, validate correctOptionIndex
    if (data.options && data.correctOptionIndex !== undefined) {
      if (data.correctOptionIndex < 0 || data.correctOptionIndex >= data.options.length) {
        throw new ApiError('Invalid correctOptionIndex, must be a valid index in the options array', 400);
      }
    } else if (data.options && data.correctOptionIndex === undefined) {
      // If updating only options, ensure correctOptionIndex is still valid
      if (question.correctOptionIndex >= data.options.length) {
        throw new ApiError('Updating options would make existing correctOptionIndex invalid', 400);
      }
    } else if (data.correctOptionIndex !== undefined && !data.options) {
      // If updating only correctOptionIndex, ensure it's valid for existing options
      if (data.correctOptionIndex < 0 || data.correctOptionIndex >= question.options.length) {
        throw new ApiError('Invalid correctOptionIndex for existing options', 400);
      }
    }
    
    return prisma.quizQuestion.update({
      where: { id },
      data
    });
  }
  
  /**
   * Delete a quiz question
   */
  static async deleteQuizQuestion(id: string) {
    // Check if question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id }
    });
    
    if (!question) {
      throw new ApiError('Question not found', 404);
    }
    
    return prisma.quizQuestion.delete({
      where: { id }
    });
  }
  
  /**
   * Submit a quiz attempt
   */
  static async submitQuizAttempt(quizId: string, userId: string, answers: {
    questionId: string;
    selectedOptionIndex: number;
  }[]) {
    // Check if quiz exists
    const quiz = await this.getQuizById(quizId, true);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    // Validate that all questions are answered
    const questionIds = quiz.questions.map(q => q.id);
    const answeredQuestionIds = answers.map(a => a.questionId);
    
    if (questionIds.length !== answeredQuestionIds.length) {
      throw new ApiError('All questions must be answered', 400);
    }
    
    // Check if all questionIds in answers exist in the quiz
    const invalidQuestionIds = answeredQuestionIds.filter(id => !questionIds.includes(id));
    
    if (invalidQuestionIds.length > 0) {
      throw new ApiError(`Invalid question IDs: ${invalidQuestionIds.join(', ')}`, 400);
    }
    
    // Calculate score
    const score = await this.calculateQuizScore(quiz, answers);
    
    // Determine if passed
    const passed = score >= quiz.passingScore;
    
    // Create the quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        answers: {
          create: answers.map(answer => {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            return {
              questionId: answer.questionId,
              selectedOptionIndex: answer.selectedOptionIndex,
              isCorrect: question.correctOptionIndex === answer.selectedOptionIndex
            };
          })
        }
      },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // If passed, update progress
    if (passed) {
      // Find module progress
      const moduleProgress = await prisma.moduleProgress.findFirst({
        where: {
          moduleId: quiz.module.id,
          userProgress: {
            userId,
            courseId: quiz.module.course.id
          }
        }
      });
      
      if (moduleProgress) {
        // This would update course progress
        // We'll implement this in a separate service
      }
    }
    
    return quizAttempt;
  }
  
  /**
   * Calculate quiz score
   */
  static async calculateQuizScore(quiz: any, answers: {
    questionId: string;
    selectedOptionIndex: number;
  }[]) {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    // Calculate points
    for (const question of quiz.questions) {
      totalPoints += question.points;
      
      const answer = answers.find(a => a.questionId === question.id);
      if (answer && answer.selectedOptionIndex === question.correctOptionIndex) {
        earnedPoints += question.points;
      }
    }
    
    // Calculate percentage score
    const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    return percentageScore;
  }
  
  /**
   * Get quiz attempts
   */
  static async getQuizAttempts(quizId: string, params: GetQuizAttemptsQuery) {
    const { userId, passed, page, limit } = params;
    
    // Check if quiz exists
    const quiz = await this.getQuizById(quizId);
    
    if (!quiz) {
      throw new ApiError('Quiz not found', 404);
    }
    
    // Prepare pagination
    const paginationOptions = normalizePaginationOptions({ page, limit });
    const { skip, take } = getPrismaSkipTake(paginationOptions);
    
    // Build query filters
    const where: any = { quizId };
    
    if (userId) {
      where.userId = userId;
    }
    
    if (passed !== undefined) {
      where.passed = passed;
    }
    
    // Count total attempts matching the filter
    const total = await prisma.quizAttempt.count({ where });
    
    // Get attempts with pagination
    const attempts = await prisma.quizAttempt.findMany({
      where,
      skip,
      take,
      orderBy: { attemptedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    return createPaginatedResponse(
      attempts,
      total,
      paginationOptions
    );
  }
  
  /**
   * Get quiz attempt by ID
   */
  static async getQuizAttemptById(id: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });
    
    if (!attempt) {
      throw new ApiError('Quiz attempt not found', 404);
    }
    
    return attempt;
  }
}