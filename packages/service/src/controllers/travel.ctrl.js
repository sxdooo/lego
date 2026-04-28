const travelService = require('../services/travel.service');

const requiredStringFields = [
  'id',
  'avatar',
  'driverName',
  'driverAddress',
  'pickupPointsFull',
  'dropoffPointsFull',
  'pickupPoints',
  'dropoffPoints',
];

const parseTimeInput = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const date = new Date(Number(value));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const isValidTimestamp = (value) => {
  return !!parseTimeInput(value);
};

const validatePayload = (ctx, payload, isCreate = false) => {
  requiredStringFields.forEach((field) => {
    if ((isCreate || payload[field] !== undefined) && typeof payload[field] !== 'string') {
      ctx.throw(400, `${field} 必须是字符串`);
    }
  });

  if ((isCreate || payload.seatsLeft !== undefined) && typeof payload.seatsLeft !== 'number') {
    ctx.throw(400, 'seatsLeft 必须是数字');
  }

  if ((isCreate || payload.isAlongTheWay !== undefined) && typeof payload.isAlongTheWay !== 'boolean') {
    ctx.throw(400, 'isAlongTheWay 必须是布尔值');
  }

  if ((isCreate || payload.departTime !== undefined) && !isValidTimestamp(payload.departTime)) {
    ctx.throw(400, 'departTime 必须是合法完整时间戳');
  }
};

exports.list = async (ctx) => {
  const page = ctx.query.page !== undefined ? Number(ctx.query.page) : 1;
  const pageSize = ctx.query.pageSize !== undefined ? Number(ctx.query.pageSize) : -1;
  const day = ctx.query.day;
  const startTime = ctx.query.startTime;
  const endTime = ctx.query.endTime;
  const rawRanges = ctx.query.ranges;

  if (!Number.isFinite(page) || page <= 0) {
    ctx.throw(400, 'page 必须是大于 0 的数字');
  }

  if (!Number.isFinite(pageSize) || (pageSize !== -1 && pageSize <= 0)) {
    ctx.throw(400, 'pageSize 必须是正整数，或 -1');
  }

  if (day !== undefined && day !== 'today' && day !== 'tomorrow') {
    ctx.throw(400, 'day 仅支持 today 或 tomorrow');
  }

  if (startTime !== undefined && !isValidTimestamp(startTime)) {
    ctx.throw(400, 'startTime 必须是合法时间戳');
  }
  if (endTime !== undefined && !isValidTimestamp(endTime)) {
    ctx.throw(400, 'endTime 必须是合法时间戳');
  }

  let ranges;
  if (rawRanges !== undefined) {
    try {
      ranges = typeof rawRanges === 'string' ? JSON.parse(rawRanges) : rawRanges;
    } catch (error) {
      ctx.throw(400, 'ranges 必须是合法 JSON 数组');
    }

    if (!Array.isArray(ranges)) {
      ctx.throw(400, 'ranges 必须是数组');
    }

    ranges.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        ctx.throw(400, `ranges[${index}] 必须是对象`);
      }
      if (item.startTime !== undefined && !isValidTimestamp(item.startTime)) {
        ctx.throw(400, `ranges[${index}].startTime 必须是合法时间戳`);
      }
      if (item.endTime !== undefined && !isValidTimestamp(item.endTime)) {
        ctx.throw(400, `ranges[${index}].endTime 必须是合法时间戳`);
      }
    });
  }

  ctx.body = await travelService.findAll({
    page,
    pageSize,
    day,
    startTime,
    endTime,
    ranges,
  });
};

exports.detail = async (ctx) => {
  ctx.body = await travelService.findById(ctx.params.id);
};

exports.create = async (ctx) => {
  const payload = ctx.request.body || {};
  validatePayload(ctx, payload, true);
  const data = await travelService.create(payload);
  ctx.body = {
    code: 10000,
    msg: '创建成功',
    data,
  };
};

exports.update = async (ctx) => {
  const payload = ctx.request.body || {};
  validatePayload(ctx, payload, false);
  ctx.body = await travelService.updateById(ctx.params.id, payload);
};

exports.remove = async (ctx) => {
  ctx.body = await travelService.removeById(ctx.params.id);
};
