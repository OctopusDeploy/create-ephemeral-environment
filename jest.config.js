module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    globals: {
        "ts-jest": {
            tsConfig: "<rootDir>/jest.tsconfig.json",
        },
    },
    projects: [
        {
            displayName: "test",
            transform: {
                ".(ts|js)": "ts-jest",
            },
            testRegex: "__tests__/.*\\.(test|spec)\\.(ts)$",
            moduleDirectories: ["<rootDir>/src/", "<rootDir>/node_modules"],
            moduleFileExtensions: ["ts", "js"],
            transformIgnorePatterns: [
                "node_modules/(?!(until-async|msw)/)"
            ],
            // setupFilesAfterEnv: ["jest-expect-message", "jest-extended"],
            resetMocks: true,
        },
    ],
};


// module.exports = {
//     preset: 'ts-jest',
//     testEnvironment: 'node',
//     collectCoverage: true,
//     collectCoverageFrom: [
//         'src/**/*.ts',
//         '!src/**/*.test.ts',
//         '!src/**/*.d.ts'
//     ],
//     coverageDirectory: 'coverage',
//     coverageReporters: ['text', 'lcov', 'html'],
//     testMatch: ['**/*.test.ts'],
//     moduleFileExtensions: ['ts', 'js', 'json'],
//     verbose: true,
//     reporters: [
//         'default',
//         ['jest-junit', {
//             outputDirectory: 'test-results',
//             outputName: 'jest-junit.xml',
//         }]
//     ]
// };
