export interface IRpcError {
  statusCode: number;
  message: string;
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  available: boolean;

  createdAt: Date;
  updatedAt: Date;
}
