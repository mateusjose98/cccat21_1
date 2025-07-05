import axios from 'axios';

axios.defaults.validateStatus = () => true;

const apiUrl = 'http://localhost:3001';
const unExistingAccouuntId = '7a70ef3b-44cb-4d6c-965a-6a3684e21c5b';

async function populateDatabase() {
  const inputSignup = {
    name: 'mateus josé',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(
    'http://localhost:3001/signup',
    inputSignup,
  );
  return responseSignup.data.accountId as string;
}

async function populateAssets(
  acc: string,
  quantity: string,
  assetId: string = 'USD',
) {
  const inputDeposit = {
    accountId: acc,
    assetId: assetId,
    quantity: quantity,
  };
  await axios.post('http://localhost:3001/deposit', inputDeposit);
}

test('withdraw BTC', async () => {
  const accountId = await populateDatabase();
  await populateAssets(accountId, '100', 'BTC');

  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: accountId,
    assetId: 'BTC',
    quantity: 9.5,
  });

  expect(response.status).toBe(201);
  const responseAccount = await axios.get(`${apiUrl}/accounts/${accountId}`);
  expect(responseAccount.status).toBe(200);
  expect(responseAccount.data.assets).toHaveLength(1);
  expect(responseAccount.data.assets[0].assetId).toBe('BTC');
  expect(responseAccount.data.assets[0].quantity).toBe(90.5);
});

test('withdraw USD', async () => {
  const accountId = await populateDatabase();
  await populateAssets(accountId, '2500', 'USD');

  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: accountId,
    assetId: 'USD',
    quantity: 2500,
  });

  expect(response.status).toBe(201);
});

test('withdraw with invalid accountId', async () => {
  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: unExistingAccouuntId,
    assetId: 'BTC',
    quantity: 10.5,
  });

  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Account does not exist');
});

test('withdraw with invalid quantity', async () => {
  const accountId = await populateDatabase();
  await populateAssets(accountId, '2500', 'BTC');
  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: accountId,
    assetId: 'BTC',
    quantity: -1,
  });

  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Quantity must be greater than 0');
});

test('withdraw with invalid assetId', async () => {
  const accountId = await populateDatabase();
  await populateAssets(accountId, '2500', 'BTC');
  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: accountId,
    assetId: 'EUR',
    quantity: 10.5,
  });

  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Invalid assetId');
});

test('withdraw with quantity greater than available', async () => {
  const accountId = await populateDatabase();
  await populateAssets(accountId, '1', 'BTC');
  const response = await axios.post(`${apiUrl}/withdraw`, {
    accountId: accountId,
    assetId: 'BTC',
    quantity: 1000000000,
  });

  expect(response.status).toBe(422);
  expect(response.data.error).toBe('Insufficient asset quantity');
});
