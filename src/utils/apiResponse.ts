/**
 * API Response formats
 */
export class ApiResponse {
    /**
     * Success response
     * @param {Response} res - Express response object
     * @param {any} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     * @returns {Response} Express response
     */
    static success(
      res: Response,
      data: any = null,
      message: string = 'Success',
      statusCode: number = 200
    ): Response {
      return res.status(statusCode).json({
        success: true,
        message,
        data
      });
    }
  
    /**
     * Error response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {any} errors - Error details
     * @returns {Response} Express response
     */
    static error(
      res: Response,
      message: string = 'Error',
      statusCode: number = 500,
      errors: any = null
    ): Response {
      return res.status(statusCode).json({
        success: false,
        message,
        errors
      });
    }
  
    /**
     * Created response
     * @param {Response} res - Express response object
     * @param {any} data - Response data
     * @param {string} message - Success message
     * @returns {Response} Express response
     */
    static created(
      res: Response,
      data: any = null,
      message: string = 'Resource created successfully'
    ): Response {
      return this.success(res, data, message, 201);
    }
  
    /**
     * No content response
     * @param {Response} res - Express response object
     * @returns {Response} Express response
     */
    static noContent(res: Response): Response {
      return res.status(204).send();
    }
  
    /**
     * Bad request response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @param {any} errors - Error details
     * @returns {Response} Express response
     */
    static badRequest(
      res: Response,
      message: string = 'Bad request',
      errors: any = null
    ): Response {
      return this.error(res, message, 400, errors);
    }
  
    /**
     * Unauthorized response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @returns {Response} Express response
     */
    static unauthorized(
      res: Response,
      message: string = 'Unauthorized'
    ): Response {
      return this.error(res, message, 401);
    }
  
    /**
     * Forbidden response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @returns {Response} Express response
     */
    static forbidden(
      res: Response,
      message: string = 'Forbidden'
    ): Response {
      return this.error(res, message, 403);
    }
  
    /**
     * Not found response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @returns {Response} Express response
     */
    static notFound(
      res: Response,
      message: string = 'Resource not found'
    ): Response {
      return this.error(res, message, 404);
    }
  
    /**
     * Conflict response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @returns {Response} Express response
     */
    static conflict(
      res: Response,
      message: string = 'Conflict',
      errors: any = null
    ): Response {
      return this.error(res, message, 409, errors);
    }
  
    /**
     * Unprocessable entity response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @param {any} errors - Error details
     * @returns {Response} Express response
     */
    static unprocessableEntity(
      res: Response,
      message: string = 'Unprocessable entity',
      errors: any = null
    ): Response {
      return this.error(res, message, 422, errors);
    }
  
    /**
     * Internal server error response
     * @param {Response} res - Express response object
     * @param {string} message - Error message
     * @returns {Response} Express response
     */
    static serverError(
      res: Response,
      message: string = 'Internal server error'
    ): Response {
      return this.error(res, message, 500);
    }
  
    /**
     * Paginated response
     * @param {Response} res - Express response object
     * @param {any[]} data - Response data
     * @param {number} page - Current page
     * @param {number} limit - Page size
     * @param {number} total - Total items
     * @param {string} message - Success message
     * @returns {Response} Express response
     */
    static paginated(
      res: Response,
      data: any[],
      page: number,
      limit: number,
      total: number,
      message: string = 'Success'
    ): Response {
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
  
      return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });
    }
  }
  
export default ApiResponse;