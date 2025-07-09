import { Mediator } from '../../infra/mediator/Mediator';
import WebSocketServer from '../../infra/ws/WebSocketServer';
import ExecuteOrder from '../usecases/ExecuteOrder';
import GetDepth from '../usecases/GetDepth';

export default class OrderHandler {
  static config(
    mediator: Mediator,
    websocketServer: WebSocketServer,
    executeOrder: ExecuteOrder,
    getDepth: GetDepth,
  ) {
    mediator.register('orderPlaced', async (data: any) => { // quando acontecer 'orderPlaced', chama esse método
      await executeOrder.execute({ marketId: data.marketId });
      const depth = await getDepth.execute(data.marketId, 0);
      websocketServer.broadcast(depth);
    });
  }
}
