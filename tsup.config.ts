import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/server.ts'],
    format: ['esm'],
    clean: true,
    sourcemap: true,
    bundle: true,
    splitting: false,
    keepNames: true,
    tsconfig: './tsconfig.json',
    external: [
        'mock-aws-s3',
        'aws-sdk',
        'nock',
        'node-pre-gyp',
        'kerberos',
        '@mongodb/js-ext',
        'snappy',
        'bson-ext',
        'express',
        'ioredis',
        'redis',
        'mongoose',
        'bcryptjs',
        'winston-loki',        // add this
        'winston-transport'
    ],
});