import { HttpStatus } from "../constants/index.js";

export interface ApiResponse<T = null>{
    success : boolean;
    message : string;
    data : T | null;
    statusCode : number;
    meta?: any;
}

export class ResponseModel {
  static success<T>(message: string, data: T, statusCode: number = HttpStatus.OK, meta?: any): ApiResponse<T> {
    return { success: true, message, data, statusCode, meta };
  }
 
  static error(message: string, statusCode: number = HttpStatus.BAD_REQUEST): ApiResponse<null> {
    return { success: false, message, data: null, statusCode };
  }
 
  static created<T>(message: string, data: T): ApiResponse<T> {
    return { success: true, message, data, statusCode: HttpStatus.CREATED};
  }
}
