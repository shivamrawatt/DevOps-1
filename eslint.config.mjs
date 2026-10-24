
import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', 'coverage/**'],
    },
    {
        files: ['**/*.js', '**/*.cjs'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
];