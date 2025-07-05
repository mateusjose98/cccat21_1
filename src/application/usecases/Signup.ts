
import AccountRepository from '../../infra/repository/AccountDAO';
import Account from '../../domain/Account';

export default class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: any): Promise<any> {
    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );
    await this.accountRepository.saveAccount(account);
    return {
      accountId: account.accountId,
    };
  }
}
