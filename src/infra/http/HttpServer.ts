import express, { Express, Request, Response } from 'express';

export default interface HttpServer {
  route(method: string, url: string, callback: Function): void;
  listen(port: number): void;
}

export class ExpressAdapter implements HttpServer {
  app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  route(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    callback: Function,
  ): void {
    this.app[method](url, async (req: Request, res: Response) => {
      try {
        const output = await callback(req.params, req.body);
        res.json(output);
      } catch (e: any) {
        console.error('Error in route handler:', e);
        res.status(422).json({
          error: e.message,
        });
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port);
  }
}
