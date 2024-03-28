import { Request, Response, NextFunction } from 'express';
import {
  MockRequest,
  MockResponse,
  RequestOptions,
  ResponseOptions,
  createRequest,
  createResponse,
} from 'node-mocks-http';

export class ExpressMock {
  private mockRequest: MockRequest<Request>;
  private mockResponse: MockResponse<Response>;
  private mockNextFunction: NextFunction;

  public initMocks(
    reqOpts: RequestOptions = {},
    resOpts: ResponseOptions = {},
  ) {
    this.mockRequest = createRequest(reqOpts);

    this.mockResponse = createResponse(resOpts);

    this.mockNextFunction = jest.fn();
  }

  public getRequest(): MockRequest<Request> {
    return this.mockRequest;
  }

  public getResponse(): MockResponse<Response> {
    return this.mockResponse;
  }

  public getNextFunction(): NextFunction {
    return this.mockNextFunction;
  }
}
