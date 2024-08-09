import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { IRpcError } from '../interfaces/interfaces';

function isRpcError(error: any): error is IRpcError {
  return (
    typeof error === 'object' && 'statusCode' in error && 'message' in error
  );
}
@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const rpcError = exception.getError();

    if (isRpcError(rpcError)) {
      const status = rpcError.statusCode;

      return response.status(status).json(rpcError);
    }
    response.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}
