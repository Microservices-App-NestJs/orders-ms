import { OrderStatus } from '@prisma/client';

export interface IOrderWithProducts {
  OrderItem: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
