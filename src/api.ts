import express, { Request, Response } from 'express';
import crypto from 'crypto';
import pgp from 'pg-promise';
import { validateCpf } from './validateCpf';
import { validatePassword } from './validatePassword';

const app = express();
app.use(express.json());

// const accounts: any = [];
const connection = pgp()('postgres://postgres:123456@localhost:5432/app');

function isValidName(name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail(email: string) {
  return email.match(/^(.+)\@(.+)$/);
}

app.post('/signup', async (req: Request, res: Response) => {
  const input = req.body;
  if (!isValidName(input.name)) {
    return res.status(422).json({
      error: 'Invalid name',
    });
  }
  if (!isValidEmail(input.email)) {
    return res.status(422).json({
      error: 'Invalid email',
    });
  }
  if (!validateCpf(input.document)) {
    return res.status(422).json({
      error: 'Invalid document',
    });
  }
  if (!validatePassword(input.password)) {
    return res.status(422).json({
      error: 'Invalid password',
    });
  }
  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password,
  };
  // accounts.push(account);
  await connection.query(
    'insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)',
    [
      account.accountId,
      account.name,
      account.email,
      account.document,
      account.password,
    ],
  );
  res.json({
    accountId,
  });
});

app.get('/accounts/:accountId', async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  // const account = accounts.find((account: any) => account.accountId === accountId);
  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [accountId],
  );
  if (accountData) {
    accountData.assets = [];
    const assets = await connection.query(
      'select * from ccca.account_asset where account_id = $1',
      [accountId],
    );
    for (const asset of assets) {
      accountData.assets.push({
        assetId: asset.asset_id,
        quantity: parseFloat(asset.quantity),
      });
    }
    res.json(accountData);
  } else {
    res.status(404).json({
      error: 'Account not found',
    });
  }
});

app.post('/deposit', async (req: Request, res: Response) => {
  const input = req.body;
  console.log(input);
  if (!input.quantity || input.quantity <= 0) {
    return res.status(422).json({
      error: 'Invalid quantity',
    });
  }
  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    return res.status(422).json({
      error: 'Invalid assetId',
    });
  }
  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [input.accountId],
  );
  if (!accountData) {
    return res.status(422).json({
      error: 'Account does not exist',
    });
  }
  await connection.query(
    'insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = ccca.account_asset.quantity + $3',
    [input.accountId, input.assetId, input.quantity],
  );
  return res.status(201).end();
});

app.post('/withdraw', async (req: Request, res: Response) => {
  const input = req.body;

  if (!input.quantity || input.quantity <= 0) {
    return res.status(422).json({
      error: 'Quantity must be greater than 0',
    });
  }

  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    return res.status(422).json({
      error: 'Invalid assetId',
    });
  }

  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [input.accountId],
  );
  if (!accountData) {
    return res.status(422).json({
      error: 'Account does not exist',
    });
  }
  const [assetData] = await connection.query(
    'select * from ccca.account_asset where account_id = $1 and asset_id = $2',
    [input.accountId, input.assetId],
  );

  if (!assetData || assetData.quantity < input.quantity) {
    return res.status(422).json({
      error: 'Invalid quantity',
    });
  }
  await connection.query(
    'update ccca.account_asset set quantity = quantity - $1 where account_id = $2 and asset_id = $3',
    [input.quantity, input.accountId, input.assetId],
  );

  return res.status(201).end();
});

app.post('/place_order', async (req: Request, res: Response) => {
  const input = req.body;
  const order = {
    orderId: crypto.randomUUID(),
    marketId: input.marketId,
    accountId: input.accountId,
    side: input.side,
    quantity: input.quantity,
    price: input.price,
    status: 'open',
    timestamp: new Date(),
  };

  await connection.query(
    'insert into ccca.order (order_id, market_id, account_id, side, quantity, price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      order.orderId,
      order.marketId,
      order.accountId,
      order.side,
      order.quantity,
      order.price,
      order.status,
      order.timestamp,
    ],
  );

  res.json({
    orderId: order.orderId,
  });
});

app.get('/orders/:orderId', async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const [orderData] = await connection.query(
    'select * from ccca.order where order_id = $1',
    [orderId],
  );
  if (orderData) {
    const order = {
      orderId: orderData.order_id,
      marketId: orderData.market_id,
      accountId: orderData.account_id,
      side: orderData.side,
      quantity: parseFloat(orderData.quantity),
      price: parseFloat(orderData.price),
      status: orderData.status,
      timestamp: orderData.timestamp,
    };
    res.json(order);
  } else {
    res.status(404).json({
      error: 'Order not found',
    });
  }
});

app.listen(3000);
