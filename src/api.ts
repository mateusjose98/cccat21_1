import express, { Request, Response } from 'express';
import {
  deposit,
  getAccount,
  getOrder,
  placeOrder,
  signup,
  withdraw,
} from './application';

const app = express();
app.use(express.json());

app.post('/signup', async (req: Request, res: Response) => {
  const input = req.body;
  try {
    const output = await signup(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post('/deposit', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    await deposit(input);
    return res.status(201).end();
  } catch (e: any) {
    return res.status(422).json({
      error: e.message,
    });
  }
});

app.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    await withdraw(input);
    return res.status(201).end();
  } catch (e: any) {
    return res.status(422).json({
      error: e.message,
    });
  }
});

app.get('/accounts/:accountId', async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId;
    const output = await getAccount(accountId);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post('/place_order', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const output = await placeOrder(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const output = await getOrder(orderId);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.listen(3001);
