const formatVND = (value?: number | string) => {
  const MAX = 100_000_000;

  if (!value) return '0 đ';

  let num = typeof value === 'string'
    ? Number(value.replace(/[^\d]/g, ''))
    : value;

  if (isNaN(num)) return '0 đ';

  if (num > MAX) num = MAX;

  return num.toLocaleString('vi-VN') + ' đ';
};

export default formatVND;
