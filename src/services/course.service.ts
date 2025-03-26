import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import { createPaginatedResponse, normalizePaginationOptions, getPrismaSkipTake } from '../utils/pagination';
import { GetCoursesQuery, CourseResponse, DetailedCourseResponse } from '../types/course.types';
import { ModuleStatus } from '@prisma/client';

/**
 * Course Service - Handles business logic for courses
 */
export class CourseService {
  /**
   * Get all courses with pagination and filtering
   */
  static async getCourses(params: GetCoursesQuery) {
    const { search, isPublished, tags, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    // Prepare pagination
    const paginationOptions = normalizePaginationOptions({
      page: params.page,
      limit: params.limit
    });
    const { skip, take } = getPrismaSkipTake(paginationOptions);
    
    // Build query filters
    const where: any = { isDeleted: false };
    
    // Add published filter if provided
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add tags filter if provided
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }
    
    // Count total courses matching the filter
    const total = await prisma.course.count({ where });
    
    // Get courses with pagination, sorting, and related data
    const courses = await prisma.course.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    });
    
    // Map to response format
    const courseResponses: CourseResponse[] = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors,
      _count: course._count
    }));
    
    // Create paginated response
    return createPaginatedResponse(
      courseResponses,
      total,
      paginationOptions
    );
  }
  
  /**
   * Get course by ID with detailed information
   */
  static async getCourseById(id: string): Promise<DetailedCourseResponse | null> {
    const course = await prisma.course.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        modules: {
          where: {
            isDeleted: false
          },
          orderBy: {
            order: 'asc'
          },
          include: {
            _count: {
              select: {
                contents: true,
                quizzes: true
              }
            }
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      }
    });
    
    if (!course) {
      return null;
    }
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors,
      _count: course._count,
      modules: course.modules
    };
  }
  
  /**
   * Create a new course
   */
  static async createCourse(data: {
    title: string;
    description: string;
    thumbnail?: string;
    tags?: string[];
    isPublished?: boolean;
    instructorIds?: string[];
    createdBy: string;
  }): Promise<CourseResponse> {
    // Extract instructor IDs
    const { instructorIds, ...courseData } = data;
    
    // Create the course
    const course = await prisma.course.create({
      data: {
        ...courseData,
        // Connect instructors if provided
        ...(instructorIds && instructorIds.length > 0 ? {
          instructors: {
            connect: instructorIds.map(id => ({ id }))
          }
        } : {})
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors
    };
  }
  
  /**
   * Update an existing course
   */
  static async updateCourse(id: string, data: {
    title?: string;
    description?: string;
    thumbnail?: string;
    tags?: string[];
    isPublished?: boolean;
  }): Promise<CourseResponse> {
    // Update the course
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        // Set publishedAt if publishing for the first time
        ...(data.isPublished === true ? {
          publishedAt: new Date()
        } : {})
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors
    };
  }
  
  /**
   * Delete a course (soft delete)
   */
  static async deleteCourse(id: string): Promise<void> {
    // Soft delete the course
    await prisma.course.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
  
  /**
   * Add an instructor to a course
   */
  static async addInstructor(courseId: string, instructorId: string): Promise<CourseResponse> {
    // Check if user exists and is not already an instructor for this course
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });
    
    if (!instructor) {
      throw new ApiError('Instructor not found', 404);
    }
    
    // Add instructor to course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        instructors: {
          connect: { id: instructorId }
        }
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors
    };
  }
  
  /**
   * Remove an instructor from a course
   */
  static async removeInstructor(courseId: string, instructorId: string): Promise<CourseResponse> {
    // Remove instructor from course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        instructors: {
          disconnect: { id: instructorId }
        }
      },
      include: {
        instructors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      tags: course.tags as string[],
      createdAt: course.createdAt,
      instructors: course.instructors
    };
  }
  
  /**
   * Get modules for a course
   */
  static async getModulesForCourse(courseId: string) {
    return prisma.module.findMany({
      where: {
        courseId,
        isDeleted: false
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            contents: true,
            quizzes: true
          }
        }
      }
    });
  }
  
  /**
   * Check if a course is ready to be published
   */
  static async isReadyToPublish(courseId: string): Promise<{ ready: boolean; reason?: string }> {
    // Check if course has at least one module
    const moduleCount = await prisma.module.count({
      where: {
        courseId,
        isDeleted: false
      }
    });
    
    if (moduleCount === 0) {
      return { ready: false, reason: 'Course must have at least one module' };
    }
    
    // Check if each module has content
    const modules = await prisma.module.findMany({
      where: {
        courseId,
        isDeleted: false
      },
      include: {
        _count: {
          select: {
            contents: true,
            quizzes: true
          }
        }
      }
    });
    
    const emptyModules = modules.filter(
      module => module._count.contents === 0 && module._count.quizzes === 0
    );
    
    if (emptyModules.length > 0) {
      return {
        ready: false,
        reason: `Modules without content: ${emptyModules.map(m => m.title).join(', ')}`
      };
    }
    
    // All checks passed
    return { ready: true };
  }
  
  /**
   * Get course statistics
   */
  static async getCourseStats() {
    const totalCourses = await prisma.course.count({
      where: { isDeleted: false }
    });
    
    const publishedCourses = await prisma.course.count({
      where: {
        isPublished: true,
        isDeleted: false
      }
    });
    
    const totalModules = await prisma.module.count({
      where: { isDeleted: false }
    });
    
    const totalEnrollments = await prisma.userCourseEnrollment.count({
      where: { isActive: true }
    });
    
    const topCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 5
    });
    
    return {
      totalCourses,
      publishedCourses,
      totalModules,
      totalEnrollments,
      publishRate: totalCourses > 0 ? (publishedCourses / totalCourses) * 100 : 0,
      topCourses
    };
  }
}