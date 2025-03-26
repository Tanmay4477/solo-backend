import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middlewares/error.middleware';
import ApiResponse from '../utils/apiResponse';
import { 
  GetModulesQuery,
  CreateModuleRequest, 
  UpdateModuleRequest, 
  ModuleIdParams,
  UpdateModuleStatusRequest,
  ToggleStandaloneCourseRequest,
  UpdateModuleOrderRequest
} from '../types/module.types';
import { ModuleService } from '../services/module.service';
import { ContentService } from '../services/content.service';
import { ModuleStatus } from '@prisma/client';

/**
 * Get all modules
 * @route GET /api/v1/modules
 */
export const getModules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page, 
      limit, 
      courseId, 
      status, 
      isStandaloneCourse, 
      search, 
      sortBy = 'order', 
      sortOrder = 'asc' 
    }: GetModulesQuery = req.query;
    
    // Get modules
    const result = await ModuleService.getModules({
      page,
      limit,
      courseId,
      status,
      isStandaloneCourse,
      search,
      sortBy,
      sortOrder
    });
    
    return ApiResponse.success(
      res,
      result,
      'Modules retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get module by ID
 * @route GET /api/v1/modules/:id
 */
export const getModuleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Get module
    const module = await ModuleService.getModuleById(id);
    
    if (!module) {
      throw new ApiError('Module not found', 404);
    }
    
    return ApiResponse.success(
      res,
      module,
      'Module retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new module
 * @route POST /api/v1/modules
 */
export const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moduleData: CreateModuleRequest = req.body;
    
    // Create module
    const module = await ModuleService.createModule(moduleData);
    
    return ApiResponse.created(
      res,
      module,
      'Module created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update module
 * @route PUT /api/v1/modules/:id
 */
export const updateModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData: UpdateModuleRequest = req.body;
    
    // Update module
    const updatedModule = await ModuleService.updateModule(id, updateData);
    
    return ApiResponse.success(
      res,
      updatedModule,
      'Module updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete module (soft delete)
 * @route DELETE /api/v1/modules/:id
 */
export const deleteModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Delete module
    await ModuleService.deleteModule(id);
    
    return ApiResponse.success(
      res,
      null,
      'Module deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update module status
 * @route PATCH /api/v1/modules/:id/status
 */
export const updateModuleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status }: UpdateModuleStatusRequest = req.body;
    
    // Update status
    const updatedModule = await ModuleService.updateStatus(id, status);
    
    // If activated, send notifications to enrolled users
    if (status === ModuleStatus.ACTIVE) {
      try {
        const notificationCount = await ModuleService.sendModuleUnlockNotifications(id);
      } catch (error) {
        console.error('Failed to send notifications:', error);
        // Continue with response anyway
      }
    }
    
    return ApiResponse.success(
      res,
      updatedModule,
      `Module ${status.toLowerCase()}d successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle standalone course status
 * @route PATCH /api/v1/modules/:id/standalone
 */
export const toggleStandaloneCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isStandaloneCourse, price }: ToggleStandaloneCourseRequest = req.body;
    
    // Toggle standalone course status
    const updatedModule = await ModuleService.toggleStandaloneCourse(id, isStandaloneCourse, price);
    
    return ApiResponse.success(
      res,
      updatedModule,
      isStandaloneCourse
        ? 'Module is now available as a standalone course'
        : 'Module is no longer available as a standalone course'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update module order
 * @route PATCH /api/v1/modules/:id/order
 */
export const updateModuleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { order }: UpdateModuleOrderRequest = req.body;
    
    // Update module order
    const updatedModule = await ModuleService.updateModule(id, { order });
    
    return ApiResponse.success(
      res,
      updatedModule,
      'Module order updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contents for a module
 * @route GET /api/v1/modules/:id/contents
 */
export const getContentsForModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if module exists
    const module = await ModuleService.getModuleById(id);
    
    if (!module) {
      throw new ApiError('Module not found', 404);
    }
    
    // Get contents
    const contents = await ContentService.getContentsByModule(id);
    
    return ApiResponse.success(
      res,
      contents,
      'Contents retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};