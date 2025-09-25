const { getMongoRepository } = require('typeorm');
const User = require('../models/user.entity');
const { AppDataSource } = require('../data-source'); 
const { ObjectId } = require('mongodb'); 

const repo = () => AppDataSource.getMongoRepository(User);

exports.findAll = async () => repo().find();

exports.findById = async (id: string | number) => {
  const user = await repo().findOne({ where: { _id: new ObjectId(id) } });
  if (!user) throw new Error('User not found');
  return user;
};

exports.create = async (data: any) => {
  return repo().save(data);
};

exports.update = async (id: string | number, data: any) => {
  await repo().updateOne({ _id: new ObjectId(id) }, { $set: data });
  return repo().findOne({ where: { _id: new ObjectId(id) } });
};

exports.remove = async (id: string | number) => {
  await repo().deleteOne({ _id: new ObjectId(id) });
  return { deleted: true };
};