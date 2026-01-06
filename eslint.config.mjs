import nextConfig from 'eslint-config-next';

const projectOverrides = {
  rules: {
    // place project specific rule customisations here if necessary
  }
};

export default [
  ...nextConfig,
  projectOverrides,
];
