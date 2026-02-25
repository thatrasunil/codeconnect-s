// Test Execution Service
// Executes code against test cases using Piston API

class TestExecutor {
    /**
     * Validate and clean test cases
     */
    static validateAndCleanTestCases(testCases) {
        if (!Array.isArray(testCases) || testCases.length === 0) {
            throw new Error('testCases must be a non-empty array');
        }

        return testCases.map((tc, index) => {
            if (typeof tc !== 'object' || tc === null) {
                throw new Error(`Test case ${index} is not a valid object`);
            }
            if (!tc.hasOwnProperty('input')) {
                throw new Error(`Test case ${index} missing 'input' field`);
            }
            if (!tc.hasOwnProperty('expectedOutput')) {
                throw new Error(`Test case ${index} missing 'expectedOutput' field`);
            }

            return {
                input: tc.input,
                expectedOutput: String(tc.expectedOutput).trim(),
                hidden: tc.hidden || false
            };
        });
    }

    /**
     * Execute code against multiple test cases
     * @param {string} code - User's code
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of test case objects
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Object>} Test results
     */
    static async executeCode(code, language, testCases, functionName = null, timeout = 5000) {
        // Validate test cases before execution
        try {
            const cleanedTestCases = this.validateAndCleanTestCases(testCases);
            testCases = cleanedTestCases;
        } catch (validationError) {
            console.error('Test case validation failed:', validationError.message);
            throw validationError;
        }

        const engine = process.env.EXECUTION_ENGINE || 'django'; // Default to internal django for reliability
        const executionUrl = process.env.EXECUTION_URL;
        
        // Validate and normalize engine
        const normalizedEngine = (engine || 'django').toLowerCase();
        if (!['django', 'judge0'].includes(normalizedEngine)) {
            throw new Error('Invalid EXECUTION_ENGINE: ' + engine + '. Supported engines: django, judge0');
        }
        
        console.log('[CodeExecution] Engine: ' + normalizedEngine + ', URL: ' + (executionUrl || 'default'));

        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            let resultData = null;
            let executionError = null;

            try {
                const startTime = Date.now();
                const fullCode = this.prepareCode(code, testCase.input, language, functionName);

                try {
                    if (normalizedEngine === 'judge0') {
                        resultData = await this.executeWithJudge0(fullCode, language, testCase.input, executionUrl);
                    } else if (normalizedEngine === 'django') {
                        resultData = await this.executeWithDjango(fullCode, language, testCase.input, testCase);
                    } else {
                        throw new Error('Unsupported execution engine: ' + normalizedEngine + '. Supported engines: django, judge0');
                    }
                } catch (execError) {
                    console.error('Execution engine error:', execError.message);
                    executionError = execError;
                    resultData = { stdout: '', stderr: execError.message, compile_output: null };
                }

                const executionTime = Date.now() - startTime;
                const expected = testCase.expectedOutput;
                const actual = (resultData.stdout || '').trim();
                const hasError = resultData.stderr || resultData.compile_output;

                results.push({
                    testId: i + 1,
                    passed: actual === expected && !hasError,
                    input: JSON.stringify(testCase.input),
                    expectedOutput: expected,
                    actualOutput: actual,
                    error: hasError || null,
                    executionTime: `${resultData.time || executionTime}ms`,
                    memory: resultData.memory || 'N/A',
                    hidden: testCase.hidden || false
                });
            } catch (error) {
                console.error(`Test case ${i + 1} execution error:`, error);
                results.push({
                    testId: i + 1,
                    passed: false,
                    input: JSON.stringify(testCase.input),
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: '',
                    error: error.message || 'Unexpected execution error',
                    executionTime: '0ms',
                    memory: 'N/A',
                    hidden: testCase.hidden || false
                });
            }
        }

