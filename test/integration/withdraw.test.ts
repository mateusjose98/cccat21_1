import axios from "axios";

axios.defaults.validateStatus = () => true;

const apiUrl = "http://localhost:3000";
const existingAccouuntId = "9a70ef3b-44cb-4d6c-965a-6a3684e21c5b";
const unExistingAccouuntId = "7a70ef3b-44cb-4d6c-965a-6a3684e21c5b";

test("withdraw BTC", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: existingAccouuntId,
        assetId: "BTC",
        quantity: 10.5
    });

    expect(response.status).toBe(201);
});

test("withdraw USD", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: existingAccouuntId,
        assetId: "USD",
        quantity: 2500
    });

    expect(response.status).toBe(201);
});

test("withdraw with invalid accountId", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: unExistingAccouuntId,
        assetId: "BTC",
        quantity: 10.5
    });

    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Account does not exist");
});

test("withdraw with invalid quantity", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: existingAccouuntId,
        assetId: "BTC",
        quantity: -1
    });

    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid quantity");
});


test("withdraw with invalid assetId", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: existingAccouuntId,
        assetId: "EUR",
        quantity: 10.5
    });

    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid assetId");
});

test("withdraw with quantity greater than available", async () => {
    const response = await axios.post(`${apiUrl}/withdraw`, {
        accountId: existingAccouuntId,
        assetId: "BTC",
        quantity: 1000000000
    });

    expect(response.status).toBe(422);
    expect(response.data.error).toBe("Invalid quantity");
});