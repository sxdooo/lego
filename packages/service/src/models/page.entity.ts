const { Entity, Column, ObjectIdColumn } = require('typeorm');

@Entity({ name: 'pages' })
class Page {
  @ObjectIdColumn()
  id!: string | number;

  @Column()
  name!: string;

  @Column()
  components!: any[];

  @Column()
  createdAt!: Date;
}

module.exports = Page;

