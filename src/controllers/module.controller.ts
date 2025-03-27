import { ModuleService } from "@/services/module.service";
import { CreateModuleRequest } from "@/types/module.types";
import ApiResponse from "@/utils/apiResponse";
import { NextFunction } from "express";

export const createModule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const moduleData: CreateModuleRequest = req.body;
      
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