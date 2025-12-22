const { AppDataSource } = require('../data-source');
const Page = require('../models/page.entity');
const { ObjectId } = require('mongodb');

const repo = () => AppDataSource.getMongoRepository(Page);

exports.findAll = async () => repo().find();

exports.findById = async (id: number | string) => {
  const page = await repo().findOne({ where: { _id: new ObjectId(id) } });
  if (!page) throw new Error('Page not found');
  return page;
};

exports.create = async (data: any) => {
  const components = Array.isArray(data.components) ? data.components : [];
  const record = {
    name: data.name || `页面-${new Date().toISOString()}`,
    components,
    createdAt: data.createdAt || new Date(),
  };

  return repo().save(record);
};

