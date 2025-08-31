import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../graphql-schema/**/*.graphql',
  generates: {
    'src/__generated__/types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
