import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import { createPaginatedResponse, normalizePaginationOptions, getPrismaSkipTake } from '../utils/pagination';
import { GetModulesQuery, ModuleResponse, DetailedModuleResponse } from '../types/module.types';
import { ModuleStatus } from '@prisma/client';
import { NotificationService } from './notification.service';

/**
 * Module Service - Handles business logic for course modules
 */
export class ModuleService {
  /**
   * Get all modules with pagination and filtering
   */
  static async getModules(params: GetModulesQuery) {
    const { 
      courseId, 
      status, 
      isStandaloneCourse, 
      search, 
      sortBy = 'order', 
      sortOrder = 'asc' 
    } = params;
    
    // Prepare pagination
    const paginationOptions = normalizePaginationOptions({
      page: params.page,
      limit: params.limit
    });
    const { skip, take } = getPrismaSkipTake(paginationOptions);
    
    // Build query filters
    const where: any = { isDeleted: false };
    
    // Add courseId filter if provided
    if (courseId) {
      where.courseId = courseId;
    }
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Add standalone course filter if provided
    if (isStandaloneCourse !== undefined) {
      where.isStandaloneCourse = isStandaloneCourse;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Count total modules matching the filter
    const total = await prisma.module.count({ where });
    
    // Get modules with pagination, sorting, and related data
    const modules = await prisma.module.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            contents: true,
            quizzes: true
          }
        }
      }
    });
    
    // Map to response format
    const moduleResponses: ModuleResponse[] = modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course,
      _count: module._count
    }));
    
    // Create paginated response
    return createPaginatedResponse(
      moduleResponses,
      total,
      paginationOptions
    );
  }
  
  /**
   * Get module by ID with detailed information
   */
  static async getModuleById(id: string): Promise<DetailedModuleResponse | null> {
    const module = await prisma.module.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        contents: {
          where: {
            isDeleted: false
          },
          orderBy: {
            order: 'asc'
          }
        },
        quizzes: {
          where: {
            isDeleted: false
          },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        },
        _count: {
          select: {
            contents: true,
            quizzes: true
          }
        }
      }
    });
    
    if (!module) {
      return null;
    }
    
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course,
      _count: module._count,
      contents: module.contents,
      quizzes: module.quizzes
    };
  }
  
  /**
   * Create a new module
   */
  static async createModule(data: {
    title: string;
    description?: string;
    courseId: string;
    durationInDays: number;
    order: number;
    isStandaloneCourse?: boolean;
    price?: number | null;
    status?: ModuleStatus;
  }): Promise<ModuleResponse> {
    // Check if course exists
    const course = await prisma.course.findFirst({
      where: {
        id: data.courseId,
        isDeleted: false
      }
    });
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }
    
    // Create module
    const module = await prisma.module.create({
      data: {
        ...data,
        status: data.status || ModuleStatus.DRAFT
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course
    };
  }
  
  /**
   * Update an existing module
   */
  static async updateModule(id: string, data: {
    title?: string;
    description?: string;
    durationInDays?: number;
    order?: number;
    isStandaloneCourse?: boolean;
    price?: number | null;
    status?: ModuleStatus;
  }): Promise<ModuleResponse> {
    // Check if module exists
    const existingModule = await this.getModuleById(id);
    
    if (!existingModule) {
      throw new ApiError('Module not found', 404);
    }
    
    // Prepare data for update
    const updateData: any = { ...data };
    
    // If changing to standalone course, ensure price is set
    if (data.isStandaloneCourse === true && data.price === undefined && !existingModule.price) {
      throw new ApiError('Price is required for standalone courses', 400);
    }
    
    // Update the module
    const module = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course
    };
  }
  
  /**
   * Delete a module (soft delete)
   */
  static async deleteModule(id: string): Promise<void> {
    // Soft delete the module
    await prisma.module.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }
  
  /**
   * Get contents for a module
   */
  static async getContentsForModule(moduleId: string) {
    return prisma.content.findMany({
      where: {
        moduleId,
        isDeleted: false
      },
      orderBy: {
        order: 'asc'
      }
    });
  }
  
  /**
   * Check if a module is ready to be activated
   */
  static async isReadyToActivate(moduleId: string): Promise<{ ready: boolean; reason?: string }> {
    // Check if module has content
    const contentCount = await prisma.content.count({
      where: {
        moduleId,
        isDeleted: false
      }
    });
    
    const quizCount = await prisma.quiz.count({
      where: {
        moduleId,
        isDeleted: false
      }
    });
    
    if (contentCount === 0 && quizCount === 0) {
      return { ready: false, reason: 'Module must have at least one content item or quiz' };
    }
    
    // All checks passed
    return { ready: true };
  }
  
  /**
   * Update module status
   */
  static async updateStatus(id: string, status: ModuleStatus): Promise<ModuleResponse> {
    // Check if module exists
    const existingModule = await this.getModuleById(id);
    
    if (!existingModule) {
      throw new ApiError('Module not found', 404);
    }
    
    // If activating the module, check if it's ready
    if (status === ModuleStatus.ACTIVE && existingModule.status !== ModuleStatus.ACTIVE) {
      const readyCheck = await this.isReadyToActivate(id);
      
      if (!readyCheck.ready) {
        throw new ApiError(`Module not ready to be activated: ${readyCheck.reason}`, 400);
      }
    }
    
    // Update the module status
    const module = await prisma.module.update({
      where: { id },
      data: { status },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course
    };
  }
  
  /**
   * Toggle standalone course status
   */
  static async toggleStandaloneCourse(id: string, isStandalone: boolean, price?: number | null): Promise<ModuleResponse> {
    // Check if module exists
    const existingModule = await this.getModuleById(id);
    
    if (!existingModule) {
      throw new ApiError('Module not found', 404);
    }
    
    // If enabling standalone mode, ensure price is set
    if (isStandalone && !price && !existingModule.price) {
      throw new ApiError('Price is required for standalone courses', 400);
    }
    
    // Update standalone status and price
    const updateData: any = {
      isStandaloneCourse: isStandalone
    };
    
    if (price !== undefined) {
      updateData.price = price;
    }
    
    const module = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      durationInDays: module.durationInDays,
      status: module.status,
      order: module.order,
      isStandaloneCourse: module.isStandaloneCourse,
      price: module.price ? parseFloat(module.price.toString()) : null,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      course: module.course
    };
  }
  
  /**
   * Send module unlock notification to eligible users
   */
  static async sendModuleUnlockNotifications(moduleId: string): Promise<number> {
    // Get module details
    const module = await this.getModuleById(moduleId);
    
    if (!module) {
      throw new ApiError('Module not found', 404);
    }
    
    // Get all active enrollments for the course
    const enrollments = await prisma.userCourseEnrollment.findMany({
      where: {
        courseId: module.courseId,
        isActive: true
      },
      select: {
        userId: true,
        user: {
          select: {
            firstName: true
          }
        }
      }
    });
    
    // Send notifications to all enrolled users
    let notificationCount = 0;
    
    for (const enrollment of enrollments) {
      try {
        await NotificationService.sendModuleUnlockNotification(
          enrollment.userId,
          {
            moduleId: module.id,
            moduleTitle: module.title,
            courseId: module.courseId,
            courseTitle: module.course.title
          }
        );
        
        notificationCount++;
      } catch (error) {
        // Log error but continue with other notifications
        console.error(`Failed to send notification to user ${enrollment.userId}:`, error);
      }
    }
    
    return notificationCount;
  }
  
  /**
   * Get modules that should be unlocked based on enrollment duration
   */
  static async getModulesToUnlock(): Promise<any[]> {
    // Get all active enrollments
    const enrollments = await prisma.userCourseEnrollment.findMany({
      where: {
        isActive: true
      },
      include: {
        course: {
          include: {
            modules: {
              where: {
                isDeleted: false,
                status: ModuleStatus.ACTIVE
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            firstName: true
          }
        }
      }
    });
    
    const modulesToUnlock = [];
    
    // For each enrollment, calculate which modules should be unlocked
    for (const enrollment of enroll