import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderStatusList } from '../enum/enum';
import { OrderStatus } from '@prisma/client';

export class OrderPaginationDto extends PaginationDto {
  @IsEnum(OrderStatusList, {
    message: `Possible order status are: ${OrderStatusList}`,
  })
  @IsOptional()
  status: OrderStatus;
}
