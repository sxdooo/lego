const pageService = require('../services/page.service');

exports.list = async (ctx) => {
  ctx.body = await pageService.findAll();
};

exports.detail = async (ctx) => {
  ctx.body = await pageService.findById(ctx.params.id);
};

exports.create = async (ctx) => {
  const { components, name } = ctx.request.body;
  if (!Array.isArray(components)) {
    ctx.throw(400, 'components 必填并且应是数组');
  }
  ctx.body = await pageService.create({ components, name });
};

