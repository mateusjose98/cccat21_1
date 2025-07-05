import axios from 'axios';

axios.defaults.validateStatus = () => true;
const baseurl = 'http://localhost:3001';
test('Deve criar uma conta válida', async () => {
  const inputSignup = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(`${baseurl}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(outputSignup.accountId).toBeDefined();
  const responseGetAccount = await axios.get(
    `${baseurl}/accounts/${outputSignup.accountId}`,
  );
  const outputGetAccount = responseGetAccount.data;
  expect(outputGetAccount.name).toBe(inputSignup.name);
  expect(outputGetAccount.email).toBe(inputSignup.email);
  expect(outputGetAccount.document).toBe(inputSignup.document);
  expect(outputGetAccount.assets).toStrictEqual([]);
});

test('Não deve criar uma conta com nome inválido', async () => {
  const inputSignup = {
    name: 'John',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(`${baseurl}/signup`, inputSignup);
  const outputSignup = responseSignup.data;
  expect(responseSignup.status).toBe(422);
  expect(outputSignup.error).toBe('Invalid name');
});
