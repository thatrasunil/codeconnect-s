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
        const engine = process.env.EXECUTION_ENGINE || 'django'; // Default to internal django for reliability
        const executionUrl = process.env.EXECUTION_URL;

        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
                const startTime = Date.now();
                const fullCode = this.prepareCode(code, testCase.input, language, functionName);

                let resultData;
                if (engine === 'judge0') {
                    resultData = await this.executeWithJudge0(fullCode, language, testCase.input, executionUrl);
                } else if (engine === 'django') {
                    resultData = await this.executeWithDjango(fullCode, language, testCase.input);
                } else {
                    // Fallback to Piston (might be restricted)
                    resultData = await this.executeWithPiston(fullCode, language, testCase.input);
                }

                const executionTime = Date.now() - startTime;
                const expected = (testCase.expectedOutput || '').trim();
                const actual = (resultData.stdout || '').trim();

                results.push({
                    testId: i + 1,
                    passed: actual === expected && !resultData.stderr,
                    input: testCase.input,
                    expectedOutput: expected,
                    actualOutput: actual,
                    error: resultData.stderr || resultData.compile_output || null,
                    executionTime: `${resultData.time || executionTime}ms`,
                    memory: resultData.memory || 'N/A',
                    hidden: testCase.hidden || false
                });
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

    static async executeWithPiston(code, language, input) {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language,
                version: '*',
                files: [{ content: code }],
                stdin: input || ''
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Piston execution failed');
        return {
            stdout: data.run.stdout,
            stderr: data.run.stderr,
            memory: data.run.memory
        };
    }

    static async executeWithDjango(code, language, input) {
        // Assume backend_django is reachable via internal or configured URL
        const djangoUrl = process.env.DJANGO_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${djangoUrl}/api/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, input })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Django execution failed');

        // Django ExecuteCodeView returns results array, we just need the first one if single run
        // but here we call it per test case for compatibility with existing loop
        const result = data.results[0];
        return {
            stdout: result.actual,
            stderr: result.error,
            time: result.runtime
        };
    }

    static async executeWithJudge0(code, language, input, url) {
        const judge0Url = url || 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
        const languageMap = { 'javascript': 63, 'python': 71, 'c': 50, 'cpp': 54, 'java': 62 };

        const response = await fetch(judge0Url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageMap[language] || 63,
                stdin: input || ''
            })
        });
        const data = await response.json();
        return {
            stdout: data.stdout,
            stderr: data.stderr,
            compile_output: data.compile_output,
            time: data.time,
            memory: data.memory
        };
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
