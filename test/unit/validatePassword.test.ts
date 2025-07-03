import { validatePassword } from "../../src/validatePassword";


test("Deve validar a senha", () => {
    const password = "asdQWE123";
    const isValid = validatePassword(password);
    expect(isValid).toBe(true);
});

test.each([
    "12345678",
    "abcdefgh",
    "ABCDEFGH",
    "12345678a",
    "12345678A",
    "abcdefgh1",
    "ABCDEFGH1"
])("Não deve validar a senha %s", (password: string) => {
    const isValid = validatePassword(password);
    expect(isValid).toBe(false);
});