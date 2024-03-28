import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export const LOCAL_TEST_NODE_ENV = 'jest';

export const isLocalEnv = (): boolean =>
  ['local-dev', LOCAL_TEST_NODE_ENV].includes(
    (process.env.NODE_ENV || '').toLocaleLowerCase(),
  );

export interface BaseDto {}

export class ValidationResponse<T extends BaseDto> {
  errorList: Array<ValidationError>;

  constructor(errors: Array<ValidationError>) {
    this.setErrors(errors);
  }

  setErrors(errors: Array<ValidationError>) {
    this.errorList = errors || [];
  }

  hasErrors(): boolean {
    return this.errorList.length > 0;
  }

  errorsMap(): Record<keyof T, string> {
    return this.errorList.reduce(
      (errorMap, error) => {
        errorMap[error.property] =
          error.constraints?.[Object.keys(error.constraints)[0]] ||
          'unknown error';

        return errorMap;
      },
      {} as Record<keyof T, string>,
    );
  }

  errorFields(): Array<keyof T> {
    return Object.keys(this.errorsMap()).map((key) => key as keyof T);
  }
}

export const validateDto = async <T extends BaseDto>(
  dto: T,
  type: new () => T,
): Promise<ValidationResponse<T>> =>
  new ValidationResponse<T>(await validate(plainToInstance(type, dto)));

export interface EventDetails {
  header: { title: string; createdAt: Date };
  payload: Record<string, any>;
}
