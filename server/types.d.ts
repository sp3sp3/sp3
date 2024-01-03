import { Request, Response } from "express-serve-static-core";
import { Send } from "express-serve-static-core";

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedRequestQuery<T> extends Request {
  query: T;
}

export interface TypedResponse<T> extends Response {
  json: Send<T, this>;
}
