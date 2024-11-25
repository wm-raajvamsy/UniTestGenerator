import { Ollama } from "ollama";
import fetch from "node-fetch"
import request from "request";
const host = "http://localhost:11434";
const model = "qwen2.5-coder:7b-instruct"

var options = {
  'method': 'GET',
  'url': 'https://www.wavemakeronline.com/studio/services/projects/WMPRJ2c91808992f49b7f0192f5902ed30055/pages/Main/page.min.json',
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
request(options, async function (error, response) {
    if (error) throw new Error(error);
    const encodedMarkup = JSON.parse(response.body).Markup;
    const decodedMarkup = decodeURIComponent(encodedMarkup);
    
    const encodedScript = JSON.parse(response.body).script;
    const decodedScript = decodeURIComponent(encodedScript);

    const ollama = new Ollama({ host: host, fetch: fetch });
    const output = await ollama.generate({
        model: model,
        prompt: "Write Test cases for the following Script code by using Markup code as context \n Markup:" + decodedMarkup + "\nScript:" + decodedScript,
        system: `You are a developer who writes test cases in pure JavaScript without using any testing framework or framework-specific utilities. 
        Your task is to write only standalone JavaScript functions that directly test the provided callbacks and scripts. 
        Do not use constructs like 'describe', 'it', 'jest.fn()', or any other testing framework-related syntax or utilities. 
        Use only plain JavaScript features to manually invoke functions, validate their behavior, and log results using 'console.log' or throw explicit errors with meaningful messages if a test fails. 
        Ensure each test function logs clear success or failure messages and handles errors properly. 
        Your response should consist solely of test functions written in plain JavaScript, formatted using MARKUP, and based on the provided context. 
        Avoid any explanations or comments.`,
        options: { temperature: 0 },
    });
    console.log(output.response)


    
});