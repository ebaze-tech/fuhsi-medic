
const isProduction = process.env.NODE_ENV === 'production';

export const log = (...args) => {
  if (!isProduction) {
    console.log(...args);
  }
};
