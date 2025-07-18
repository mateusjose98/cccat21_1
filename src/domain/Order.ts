export default class Order {
  constructor(
    readonly orderId: string,
    readonly marketId: string,
    readonly accountId: string,
    readonly side: string,
    readonly quantity: number,
    readonly price: number,
    public status: string,
    readonly timestamp: Date,
    public fillQuantity: number = 0, // Quantity already filled
    public fillPrice: number = 0, // Average price of filled quantity
  ) {}

  static create(
    marketId: string,
    accountId: string,
    side: string,
    quantity: number,
    price: number,
  ) {
    const orderId = crypto.randomUUID();
    const status = 'open';
    const timestamp = new Date();
    const fillQuantity = 0;
    const fillPrice = 0;
    return new Order(
      orderId,
      marketId,
      accountId,
      side,
      quantity,
      price,
      status,
      timestamp,
      fillQuantity,
      fillPrice,
    );
  }

  fill(quantity: number, price: number) {
    this.fillPrice =
      (this.fillQuantity * this.fillPrice + quantity * price) /
      (this.fillQuantity + quantity);
    this.fillQuantity += quantity;
    if (this.getAvailableQuantity() === 0) {
      this.status = 'closed';
    }
  }

  getAvailableQuantity() {
    return this.quantity - this.fillQuantity;
  }
}
