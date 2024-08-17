import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class PaidOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  stripePaymentId: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  receiptUrl: string;
}
