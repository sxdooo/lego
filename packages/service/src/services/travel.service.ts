const { AppDataSource } = require('../data-source');
const Travel = require('../models/travel.entity');
const { ObjectId } = require('mongodb');

const repo = () => AppDataSource.getMongoRepository(Travel);

const normalizeDepartTime = (value: any) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('departTime must be a valid timestamp');
  }
  return date;
};

const buildRecord = (data: any) => ({
  id: data.id,
  avatar: data.avatar,
  departTime: normalizeDepartTime(data.departTime),
  seatsLeft: data.seatsLeft,
  driverName: data.driverName,
  driverAddress: data.driverAddress,
  pickupPointsFull: data.pickupPointsFull,
  dropoffPointsFull: data.dropoffPointsFull,
  pickupPoints: data.pickupPoints,
  dropoffPoints: data.dropoffPoints,
  isAlongTheWay: data.isAlongTheWay,
  createdAt: data.createdAt || new Date(),
  updatedAt: new Date(),
});

const findOneByParamId = async (id: string) => {
  if (ObjectId.isValid(id)) {
    const byObjectId = await repo().findOne({ where: { _id: new ObjectId(id) } });
    if (byObjectId) return byObjectId;
  }
  return repo().findOne({ where: { id } });
};

const normalizeTimestamp = (value: any) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const dateFromNumberString = new Date(Number(value));
    if (!Number.isNaN(dateFromNumberString.getTime())) return dateFromNumberString;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const buildDateRangeByDay = (day?: string) => {
  const now = new Date();
  if (!day) {
    return { $gte: now };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(start);

  if (day === 'today') {
    end.setDate(end.getDate() + 1);
    // 今天场景下也要排除“已出行”，起始时间取 max(今天0点, 当前时间)
    const effectiveStart = now > start ? now : start;
    return { $gte: effectiveStart, $lt: end };
  }

  if (day === 'tomorrow') {
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 2);
    return { $gte: start, $lt: end };
  }

  return { $gte: now };
};

const inRange = (departTime: Date, start?: Date, end?: Date) => {
  if (start && departTime < start) return false;
  if (end && departTime > end) return false;
  return true;
};

exports.findAll = async ({
  page,
  pageSize,
  day,
  startTime,
  endTime,
  ranges,
}: {
  page?: number;
  pageSize?: number;
  day?: string;
  startTime?: any;
  endTime?: any;
  ranges?: Array<{ startTime?: any; endTime?: any }>;
} = {}) => {
  const normalizedPage = Number.isFinite(page) && page! > 0 ? Math.floor(page!) : 1;
  const normalizedPageSize = Number.isFinite(pageSize) ? Math.floor(pageSize!) : -1;
  const departTimeRange = buildDateRangeByDay(day);
  const where = { departTime: departTimeRange };
  const sourceList = await repo().find({
    where,
    order: { departTime: 'ASC' },
  });

  const singleStart = normalizeTimestamp(startTime);
  const singleEnd = normalizeTimestamp(endTime);
  const normalizedRanges = Array.isArray(ranges)
    ? ranges
        .map((item) => ({
          start: normalizeTimestamp(item?.startTime),
          end: normalizeTimestamp(item?.endTime),
        }))
        .filter((item) => item.start || item.end)
    : [];

  let filteredList = sourceList;

  if (singleStart || singleEnd) {
    filteredList = filteredList.filter((item: any) => inRange(new Date(item.departTime), singleStart, singleEnd));
  }

  if (normalizedRanges.length > 0) {
    filteredList = filteredList.filter((item: any) => {
      const departTime = new Date(item.departTime);
      return normalizedRanges.some((range) => inRange(departTime, range.start, range.end));
    });
  }

  const total = filteredList.length;

  if (normalizedPageSize === -1) {
    return {
      list: filteredList,
      total,
      page: 1,
      pageSize: -1,
      totalPages: 1,
    };
  }

  if (normalizedPageSize <= 0) {
    throw new Error('pageSize must be a positive number or -1');
  }

  const skip = (normalizedPage - 1) * normalizedPageSize;
  const list = filteredList.slice(skip, skip + normalizedPageSize);

  return {
    list,
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalPages: Math.ceil(total / normalizedPageSize),
  };
};

exports.findById = async (id: string) => {
  const travel = await findOneByParamId(id);
  if (!travel) throw new Error('Travel not found');
  return travel;
};

exports.create = async (data: any) => {
  const duplicated = await repo().findOne({ where: { id: data.id } });
  if (duplicated) {
    throw new Error('Travel id already exists');
  }
  return repo().save(buildRecord(data));
};

exports.updateById = async (id: string, data: any) => {
  const travel = await findOneByParamId(id);
  if (!travel) throw new Error('Travel not found');

  const next = {
    ...travel,
    ...data,
    departTime: data.departTime !== undefined ? normalizeDepartTime(data.departTime) : travel.departTime,
    updatedAt: new Date(),
  };
  return repo().save(next);
};

exports.removeById = async (id: string) => {
  const travel = await findOneByParamId(id);
  if (!travel) throw new Error('Travel not found');
  await repo().deleteOne({ _id: travel._id });
  return { deleted: true };
};
