export const parseNumberArray = (val) => {
  if (typeof val === 'string') {
    return val.split(',').map(Number).filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.map(Number).filter(Boolean);
  }
  return [];
};

export const parseStringArray = (val) => {
  if (typeof val === 'string') {
    return val.split(',').filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  return [];
};
