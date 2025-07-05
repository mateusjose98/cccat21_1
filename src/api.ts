import Withdraw from './application/usecases/Withdraw';
import Deposit from './application/usecases/Deposit';

import { ExpressAdapter } from './infra/http/HttpServer';
import AccountController from './infra/controller/AccountController';
import OrderController from './infra/controller/OrderController';
import { PgPromiseAdapter } from './infra/database/DatabaseConnection';
import GetAccount from './application/usecases/GetAccount';
import GetOrder from './application/usecases/GetOrder';
import PlaceOrder from './application/usecases/PlaceOrder';
import Signup from './application/usecases/Signup';
import { AccountRepositoryDatabase } from './infra/repository/AccountDAO';
import { OrderRepositoryDatabase } from './infra/repository/OrderRepository';

// create adapters
const httpServer = new ExpressAdapter();
const connection = new PgPromiseAdapter();

// create repositories
const accountRepository = new AccountRepositoryDatabase(connection);
const orderRepository = new OrderRepositoryDatabase(connection);

// create use cases
const signup = new Signup(accountRepository);
const getAccount = new GetAccount(accountRepository);
const withdraw = new Withdraw(accountRepository);
const deposit = new Deposit(accountRepository);
const placeOrder = new PlaceOrder(orderRepository);
const getOrder = new GetOrder(orderRepository);

// configure routes
AccountController.config(httpServer, signup, deposit, withdraw, getAccount);
OrderController.config(httpServer, placeOrder, getOrder);
httpServer.listen(3001);
