import axios from 'axios';

axios.defaults.validateStatus = () => true;

test('Deve criar uma ordem de venda', async () => {
  const inputSignup = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(
    'http://localhost:3000/signup',
    inputSignup,
  );
  const outputSignup = responseSignup.data;
  const inputPlaceOrder = {
    marketId: 'BTC/USD',
    accountId: outputSignup.accountId,
    side: 'sell',
    quantity: 1,
    price: 94000,
  };
  const responsePlaceOrder = await axios.post(
    'http://localhost:3000/place_order',
    inputPlaceOrder,
  );
  const outputPlaceOrder = await responsePlaceOrder.data;
  expect(outputPlaceOrder.orderId).toBeDefined();
  const responseGetOrder = await axios.get(
    `http://localhost:3000/orders/${outputPlaceOrder.orderId}`,
  );
  const outputGetOrder = responseGetOrder.data;
  expect(outputGetOrder.marketId).toBe(inputPlaceOrder.marketId);
  expect(outputGetOrder.side).toBe(inputPlaceOrder.side);
  expect(outputGetOrder.quantity).toBe(inputPlaceOrder.quantity);
  expect(outputGetOrder.price).toBe(inputPlaceOrder.price);
  expect(outputGetOrder.status).toBe('open');
  expect(outputGetOrder.timestamp).toBeDefined();
});
