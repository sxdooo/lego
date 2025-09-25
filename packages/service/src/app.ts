require('reflect-metadata');
const { DataSource } = require('typeorm');
const Koa = require('koa');
const body = require('koa-bodyparser');
const mountRoutes = require('./routes');
const error = require('./middlewares/error');
const User = require('./models/user.entity');
const { AppDataSource } = require('./data-source');

(async () => {
    await AppDataSource.initialize();     // ④ 连完库再启动 web
    console.log('MongoDB connected');

    const app = new Koa();
    app.use(error); // 全局错误处理
    app.use(body());
    mountRoutes(app); // 自动挂载所有路由

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
})()

module.exports = { AppDataSource };


