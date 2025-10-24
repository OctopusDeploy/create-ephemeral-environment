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
            testMatch: ['**/__tests__/**/*.(test|spec).ts', '**/*.test.ts'],
            moduleDirectories: ["<rootDir>/src/", "<rootDir>/node_modules"],
            moduleFileExtensions: ["ts", "js"],
            transformIgnorePatterns: [
                "node_modules/(?!(until-async|msw)/)"
            ],
            resetMocks: true,
        },
    ],
};
