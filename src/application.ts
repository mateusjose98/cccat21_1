import crypto from 'crypto';
import { validateCpf } from './validateCpf';
import { validatePassword } from './validatePassword';
import {
  getAccountAsset,
  getAccountAssets,
  getAccountById,
  getOrderById,
  saveAccount,
  saveAccountAsset,
  saveOrder,
  updateAccountAsset,
} from './resources';

export async function deposit(input: any) {
  if (!input.quantity || input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    throw new Error('Invalid assetId');
  }
  const accountData = await getAccountById(input.accountId);
  if (!accountData) {
    throw new Error('Account does not exist');
  }
  const accountAssetsData = await getAccountAsset(
    input.accountId,
    input.assetId,
  );

  if (accountAssetsData) {
    input.quantity += parseFloat(accountAssetsData.quantity);
    await updateAccountAsset(input.quantity, input.accountId, input.assetId);
  } else {
    input.quantity = parseFloat(input.quantity);
  }

  await saveAccountAsset(input);
}

export async function withdraw(input: any) {
  if (!input.quantity || input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!input.assetId || (input.assetId !== 'BTC' && input.assetId !== 'USD')) {
    throw new Error('Invalid assetId');
  }
  const accountData = await getAccountById(input.accountId);
  if (!accountData) throw new Error('Account does not exist');
  const accountAssetsData = await getAccountAsset(
    input.accountId,
    input.assetId,
  );
  if (!accountAssetsData || accountAssetsData.quantity < input.quantity) {
    throw new Error('Insufficient asset quantity');
  }
  let quantity = parseFloat(accountAssetsData.quantity) - input.quantity;
  await updateAccountAsset(quantity, input.accountId, input.assetId);
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
  await saveOrder(order);
  return {
    orderId: order.orderId,
  };
}

export async function getOrder(orderId: string) {
  const orderData = await getOrderById(orderId);
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
  const accountData = await getAccountById(accountId);
  const accountAssetsData = await getAccountAssets(accountId);
  if (accountData) {
    accountData.assets = [];
    for (const accountAssetData of accountAssetsData) {
      accountData.assets.push({
        assetId: accountAssetData.asset_id,
        quantity: parseFloat(accountAssetData.quantity),
      });
    }
    return accountData;
  } else {
    throw new Error('Account not found');
  }
}
