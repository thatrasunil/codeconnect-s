// Test Execution Service
// Executes code against test cases using Piston API

class TestExecutor {
    /**
     * Execute code against multiple test cases
     * @param {string} code - User's code
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of test case objects
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Object>} Test results
     */
    static async executeCode(code, language, testCases, functionName = null, timeout = 5000) {
        const languageMap = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'go': 'go',
            'rust': 'rust',
            'typescript': 'typescript'
        };

        const pistonLang = languageMap[language] || language;
        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            try {
                const startTime = Date.now();

                // Prepare code with test case input
                const fullCode = this.prepareCode(code, testCase.input, language, functionName);

                const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        language: pistonLang,
                        version: '*',
                        files: [
                            {
                                content: fullCode
                            }
                        ],
                        stdin: testCase.input || ''
                    })
                });

                const data = await response.json();
                const executionTime = Date.now() - startTime;

                if (response.ok) {
                    const output = (data.run.stdout || '').trim();
                    const error = (data.run.stderr || '').trim();
                    const expected = testCase.expectedOutput.trim();

                    results.push({
                        testId: i + 1,
                        passed: output === expected && !error,
                        input: testCase.input,
                        expectedOutput: expected,
                        actualOutput: output,
                        error: error || null,
                        executionTime: `${executionTime}ms`,
                        memory: data.run.memory || 'N/A',
                        hidden: testCase.hidden || false
                    });
                } else {
                    results.push({
                        testId: i + 1,
                        passed: false,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: '',
                        error: data.message || 'Execution failed',
                        executionTime: `${executionTime}ms`,
                        memory: 'N/A',
                        hidden: testCase.hidden || false
                    });
                }
            } catch (error) {
                results.push({
                    testId: i + 1,
                    passed: false,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: '',
                    error: error.message || 'Execution error',
                    executionTime: '0ms',
                    memory: 'N/A',
                    hidden: testCase.hidden || false
                });
            }
        }

        return results;
    }

    /**
     * Prepare code with test case input
     */
    /**
     * Prepare code with test case input
     */
    static prepareCode(code, input, language, functionName) {
        // If functionName provided, wrap it with a driver
        if (functionName) {
            if (language === 'javascript') {
                // Handle array inputs properly for JS
                const formattedInput = Array.isArray(input) ? input.map(arg => JSON.stringify(arg)).join(', ') : JSON.stringify(input);
                // Note: user input structure in testCases is array of args usually: [arg1, arg2]

                return `
${code}

// Driver Code
try {
    const result = ${functionName}(${formattedInput});
    console.log(JSON.stringify(result));
} catch (e) {
    console.error(e.message);
}
`;
            } else if (language === 'python') {
                // Simple Python driver
                let args = input;
                if (Array.isArray(input)) {
                    args = input.map(arg => JSON.stringify(arg)).join(', ');
                } else {
                    args = JSON.stringify(input);
                }

                return `
import json
import sys

${code}

# Driver Code
try:
    result = ${functionName}(${args})
    print(json.dumps(result))
except Exception as e:
    print(str(e), file=sys.stderr)
`;
            }
        }

        // Default: return code as-is (requires user to write print statements)
        return code;
    }

    /**
     * Validate solution by running all test cases
     * @param {string} code - User's code
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of test case objects
     * @returns {Promise<Object>} Validation results
     */
    static async validateSolution(code, language, testCases, functionName = null) {
        try {
            const results = await this.executeCode(code, language, testCases, functionName);

            const passedTests = results.filter(r => r.passed).length;
            const totalTests = results.length;
            const allPassed = passedTests === totalTests;

            // Calculate total execution time
            const totalTime = results.reduce((sum, r) => {
                const time = parseInt(r.executionTime) || 0;
                return sum + time;
            }, 0);

            return {
                allPassed,
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                cases: results,
                executionTime: `${totalTime}ms`,
                memoryUsage: this.calculateMaxMemory(results)
            };
        } catch (error) {
            return {
                error: error.message,
                allPassed: false,
                totalTests: testCases.length,
                passedTests: 0,
                failedTests: testCases.length,
                cases: []
            };
        }
    }

    /**
     * Calculate maximum memory usage from results
     */
    static calculateMaxMemory(results) {
        const memoryValues = results
            .map(r => r.memory)
            .filter(m => m !== 'N/A' && typeof m === 'number');

        if (memoryValues.length === 0) return 'N/A';

        const maxMemory = Math.max(...memoryValues);
        return `${maxMemory}MB`;
    }
}

module.exports = TestExecutor;
