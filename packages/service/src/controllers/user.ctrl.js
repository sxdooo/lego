const userService = require('../services/user.service');

exports.list = async (ctx) => {
    ctx.body = await userService.findAll();
}

exports.detail = async (ctx) => {
    ctx.body = await userService.findById(ctx.params.id);
}

exports.create = async (ctx) => {
    const { name } = ctx.request.body;
    if(!name){
        ctx.throw(400, 'name required!!!');
    }
    ctx.body = await userService.create({ ...ctx.request.body });
}

exports.update = async (ctx) => {
    ctx.body = await userService.update(ctx.params.id, ctx.request.body);
}

exports.remove = async (ctx) => {
    ctx.body = await userService.remove(ctx.params.id);
}