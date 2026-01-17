import Conf from 'conf';

const config = new Conf({
  projectName: 'redep',
});

export const getConfig = (key) => {
  return config.get(key);
};

export const setConfig = (key, value) => {
  config.set(key, value);
};

export const clearConfig = () => {
  config.clear();
};

export const getAllConfig = () => {
  return config.store;
};
