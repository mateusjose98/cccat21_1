import axios from 'axios';

axios.defaults.validateStatus = () => true;

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

test('Deve realizar um depósito em uma conta', async () => {
  const accountId = await populateDatabase();

  const inputDeposit = {
    accountId: accountId,
    assetId: 'BTC',
    quantity: 0.01,
  };
  const responseSignup = await axios.post(
    'http://localhost:3001/deposit',
    inputDeposit,
  );

  expect(responseSignup.status).toBe(201);

  const responseAccount = await axios.get(
    `http://localhost:3001/accounts/${accountId}`,
  );
  expect(responseAccount.status).toBe(200);
  expect(responseAccount.data.assets).toHaveLength(1);
  expect(responseAccount.data.assets[0].assetId).toBe('BTC');
});

test('Não deve realizar um depósito em uma conta inexistente', async () => {
  const accountId = crypto.randomUUID();
  const inputDeposit = {
    accountId: accountId,
    assetId: 'BTC',
    quantity: 0.01,
  };
  const responseSignup = await axios.post(
    'http://localhost:3001/deposit',
    inputDeposit,
  );
  expect(responseSignup.status).toBe(422);
  expect(responseSignup.data.error).toBe('Account does not exist');
});

test.each([0, -1])(
  'Não deve realizar um depósito quantidade não positiva',
  async (quantity: number) => {
    const accountId = await populateDatabase();
    const inputDeposit = {
      accountId: accountId,
      assetId: 'BTC',
      quantity,
    };
    const responseSignup = await axios.post(
      'http://localhost:3001/deposit',
      inputDeposit,
    );
    expect(responseSignup.status).toBe(422);
    expect(responseSignup.data.error).toBe('Quantity must be greater than 0');
  },
);
