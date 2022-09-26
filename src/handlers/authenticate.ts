import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { configuration } from '../database';

export function getToken(req: Request): string | null {
  if (req.body && req.body.token) return <string>req.body.token;
  if (req.headers['authorization'])
    return req.headers['authorization'].split(' ')[1];
  return null;
}
export default function authenticate(
  req: Request,
  resp: Response,
  next: () => void,
) {
  try {
    const token = getToken(req);
    if (token === null) {
      resp.status(403).json(`UnAuthorized user access`);
    } else {
      jwt.verify(token, <string>configuration.tokenSecret);
      next();
    }
  } catch (err) {
    resp.status(403).json(`UnAuthorized user access`);
  }
}
