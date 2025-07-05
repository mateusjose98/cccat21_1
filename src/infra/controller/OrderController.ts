import GetOrder from '../../application/usecases/GetOrder';
import PlaceOrder from '../../application/usecases/PlaceOrder';
import HttpServer from '../http/HttpServer';

export default class OrderController {
  static config(
    httpServer: HttpServer,
    placeOrder: PlaceOrder,
    getOrder: GetOrder,
  ) {
    httpServer.route('post', '/place_order', async (params: any, body: any) => {
      const input = body;
      const output = await placeOrder.execute(input);
      return output;
    });

    httpServer.route(
      'get',
      '/orders/:orderId',
      async (params: any, body: any) => {
        const orderId = params.orderId;
        const output = await getOrder.execute(orderId);
        return output;
      },
    );
  }
}
