console.log('[Entity] User decorator is running'); 
const { Entity, Column, ObjectIdColumn } = require('typeorm');

@Entity({name: 'users'})
class User {
    @ObjectIdColumn()
    id!: string | number;

    @Column()
    name!: string;

    @Column()
    age!: number;
}

module.exports = User;