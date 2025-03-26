import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ApiError } from '../middlewares/error.middleware';
import ApiResponse from '../utils/apiResponse';
import { 
  GetCoursesQuery,
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseIdParams,
  PublishCourseRequest,
  AddInstructorRequest,
  RemoveInstructorParams
} from '../types/course.types';
import { CourseService } from '../services/course.service';
import { AwsService } from '../services/aws.service';
import logger from '../utils/logger';

/**
 * Get all courses
 * @route GET /api/v1/courses
 */
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page, 
      limit, 
      search, 
      isPublished, 
      tags, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    }: GetCoursesQuery = req.query;
    
    // Get courses from service
    const result = await CourseService.getCourses({
      page, 
      limit, 
      search, 
      isPublished, 
      tags, 
      sortBy, 
      sortOrder
    });
    
    return ApiResponse.success(
      res,
      result,
      'Courses retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID
 * @route GET /api/v1/courses/:id
 */
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Get course with modules and instructors
    const course = await CourseService.getCourseById(id);
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }
    
    return ApiResponse.success(
      res,
      course,
      'Course retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new course
 * @route POST /api/v1/courses
 */
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseData: CreateCourseRequest = req.body;
    const userId = req.user.id;
    
    // Create course
    const course = await CourseService.createCourse({
      ...courseData,
      createdBy: userId
    });
    
    return ApiResponse.created(
      res,
      course,
      'Course created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update course
 * @route PUT /api/v1/courses/:id
 */
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData: UpdateCourseRequest = req.body;
    
    // Check if course exists
    const existingCourse = await CourseService.getCourseById(id);
    
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }
    
    // Update course
    const updatedCourse = await CourseService.updateCourse(id, updateData);
    
    return ApiResponse.success(
      res,
      updatedCourse,
      'Course updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course (soft delete)
 * @route DELETE /api/v1/courses/:id
 */
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const existingCourse = await CourseService.getCourseById(id);
    
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }
    
    // Delete course
    await CourseService.deleteCourse(id);
    
    return ApiResponse.success(
      res,
      null,
      'Course deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Publish/unpublish course
 * @route PATCH /api/v1/courses/:id/publish
 */
export const publishCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isPublished }: PublishCourseRequest = req.body;
    
    // Check if course exists
    const existingCourse = await CourseService.getCourseById(id);
    
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }
    
    // If publishing, check if course is ready
    if (isPublished && !existingCourse.isPublished) {
      const readyCheck = await CourseService.isReadyToPublish(id);
      
      if (!readyCheck.ready) {
        throw new ApiError(`Course not ready to be published: ${readyCheck.reason}`, 400);
      }
    }
    
    // Update publish status
    const updatedCourse = await CourseService.updateCourse(id, { isPublished });
    
    return ApiResponse.success(
      res,
      updatedCourse,
      isPublished ? 'Course published successfully' : 'Course unpublished successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all modules for a course
 * @route GET /api/v1/courses/:id/modules
 */
export const getModulesByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const existingCourse = await CourseService.getCourseById(id);
    
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }
    
    // Get modules
    const modules = await CourseService.getModulesForCourse(id);
    
    return ApiResponse.success(
      res,
      modules,
      'Modules retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add instructor to course
 * @route POST /api/v1/courses/:id/instructors
 */
export const addInstructorToCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId }: AddInstructorRequest = req.body;
    
    // Add instructor
    const updatedCourse = await CourseService.addInstructor(id, userId);
    
    return ApiResponse.success(
      res,
      updatedCourse,
      'Instructor added successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Remove instructor from course
 * @route DELETE /api/v1/courses/:id/instructors/:userId
 */
export const removeInstructorFromCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userId } = req.params;
    
    // Remove instructor
    const updatedCourse = await CourseService.removeInstructor(id, userId);
    
    return ApiResponse.success(
      res,
      updatedCourse,
      'Instructor removed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload course thumbnail
 * @route POST /api/v1/courses/:id/thumbnail
 */
export const uploadCourseThumbnailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const existingCourse = await CourseService.getCourseById(id);
    
    if (!existingCourse) {
      throw new ApiError('Course not found', 404);
    }
    
    if (!req.file) {
      throw new ApiError('No thumbnail image uploaded', 400);
    }
    
    // Upload to S3
    const result = await AwsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      'course-thumbnails',
      req.file.mimetype
    );
    
    // Update course thumbnail
    const updatedCourse = await CourseService.updateCourse(id, {
      thumbnail: result.url
    });
    
    return ApiResponse.success(
      res,
      updatedCourse,
      'Thumbnail uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};