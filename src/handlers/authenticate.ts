import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { configuration } from '../database';

export default function authenticate(
  req: Request,
  resp: Response,
  next: () => void,
) {
  try {
    if (req.body && req.body.token) {
      jwt.verify(<string>req.body.token, <string>configuration.tokenSecret);
      next();
    } else {
      if (req.headers['authorization']) {
        const token = req.headers['authorization'].split(' ')[1];
        jwt.verify(token, <string>configuration.tokenSecret);
        next();
      } else {
        resp.status(403).json(`UnAuthorized user access`);
      }
    }
  } catch (err) {
    resp.status(403).json(`UnAuthorized user access`);
  }
}
