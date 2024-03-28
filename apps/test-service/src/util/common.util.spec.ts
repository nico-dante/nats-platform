import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidationError,
} from 'class-validator';
import {
  BaseDto,
  LOCAL_TEST_NODE_ENV,
  ValidationResponse,
  isLocalEnv,
  validateDto,
} from './common.util';

class TestDto implements BaseDto {
  @IsString()
  @MinLength(10)
  test1: string;

  @IsString()
  @IsNotEmpty()
  test2: string;

  @IsEmail()
  test3: string;
}

describe('common.util', () => {
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();

    process.env = {
      ...originalEnv,
      NODE_ENV: LOCAL_TEST_NODE_ENV,
    };
  });

  it('should be local env', () => {
    expect(isLocalEnv()).toBeTruthy();
  });

  it('should not be local env', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: undefined,
    };

    expect(isLocalEnv()).toBeFalsy();
  });

  it('should be correct a validation response', () => {
    const validationResp = new ValidationResponse<TestDto>(null);

    expect(validationResp.hasErrors()).toBeFalsy();
    expect(validationResp.errorsMap()).toStrictEqual({});
    expect(validationResp.errorFields()).toStrictEqual([]);

    const validationError = new ValidationError();
    validationError.property = 'test1';
    validationResp.setErrors([validationError]);

    expect(validationResp.hasErrors()).toBeTruthy();
    expect(Object.entries(validationResp.errorsMap()).length).toBe(1);
    expect(validationResp.errorFields()).toStrictEqual(['test1']);
  });

  it('should be a valid obj', async () => {
    const validationResp = await validateDto(
      {
        test1: 'val0123456789',
        test2: 'val',
        test3: 'val@example.com',
      },
      TestDto,
    );

    expect(validationResp.hasErrors()).toBeFalsy();
    expect(validationResp.errorsMap()).toStrictEqual({});
    expect(validationResp.errorFields()).toStrictEqual([]);
  });

  it('should not be a valid obj', async () => {
    const obj = new TestDto();

    obj.test1 = 'val1';
    obj.test2 = 'val2';
    obj.test3 = 'val3';

    const validationResp = await validateDto(obj, TestDto);

    expect(validationResp).toBeDefined();
    expect(validationResp.hasErrors()).toBeTruthy();
    expect(Object.entries(validationResp.errorsMap()).length).toBe(2);
    expect(validationResp.errorFields()).toStrictEqual(['test1', 'test3']);
  });
});
