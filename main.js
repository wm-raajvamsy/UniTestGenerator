import { Ollama } from "ollama";
import fetch from "node-fetch";
import request from "request";
import fs from 'fs';

const host = "http://localhost:11434";
const generatorModel = "qwen2.5-coder:7b-instruct";
const reviewerModel = "qwen2.5-coder:7b-instruct";

class MultiAgentTestGenerator {
    constructor() {
        this.ollama = new Ollama({ host, fetch });
    }

    async fetchProjectConfig(url) {
        return new Promise((resolve, reject) => {
            const options = {
                'method': 'GET',
                'url': url,
                'headers': {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'cookie': '_ga=GA1.2.2100626361.1732007450; _gid=GA1.2.324244642.1732526985; auth_cookie=DG5n9hPtF1SDBKLrv266Ht902336bc64d52d22',
                    'pragma': 'no-cache',
                    'priority': 'u=0, i',
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                  }
            };

            request(options, (error, response) => {
                if (error) reject(error);
                try {
                    const jsonBody = JSON.parse(response.body);
                    resolve({
                        markup: decodeURIComponent(jsonBody.Markup),
                        script: decodeURIComponent(jsonBody.script)
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }

    async generateTestCases(markup, script, testUrl) {
        const generatorPrompt = `Write comprehensive Puppeteer test cases for the web application with the following context:
        Markup: ${markup}
        Script: ${script}
        Test URL: ${testUrl}
        
        CRITICAL REQUIREMENTS:
        1. USE ES6 IMPORT STATEMENTS for Puppeteer and all dependencies
           - Correct: import puppeteer from 'puppeteer';
           - INCORRECT: const puppeteer = require('puppeteer');
        
        2. Selector Strategy for Elements:
           - Always use **class** selectors for element identification, ensuring they are unique and properly scoped
           - If using class or name attributes, ensure EXACT match
           - AVOID using #{name} if no corresponding ID exists
        
        3. Create a complete Puppeteer test script that can be run directly
        4. Include tests for key interactions and validations
        5. Use the provided URL as the base for testing
        6. Implement robust error handling
        7. Add meaningful console logs for test results`;

        const generatorSystem = `You are an expert test automation engineer specializing in writing comprehensive Puppeteer test scripts. 

        STRICT GUIDELINES:
        - MANDATE ES6 module syntax with import statements
        - Implement precise, robust element selection strategies
        - Ensure NO hardcoded selectors that don't match actual markup
        - Focus on creating resilient, maintainable test scripts`;

        const testCaseGeneration = await this.ollama.generate({
            model: generatorModel,
            prompt: generatorPrompt,
            system: generatorSystem,
            options: { temperature: 0.2 }
        });

        return testCaseGeneration.response;
    }

    async reviewTestCases(generatedTestCases, markup, script, testUrl) {
        const reviewerPrompt = `CRITICAL REVIEW CHECKLIST for Puppeteer test cases:

        Generated Test Cases:
        ${generatedTestCases}
        
        MANDATORY VERIFICATION POINTS:
        1. IMPORT STATEMENTS Audit:
           - Confirm ALL imports use ES6 module syntax
           - REJECT any require() statements
           - Ensure proper import of Puppeteer and all dependencies
        
        2. SELECTOR VERIFICATION:
           - Inspect ALL element selectors for accuracy
           - REJECT selectors that don't match actual markup
           - Always use **class** selectors for element identification, ensuring they are unique and properly scoped
        
        3. Element Interaction Validation:
           - Verify selectors work with actual page structure
           - Check for robust element location strategies
           - Ensure fallback mechanisms for element selection
        
        4. Comprehensive Error Handling Review:
           - Validate try/catch blocks
           - Check for meaningful error logging
           - Ensure graceful test failure mechanisms
        
        INSTRUCTIONS:
        - Provide a FULLY CORRECTED test script
        - Address ALL identified issues
        - Maintain original test coverage intent
        - NO COMMENTS, ONLY EXECUTABLE CODE`;

        const reviewerSystem = `You are a senior test automation architect with ZERO TOLERANCE for:
        - Incorrect import strategies
        - Imprecise element selectors
        - Fragile test implementations
        
        Your role is to RUTHLESSLY REFACTOR test scripts to meet highest quality standards:
        - ENFORCE ES6 module syntax
        - MANDATE precise element selection
        - GUARANTEE test script reliability
        - NO EXPLANATIONS, ONLY PRODUCTION-READY CODE`;

        const reviewResults = await this.ollama.generate({
            model: reviewerModel,
            prompt: reviewerPrompt,
            system: reviewerSystem,
            options: { temperature: 0.3 }
        });

        return reviewResults.response;
    }

    async runMultiAgentTestGeneration(projectConfigUrl, testUrl) {
        try {
            // Fetch project configuration
            const { markup, script } = await this.fetchProjectConfig(projectConfigUrl);

            fs.writeFileSync('init_test_cases.js', JSON.stringify({markup, script}));


            // Generate initial test cases
            console.log("🤖 Generating Test Cases...");
            const generatedTestCases = await this.generateTestCases(markup, script, testUrl);

            // Save initial test cases
            fs.writeFileSync('init_test_cases.js', generatedTestCases);

            // Review and refine test cases
            console.log("🕵️ Reviewing Test Cases...");
            const finalTestCases = await this.reviewTestCases(generatedTestCases, markup, script, testUrl);

            // Save results
            fs.writeFileSync('test_cases.js', finalTestCases.replace('```javascript','').replace('```',''));

            console.log("✅ Test Case Generation Complete!");
            console.log("📄 Results saved in test_cases.js");

            return finalTestCases;

        } catch (error) {
            console.error("❌ Error in multi-agent test generation:", error);
            throw error;
        }
    }
}

// Usage Example
async function main() {
    const testGenerator = new MultiAgentTestGenerator();
    const finalTestCases = await testGenerator.runMultiAgentTestGeneration(
        'https://www.wavemakeronline.com/studio/services/projects/WMPRJ2c91808992f49b7f0192f5902ed30055/pages/Main/page.min.json',
        'https://www.wavemakeronline.com/run-ngnfytn5tb/testRN_master/rn-bundle/#/Main'
    );
    console.log(finalTestCases);
}

main().catch(console.error);

export default MultiAgentTestGenerator;