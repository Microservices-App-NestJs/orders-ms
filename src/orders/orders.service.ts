import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderItem, PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { StatusDto } from './dto/status.dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { IProduct } from 'src/common/interfaces/interfaces';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {
    super();
  }

  private readonly logger = new Logger('OrdersMS-Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const { items } = createOrderDto;
      const productIds = items.map((prod) => prod.productId);

      const products: IProduct[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds),
      );

      const totalItems: number = items.reduce((acc, ordItem) => {
        return acc + ordItem.quantity;
      }, 0);
      const totalAmount: number = items.reduce((acc, ordItem) => {
        const price: number =
          products.find((prod) => prod.id === ordItem.productId).price *
          ordItem.quantity;

        return acc + price;
      }, 0);

      const orderBody = {
        totalAmount,
        totalItems,
      };

      const orderItems = items.map((ordItem) => {
        return {
          productName: products.find((prod) => prod.id === ordItem.productId)
            .name,
          productId: ordItem.productId,
          quantity: ordItem.quantity,
          price: products.find((prod) => prod.id === ordItem.productId).price,
        };
      });

      const order = await this.order.create({
        data: {
          ...orderBody,
          OrderItem: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              productName: true,
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { limit, page, status } = orderPaginationDto;

    const totalPages = await this.order.count({
      where: {
        status: status,
      },
    });

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          status,
        },
      }),
      meta: {
        total: totalPages,
        page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOne(id: string) {
    const foundOrder = await this.order.findFirst({
      where: {
        id,
      },
      include: {
        OrderItem: {
          select: {
            productName: true,
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });
    if (!foundOrder)
      throw new RpcException({
        message: `Order with id: #${id} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      });

    return foundOrder;
  }

  async changeOrderStatus(statusDto: StatusDto) {
    const { id, status } = statusDto;
    const order = await this.findOne(id);

    if (order.status === status) return order;

    return this.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
