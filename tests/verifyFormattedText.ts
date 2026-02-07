import { parseTextSegments } from '../helpers/textParser';
import assert from 'assert';

const runTests = () => {
  console.log("Running verification tests for parseTextSegments...");

  // Test 1: Empty text
  const segments1 = parseTextSegments("");
  assert.strictEqual(segments1.length, 0, "Empty text should return empty array");
  console.log("Test 1 Passed: Empty text");

  // Test 2: Single paragraph
  const text2 = "Hello world";
  const segments2 = parseTextSegments(text2);
  assert.strictEqual(segments2.length, 1, "Single paragraph should be 1 segment");
  assert.strictEqual(segments2[0].isList, false, "Should not be a list");
  assert.deepStrictEqual(segments2[0].lines, ["Hello world"], "Content match");
  console.log("Test 2 Passed: Single paragraph");

  // Test 3: List
  const text3 = "* Item 1\n* Item 2";
  const segments3 = parseTextSegments(text3);
  assert.strictEqual(segments3.length, 1, "List should be 1 segment");
  assert.strictEqual(segments3[0].isList, true, "Should be a list");
  assert.strictEqual(segments3[0].lines.length, 2, "Should have 2 lines");
  console.log("Test 3 Passed: List detection");

  // Test 4: Paragraph + List + Paragraph
  const text4 = "Para 1\n\n* Item 1\n* Item 2\n\nPara 2";
  const segments4 = parseTextSegments(text4);
  assert.strictEqual(segments4.length, 3, "Should have 3 segments");
  assert.strictEqual(segments4[0].isList, false, "Segment 1 is paragraph");
  assert.strictEqual(segments4[1].isList, true, "Segment 2 is list");
  assert.strictEqual(segments4[2].isList, false, "Segment 3 is paragraph");
  console.log("Test 4 Passed: Mixed content");

  // Test 5: Numbered list
  const text5 = "1. First\n2. Second";
  const segments5 = parseTextSegments(text5);
  assert.strictEqual(segments5[0].isList, true, "Numbered list detected");
  console.log("Test 5 Passed: Numbered list");

  console.log("All tests passed!");
};

runTests();
