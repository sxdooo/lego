const { Entity, Column, ObjectIdColumn } = require('typeorm');

@Entity({ name: 'travels' })
class Travel {
  @ObjectIdColumn()
  _id!: string | number;

  @Column()
  id!: string;

  @Column()
  avatar!: string;

  @Column()
  departTime!: Date;

  @Column()
  seatsLeft!: number;

  @Column()
  driverName!: string;

  @Column()
  driverAddress!: string;

  @Column()
  pickupPointsFull!: string;

  @Column()
  dropoffPointsFull!: string;

  @Column()
  pickupPoints!: string;

  @Column()
  dropoffPoints!: string;

  @Column()
  isAlongTheWay!: boolean;

  @Column()
  createdAt!: Date;

  @Column()
  updatedAt!: Date;
}

module.exports = Travel;
