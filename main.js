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
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'cookie': 'JSESSIONID=755D751A95D11B633931152A644363CF; _ga=GA1.2.2100626361.1732007450; _gid=GA1.2.324244642.1732526985; JSESSIONID=FA28C96CAB3043BAC019A56AD8F7A5E9; auth_cookie=d77WZThLnms4P7LMn0cskKnk2336bc64d52e25',
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'referer': 'https://www.wavemakeronline.com/studio/project-native-mobile.html?project-id=WMPRJ2c91808992f49b7f0192f5902ed30055',
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest',
                    'x-wm-platform-version': '11.9.2'
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

    async generateTestCases(testCases, markup, script, testUrl) {
        const generatorPrompt = `Write comprehensive Puppeteer test cases for WaveMaker React application with ABSOLUTE ENFORCEMENT of global configuration and widget interaction guidelines:

        APPLICATION CONFIGURATION:
        - PUPPETEER Page GO TO URL: ${testUrl}
        - Markup Configuration: ${markup}
        - Script Context: ${script}
        - STRICT REFERENCE ONLY WRITE TEST CASES MENTIONED HERE : ${testCases}
        
        STRICT IMPLEMENTATION REQUIREMENTS:
        0. IMPORT VERIFICATION: MANDATORY IMPORT STRUCTURE
        \`\`\`javascript
        import puppeteer from 'puppeteer';
        import { expect } from '@playwright/test';  // ONLY expect from here
        
        // Additional Puppeteer-specific utilities can be imported here
        \`\`\`

        CRITICAL IMPORT GUIDELINES:
        - GO TO PAGE ${testUrl} AND THEN WAIT FOR PAGE TO LOAD
        - EXCLUSIVE Puppeteer for browser automation
        - ONLY expect assertion from @playwright/test
        - ALL other dependencies must be Puppeteer-compatible
        - NO mixing of testing frameworks
        - ALWAYS MANDATORY TO USE Markup Configuration and Script Context for Writing test assertions and PASSING RELEVANT VALUES to TEST CASES
        - STRICTLY DO NOT WRITE TEST CASE for \`Page.onReady\`
        - STRICTLY DO NOT WRITE \`throw\`
        - EACH expect assertion should be wrapped in try-catch block
        - Maintain clean, modular ES6 module imports


        1. EVALUATION AND ACCESS PROTOCOL:
           - MANDATORY: ALL widget properties and events MUST be accessed via page.evaluate()
           - ALWAYS return the expression inside page.evaluate()
           - STRICT widget access pattern: 
             \`wm.App.appConfig.currentPage.Widgets.<widgetName>\`
           - STRICT widget value access pattern:
             \`wm.App.appConfig.currentPage.Widgets.<widgetName>.datavalue\`
           - STRICT widget caption access pattern:
             \`wm.App.appConfig.currentPage.Widgets.<widgetName>.caption\`
        
        
           CORRECT EXAMPLE:
           \`\`\`javascript
           const buttonCaption = await page.evaluate(() => {
             return wm.App.appConfig.currentPage.Widgets.button1.caption;
           });
            try{
            expect(buttonCaption).toBe('Expected Caption');
            }catch(e){
            console.error("Button caption assertion failed");
            }
           
           \`\`\`
        
        2. EVENT HANDLING TRANSFORMATION:
           - MANDATORY Transform markup event props to corresponding method calls
           - Examples:
             * on-tap="button1Tap($event, widget)" → onTap()
             * on-change="text32Change($event, widget, newVal, oldVal)" → onChange(null, null, 'newval', 'oldval')
        
           STRICT EVENT INVOCATION:
           \`\`\`javascript
           await page.evaluate(() => {
             // Direct widget method call
             wm.App.appConfig.currentPage.Widgets.button1.onTap();
           });
           \`\`\`
        
        3. CONFIGURATION VERIFICATION:
           - STRICT IMPLEMENTATION FOR PAGE WAIT
           - STRICT DO NOT USE \`page.waitForSelector\` only Implement BELOW comprehensive global configuration wait
           \`await page.waitForFunction(() => 
             typeof wm.App !== 'undefined' && 
             typeof wm.App.appConfig !== 'undefined' && 
             wm.App.appConfig.currentPage
           )\` 
        
        4. WIDGET INTERACTION STRATEGY:
           - ZERO direct Puppeteer element interactions
           - ALL interactions through widget methods
           - ALWAYS use separate try-catch blocks for EACH expect assertion
           - ENFORCE individual error handling for every expectation
        
        5. EXPECT ASSERTIONS:
        COMPREHENSIVE ASSERTION PATTERN:
        \`\`\`javascript
        const widgetText = await page.evaluate(() => {
            return wm.App.appConfig.currentPage.Widgets.textWidget.text;
        });
        try {
            expect(widgetText).toBe('Expected Text');
        } catch(e) {
            console.error('Text Widget Assertion Failed:', e.message);
        }
        \`\`\`
        - ALWAYS use try-catch block
        - Provide meaningful error logging

        
        TESTING OBJECTIVES:
        - Validate widget configurations
        - Verify event handling mechanisms
        - Ensure robust global configuration access
        - Comprehensive browser script testing`;

        const generatorSystem = `You are an ULTRA-STRICT test automation engineer specializing in WaveMaker React application testing.

        ABSOLUTE ENFORCEMENT GUIDELINES:
        
        1. GLOBAL CONFIGURATION ACCESS:
           - MANDATORY page.evaluate() for ALL widget interactions
           - ALWAYS return the evaluated expression
           - ALWAYS MANDATORY TO USE Markup Configuration and Script Context for Writing test assertions and PASSING RELEVANT VALUES to TEST CASES
           - REJECT any direct element manipulation
           - ENFORCE \`wm.App.appConfig.currentPage.Widgets\` access pattern
        
        2. EVENT HANDLING:
           - Transform markup events to direct widget method calls
           - Use \`onTap()\`, \`onChange()\` instead of event objects
           - Execute ALL events through browser script
        
        3. IMPORT AND MODULE REQUIREMENTS:
            - MANDATORY use of ES6 module imports
            - EXPLICITLY verify all required dependencies
            - REJECT any CommonJS 'require()' statements
        
        4. ERROR HANDLING:
           - Provide granular, meaningful error logs
           - Create fallback mechanisms for configuration loading

        5. ASSERTION PROTOCOL:
           - EVERY expect MUST have its own try-catch block
           - PROVIDE unique error context for each assertion
           - TRACK both value changes and event callbacks
        
        TESTING PHILOSOPHY:
        - Zero tolerance for implementation deviations
        - STRICT USAGE OF TRY-CATCH FOR EVERY SINGLE \`expect\`
        - Absolute global configuration reliability
        - Comprehensive, browser-script-centric testing`;
        

        const testCaseGeneration = await this.ollama.generate({
            model: generatorModel,
            prompt: generatorPrompt,
            system: generatorSystem,
            options: { temperature: 0 }
        });

        return testCaseGeneration.response;
    }

    async reviewTestCases(generatedTestCases, referenceTestCases, markup, script, testUrl) {
        const reviewerPrompt = `CRITICAL REVIEW CHECKLIST for Puppeteer test cases:
        Page URL: ${testUrl}
        Reference Test Cases:
        ${referenceTestCases}
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
        
        REFACTORING MANDATE:
        - ABSOLUTE compliance with WaveMaker testing guidelines
        - ZERO deviation from specified implementation
        - ALWAYS MANDATORY TO USE Markup Configuration and Script Context for Writing test assertions and PASSING RELEVANT VALUES to TEST CASES
        - PRODUCTION-READY, BULLETPROOF test scripts
        - NO EXPLANATIONS, ONLY PRODUCTION-READY CODE`;

        const reviewResults = await this.ollama.generate({
            model: reviewerModel,
            prompt: reviewerPrompt,
            system: reviewerSystem,
            options: { temperature: 0 }
        });

        return reviewResults.response;
    }

    async runMultiAgentTestGeneration(projectConfigUrl, testUrl) {
        try {
            // Fetch project configuration
            const { markup, script } = await this.fetchProjectConfig(projectConfigUrl);

            fs.writeFileSync('init_test_cases.js', JSON.stringify({markup, script}));

            const output = await this.ollama.generate({
                model: reviewerModel,
                prompt: "Write Test cases for the following Script code by using Markup code as context \n Markup:" + markup + "\nScript:" + script,
                system: `You are a tester who explains how to write test cases. Your task is to:  
                    1. **Evaluate Functions:** Explain how to identify and test the functionality of the provided callbacks and scripts.  
                    2. **Expected Values:** Provide detailed instructions on determining expected values based on the provided markup and scripts. 

                    **Mandatory Rules:**  
                    - DO NOT EXPLAIN HOW TO WRITE OR SPECIFY ANY CODE OR FUNCTION TO BE CALLED. NO EXPRESSIONS. JUST FUNCTION NAME AND WHAT SHOULD BE TESTED.
                    Your response should only include a step-by-step explanation of how to write the test cases, evaluate functions, and determine expected values. Avoid writing code directly as part of your response.  
                    `,
                options: { temperature: 0 },
            });

            const testCases = output.response;

            console.log("INITIAL TEST CASES:", testCases);

            // Generate initial test cases
            console.log("🤖 Generating Test Cases...");
            let generatedTestCases = await this.generateTestCases(testCases, markup, script, testUrl);

            // Save initial test cases
            fs.writeFileSync('init_test_cases.js', generatedTestCases);

            console.log("🕵️ Reviewing Test Cases...");
            generatedTestCases = await this.reviewTestCases(generatedTestCases, testCases, markup, script, testUrl);
            generatedTestCases = generatedTestCases.replace('```javascript','').replace('```','');
            // Save results
            fs.writeFileSync('test_cases.js', generatedTestCases);

            console.log("✅ Test Case Generation Complete!");
            console.log("📄 Results saved in test_cases.js");

            return generatedTestCases;

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
        'http://localhost:19009/rn-bundle/index.html#/Main'
    );
    console.log(finalTestCases);
}

main().catch(console.error);

export default MultiAgentTestGenerator;