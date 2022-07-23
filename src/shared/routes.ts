import modules from './modules';

export default [
  {
    path: '/api/v1',
    children: [...modules],
  },
];
