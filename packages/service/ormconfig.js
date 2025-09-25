module.exports = {
    type: 'mongodb',
    url: "mongodb://backend:Backend666!@8.140.26.176:27017/backend?authSource=backend",
    synchronize: true, // 开发阶段自动建集合；上线关
    logging: ['query', 'error'],
    entities: [__dirname + '/src/models/*.entity.js'], // 实体路径
    useUnifiedTopology: true,
};