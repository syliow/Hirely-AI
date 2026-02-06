import { parseTextSegments } from '../helpers/textParser';

const generateLargeText = () => {
  const paragraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  ];

  const listItems = [
    "* Item one of a list",
    "* Item two of a list",
    "* Item three of a list",
    "1. Numbered item one",
    "2. Numbered item two"
  ];

  let text = "";
  for (let i = 0; i < 1000; i++) {
    text += paragraphs[Math.floor(Math.random() * paragraphs.length)] + "\n\n";
    if (i % 3 === 0) {
      text += listItems.join("\n") + "\n\n";
    }
  }
  return text;
};

const runBenchmark = () => {
  const text = generateLargeText();
  console.log(`Generated text length: ${text.length} chars`);

  const iterations = 1000;
  console.log(`Running ${iterations} iterations...`);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    parseTextSegments(text);
  }
  const end = performance.now();

  const totalTime = end - start;
  const avgTime = totalTime / iterations;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per parsing: ${avgTime.toFixed(4)}ms`);
};

runBenchmark();
