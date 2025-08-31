"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    overwrite: true,
    schema: '../graphql-schema/**/*.graphql',
    generates: {
        'src/__generated__/types.ts': {
            plugins: ['typescript'],
        },
    },
};
exports.default = config;
//# sourceMappingURL=codegen.js.map