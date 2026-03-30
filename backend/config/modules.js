const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeBooleanNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value) ? 1 : 0;
};

const validateRequired = (payload, fields) =>
  fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

const modules = {
  admins: {
    table: 'admin',
    select: `
      a.id,
      a.name,
      a.password,
      a.type,
      a.status,
      a.email,
      DATE_FORMAT(a.date, '%Y-%m-%d %H:%i:%s') AS date
    `,
    from: 'admin a',
    idExpression: 'a.id',
    orderBy: 'a.id',
    searchColumns: ['a.name', 'a.email'],
    allowedFields: ['name', 'password', 'type', 'status', 'email', 'date'],
    preparePayload(body) {
      return {
        name: normalizeString(body.name),
        password: normalizeString(body.password),
        type: normalizeString(body.type) || 'manager',
        status: normalizeString(body.status) || 'active',
        email: normalizeString(body.email),
        date: normalizeString(body.date),
      };
    },
    validate(payload) {
      return validateRequired(payload, ['name', 'password', 'type', 'status', 'email']);
    },
  },
  users: {
    table: 'user',
    select: `
      u.id,
      u.name,
      u.mobile,
      u.password,
      u.file,
      u.about,
      u.status,
      u.email,
      DATE_FORMAT(u.date, '%Y-%m-%d %H:%i:%s') AS date,
      u.is_parlour
    `,
    from: 'user u',
    idExpression: 'u.id',
    orderBy: 'u.id',
    searchColumns: ['u.name', 'u.email', 'u.mobile'],
    allowedFields: ['name', 'mobile', 'password', 'file', 'about', 'status', 'email', 'date', 'is_parlour'],
    preparePayload(body) {
      return {
        name: normalizeString(body.name),
        mobile: normalizeString(body.mobile),
        password: normalizeString(body.password),
        file: normalizeString(body.file),
        about: normalizeString(body.about),
        status: normalizeString(body.status) || 'active',
        email: normalizeString(body.email),
        date: normalizeString(body.date),
        is_parlour: normalizeBooleanNumber(body.is_parlour),
      };
    },
    validate(payload) {
      return validateRequired(payload, ['name', 'mobile', 'password', 'status', 'email']);
    },
  },
  categories: {
    table: 'categories',
    select: `
      c.id,
      c.title,
      c.created_by,
      a.name AS created_by_name,
      DATE_FORMAT(c.date, '%Y-%m-%d %H:%i:%s') AS date,
      c.status
    `,
    from: 'categories c LEFT JOIN admin a ON a.id = c.created_by',
    idExpression: 'c.id',
    orderBy: 'c.id',
    searchColumns: ['c.title', 'a.name'],
    allowedFields: ['title', 'created_by', 'date', 'status'],
    preparePayload(body) {
      return {
        title: normalizeString(body.title),
        created_by: normalizeNumber(body.created_by),
        date: normalizeString(body.date),
        status: normalizeString(body.status) || 'active',
      };
    },
    validate(payload) {
      return validateRequired(payload, ['title', 'created_by', 'status']);
    },
  },
  services: {
    table: 'services',
    select: `
      s.id,
      s.title,
      s.service_type,
      c.title AS category_title,
      s.mobile,
      s.address,
      s.price,
      s.status,
      DATE_FORMAT(s.date, '%Y-%m-%d %H:%i:%s') AS date,
      s.created_by,
      u.name AS created_by_name,
      s.file,
      s.detail
    `,
    from: 'services s LEFT JOIN categories c ON c.id = s.service_type LEFT JOIN user u ON u.id = s.created_by',
    idExpression: 's.id',
    orderBy: 's.id',
    searchColumns: ['s.title', 's.detail', 's.address'],
    allowedFields: ['title', 'service_type', 'mobile', 'address', 'price', 'status', 'date', 'created_by', 'file', 'detail'],
    preparePayload(body) {
      return {
        title: normalizeString(body.title),
        service_type: normalizeNumber(body.service_type),
        mobile: normalizeString(body.mobile),
        address: normalizeString(body.address),
        price: normalizeNumber(body.price),
        status: normalizeString(body.status) || 'active',
        date: normalizeString(body.date),
        created_by: normalizeNumber(body.created_by),
        file: normalizeString(body.file),
        detail: normalizeString(body.detail),
      };
    },
    validate(payload) {
      return validateRequired(payload, ['title', 'service_type', 'mobile', 'address', 'price', 'status', 'created_by']);
    },
  },
  settings: {
    table: 'settings',
    select: `
      s.id,
      s.site_title,
      s.meta_title,
      s.meta_tags,
      s.meta_desc,
      DATE_FORMAT(s.date, '%Y-%m-%d %H:%i:%s') AS date,
      s.logo
    `,
    from: 'settings s',
    idExpression: 's.id',
    orderBy: 's.id',
    searchColumns: ['s.site_title', 's.meta_title'],
    allowedFields: ['site_title', 'meta_title', 'meta_tags', 'meta_desc', 'date', 'logo'],
    preparePayload(body) {
      return {
        site_title: normalizeString(body.site_title),
        meta_title: normalizeString(body.meta_title),
        meta_tags: normalizeString(body.meta_tags),
        meta_desc: normalizeString(body.meta_desc),
        date: normalizeString(body.date),
        logo: normalizeString(body.logo),
      };
    },
    validate(payload) {
      return validateRequired(payload, ['site_title', 'meta_title']);
    },
  },
};

module.exports = {
  modules,
  normalizeNumber,
  normalizeString,
  normalizeBooleanNumber,
  validateRequired,
};
