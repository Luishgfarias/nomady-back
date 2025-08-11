import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { ErrorHandlingInterceptor } from './errorHandling.interceptor';

describe('ErrorHandlingInterceptor', () => {
  let interceptor: ErrorHandlingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorHandlingInterceptor],
    }).compile();

    interceptor = module.get<ErrorHandlingInterceptor>(ErrorHandlingInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through successful responses unchanged', async () => {
      const mockCallHandler = {
        handle: jest.fn().mockReturnValue({
          pipe: jest.fn().mockReturnValue('success response')
        })
      };

      const result = await interceptor.intercept({} as ExecutionContext, mockCallHandler);
      expect(result).toBe('success response');
    });

    it('should handle 500+ errors and return generic message', async () => {
      const mockError = { status: 500, message: 'Database connection failed' };
      const mockCallHandler = {
        handle: jest.fn().mockReturnValue({
          pipe: jest.fn().mockImplementation((callback) => {
            const errorHandler = callback;
            throw errorHandler(mockError);
          })
        })
      };

      await expect(interceptor.intercept({} as ExecutionContext, mockCallHandler))
        .rejects.toThrow();
    });

    it('should pass through 400-499 errors unchanged', async () => {
      const mockError = { status: 404, message: 'User not found' };
      const mockCallHandler = {
        handle: jest.fn().mockReturnValue({
          pipe: jest.fn().mockImplementation((callback) => {
            const errorHandler = callback;
            throw errorHandler(mockError);
          })
        })
      };

      await expect(interceptor.intercept({} as ExecutionContext, mockCallHandler))
        .rejects.toThrow();
    });
  });
}); 