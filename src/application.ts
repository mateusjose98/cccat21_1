import crypto from 'crypto';
import pgp from 'pg-promise';
import { validateCpf } from './validateCpf';
import { validatePassword } from './validatePassword';

// const accounts: any = [];
const connection = pgp()('postgres://postgres:123456@localhost:5432/app');

function isValidName(name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail(email: string) {
  return email.match(/^(.+)\@(.+)$/);
}

export async function signup(input: any) {
  if (!isValidName(input.name)) {
    throw new Error('Invalid name');
  }
  if (!isValidEmail(input.email)) {
    throw new Error('Invalid email');
  }
  if (!validateCpf(input.document)) {
    throw new Error('Invalid document');
  }
  if (!validatePassword(input.password)) {
    throw new Error('Invalid password');
  }
  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password,
  };

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
  return {
    accountId: account.accountId,
  };
}

export async function deposit(input: any) {
  if (!input.quantity || input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    throw new Error('Invalid assetId');
  }
  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [input.accountId],
  );
  if (!accountData) {
    throw new Error('Account does not exist');
  }
  await connection.query(
    'insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3) on conflict (account_id, asset_id) do update set quantity = ccca.account_asset.quantity + $3',
    [input.accountId, input.assetId, input.quantity],
  );
}

export async function withdraw(input: any) {
  if (!input.quantity || input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    throw new Error('Invalid assetId');
  }

  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [input.accountId],
  );
  if (!accountData) {
    throw new Error('Account does not exist');
  }
  const [assetData] = await connection.query(
    'select * from ccca.account_asset where account_id = $1 and asset_id = $2',
    [input.accountId, input.assetId],
  );

  if (!assetData || assetData.quantity < input.quantity) {
    throw new Error('Insufficient asset quantity');
  }
  await connection.query(
    'update ccca.account_asset set quantity = quantity - $1 where account_id = $2 and asset_id = $3',
    [input.quantity, input.accountId, input.assetId],
  );
}

export async function placeOrder(input: any) {
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

  return {
    orderId: order.orderId,
  };
}

export async function getOrder(orderId: string) {
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
    return order;
  } else {
    throw new Error('Order not found');
  }
}

export async function getAccount(accountId: string) {
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
    return {
      accountId: accountData.account_id,
      name: accountData.name,
      email: accountData.email,
      document: accountData.document,
      assets: accountData.assets,
    };
  } else {
    throw new Error('Account not found');
  }
}