        return results;
    }

    static async executeWithPiston(code, language, input) {
        // Piston API is no longer supported due to authentication issues
        throw new Error('Piston execution engine has been deprecated. Please use Django or Judge0 instead.');
    }

    static async executeWithDjango(code, language, input, testCase = null) {
        const djangoUrl = process.env.DJANGO_BACKEND_URL || 'http://localhost:8000';
        
        // Normalize language for Django backend
        const langMap = {
            'python3': 'python',
            'python': 'python',
            'javascript': 'javascript',
            'js': 'javascript',
            'c': 'c',
            'cpp': 'cpp',
            'java': 'java'
        };
        
        const normalizedLanguage = langMap[language] || language;
        
        console.log('[Django] Executing ' + normalizedLanguage + ' code at ' + djangoUrl + '/api/execute');
        
        try {
            // Format test case for Django API
            const testCases = testCase ? [{
                input: testCase.input,
                expected: testCase.expectedOutput
            }] : [];
            
            const response = await fetch(djangoUrl + '/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code, 
                    language: normalizedLanguage, 
                    testCases: testCases
                }),
                timeout: 15000
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Response is not JSON
                }
                
                const errorMsg = errorData.error || errorData.message || ('Django API returned ' + response.status + ': ' + response.statusText);
                console.error('[Django] Error: ' + errorMsg);
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
                throw new Error('Invalid response format from Django API: no results');
            }

            const result = data.results[0];
            console.log('[Django] Success - ' + (result.actual ? result.actual.length : 0) + ' chars output');
            
            return {
                stdout: result.actual || '',
                stderr: result.error || '',
                time: result.runtime || '0ms',
                compile_output: null
            };
        } catch (error) {
            console.error('[Django] Execution failed:', error.message);
            throw new Error('Django execution failed: ' + error.message);
        }
    }

    static async executeWithJudge0(code, language, input, url) {
        const judge0Url = url || 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
        const languageMap = { 'javascript': 63, 'python': 71, 'c': 50, 'cpp': 54, 'java': 62 };
        
        if (!process.env.RAPIDAPI_KEY) {
            throw new Error('Judge0 requires RAPIDAPI_KEY environment variable');
        }

        console.log('[Judge0] Executing ' + language + ' code');

        try {
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

            if (!response.ok) {
                throw new Error('Judge0 API returned ' + response.status + ': ' + response.statusText);
            }
            
            const data = await response.json();
            console.log('[Judge0] Success');
            
            return {
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                compile_output: data.compile_output || null,
                time: data.time || '0ms',
                memory: data.memory || 'N/A'
            };
        } catch (error) {
            console.error('[Judge0] Execution failed:', error.message);
            throw new Error('Judge0 execution failed: ' + error.message);
        }
    }

    /**
     * Prepare code with test case input
     * Handles multiple input types and generates proper driver code
     */
    static prepareCode(code, input, language, functionName) {
        // Helper to serialize values for code insertion
        const serializeValue = (val) => {
            if (typeof val === 'string') {
                return JSON.stringify(val);
            } else if (Array.isArray(val)) {
                return `[${val.map(v => serializeValue(v)).join(', ')}]`;
            } else if (val === null) {
                return 'null';
            } else if (val === undefined) {
                return 'undefined';
            } else if (typeof val === 'object') {
                try {
                    return JSON.stringify(val);
                } catch (e) {
                    return 'null';
                }
            } else {
                return String(val);
            }
        };

        // If functionName provided, wrap it with a driver
        if (functionName) {
            if (language === 'javascript') {
                // Handle array inputs properly for JS
                let formattedInput;
                if (Array.isArray(input)) {
                    // Multiple arguments
                    formattedInput = input.map(arg => serializeValue(arg)).join(', ');
                } else {
                    // Single argument
                    formattedInput = serializeValue(input);
                }

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
                // Python driver
                let formattedInput;
                if (Array.isArray(input)) {
                    // Multiple arguments
                    formattedInput = input.map(arg => serializeValue(arg)).join(', ');
                } else {
                    // Single argument
                    formattedInput = serializeValue(input);
                }

                return `
import json
import sys

${code}

# Driver Code
try:
    result = ${functionName}(${formattedInput})
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
            if (!testCases || testCases.length === 0) {
                throw new Error('No test cases provided for validation');
            }

            const results = await this.executeCode(code, language, testCases, functionName);

            const passedTests = results.filter(r => r.passed).length;
            const totalTests = results.length;
            const allPassed = passedTests === totalTests && totalTests > 0;

            // Calculate total execution time
            const totalTime = results.reduce((sum, r) => {
                const timeStr = r.executionTime || '0ms';
                const time = parseInt(timeStr) || 0;
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
            console.error('Solution validation error:', error);
            return {
                error: error.message,
                allPassed: false,
                totalTests: testCases ? testCases.length : 0,
                passedTests: 0,
                failedTests: testCases ? testCases.length : 0,
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
