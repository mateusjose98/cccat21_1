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
import { AccountRepositoryDatabase } from './infra/repository/AccountRepository';
import { OrderRepositoryDatabase } from './infra/repository/OrderRepository';
import { WSSAdapter } from './infra/ws/WebSocketServer';
import GetDepth from './application/usecases/GetDepth';
import GetTrades from './application/usecases/GetTrades';
import { TradeRepositoryDatabase } from './infra/repository/TradeRepository';
import TradeController from './infra/controller/TradeController';
import { Mediator } from './infra/mediator/Mediator';
import ExecuteOrder from './application/usecases/ExecuteOrder';
import OrderHandler from './application/handler/OrderHandler';

// create adapters
const httpServer = new ExpressAdapter();
const connection = new PgPromiseAdapter();
const websocketServer = new WSSAdapter(3002);
const mediator = new Mediator();
// create repositories
const accountRepository = new AccountRepositoryDatabase(connection);
const orderRepository = new OrderRepositoryDatabase(connection);
const tradeRepository = new TradeRepositoryDatabase(connection);

// create use cases
const signup = new Signup(accountRepository);
const getAccount = new GetAccount(accountRepository);
const withdraw = new Withdraw(accountRepository);
const deposit = new Deposit(accountRepository);
const placeOrder = new PlaceOrder(orderRepository, mediator);
const getOrder = new GetOrder(orderRepository);
const getDepth = new GetDepth(orderRepository);
const getTrades = new GetTrades(tradeRepository);
const executeOrder = new ExecuteOrder(orderRepository, tradeRepository);

// handler de eventos 'orderPlaced'
OrderHandler.config(mediator, websocketServer, executeOrder, getDepth);

// configure routes
AccountController.config(httpServer, signup, deposit, withdraw, getAccount);
OrderController.config(httpServer, placeOrder, getOrder, getDepth);
TradeController.config(httpServer, getTrades);
httpServer.listen(3001);
