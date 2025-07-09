import GetTrades from '../../application/usecases/GetTrades';
import HttpServer from '../http/HttpServer';

export default class TradeController {
  static config(httpServer: HttpServer, getTrades: GetTrades) {
    httpServer.route(
      'get',
      '/markets/:marketId/trades',
      async (params: any, body: any) => {
        const marketId = params.marketId.replace('-', '/');
        const output = await getTrades.execute(marketId);
        return output;
      },
    );
  }
}
