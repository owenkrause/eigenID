import { createAgent } from "./agent/createAgent.ts";

async function main() {
  try {
    console.log("🤖 Initializing AI Agent...");
    const agent = await createAgent();

    // Example 1: Generate verifiable text
    console.log("\n📝 Generating verifiable text...");
    const prompt = "What is the capital of France?";
    const textResult = await agent.generateVerifiableText(prompt);
    console.log("Response:", textResult.content);
    console.log("Proof available:", !!textResult.proof);

    console.log("\n✅ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main(); 