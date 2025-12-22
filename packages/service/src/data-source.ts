require('reflect-metadata');
const { DataSource } = require('typeorm');
const User = require('./models/user.entity');
const Page = require('./models/page.entity');

const AppDataSource = new DataSource({
  type: 'mongodb',
  url: "mongodb://backend:Backend666!@8.140.26.176:27017/backend?authSource=backend",
  synchronize: true,
  logging: true,
  entities: [User, Page],
});

module.exports = { AppDataSource };