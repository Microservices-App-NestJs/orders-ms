import { OrderStatus } from '@prisma/client';

export const OrderStatusList = [
  OrderStatus.PENDING,
  OrderStatus.SHIPPED,
  OrderStatus.CANCELLED,
  OrderStatus.PAID,
];
