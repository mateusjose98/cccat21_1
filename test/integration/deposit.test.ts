import axios from "axios";

axios.defaults.validateStatus = () => true;


test("Deve realizar um depósito em uma conta", async () => {
    const inputDeposit = {
      accountId: "9a70ef3b-44cb-4d6c-965a-6a3684e21c5b",
      assetId: "BTC",
      quantity: 0.01
    }
    const responseSignup = await axios.post("http://localhost:3000/deposit", inputDeposit);
    expect(responseSignup.status).toBe(201);
  
});

test("Não deve realizar um depósito em uma conta inexistente", async () => {
    const inputDeposit = {
      accountId: "7a70ef3b-44cb-4d6c-965a-6a3684e21c5b",
      assetId: "BTC",
      quantity: 0.01
    }
    const responseSignup = await axios.post("http://localhost:3000/deposit", inputDeposit);
    expect(responseSignup.status).toBe(422);
    expect(responseSignup.data.error).toBe("Account does not exist");
});

test.each([
  0,
  -1
])("Não deve realizar um depósito quantidade não positiva", async (quantity: number) => {
    const inputDeposit = {
      accountId: "9a70ef3b-44cb-4d6c-965a-6a3684e21c5b",
      assetId: "BTC",
      quantity
    }
    const responseSignup = await axios.post("http://localhost:3000/deposit", inputDeposit);
    expect(responseSignup.status).toBe(422);
    expect(responseSignup.data.error).toBe("Invalid quantity");

});