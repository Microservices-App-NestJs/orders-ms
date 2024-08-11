import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum/enum';
import { OrderStatus } from '@prisma/client';

export class StatusDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsEnum(OrderStatusList, {
    message: `Possible order status are: ${OrderStatusList}`,
  })
  @IsOptional()
  status: OrderStatus;
}
