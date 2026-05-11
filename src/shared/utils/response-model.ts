import { HttpStatus } from "../constants/index";

export interface ApiResponse<T = null>{
    success : boolean;
    message : string;
    data : T | null;
    statusCode : number
}

export class ResponseModel {
  static success<T>(message: string, data: T, statusCode = HttpStatus.OK): ApiResponse<T> {
    return { success: true, message, data, statusCode };
  }
 
  static error(message: string, statusCode = HttpStatus.BAD_REQUEST): ApiResponse<null> {
    return { success: false, message, data: null, statusCode };
  }
 
  static created<T>(message: string, data: T): ApiResponse<T> {
    return { success: true, message, data, statusCode: HttpStatus.CREATED};
  }
}