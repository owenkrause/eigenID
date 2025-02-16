import { OpacityAdapter } from "@layr-labs/agentkit-opacity";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface VerifiableResponse {
  content: string;
  proof: any;
}

export class Agent {
  private opacity: OpacityAdapter;
  private characters: Record<string, string> = {};

  constructor() {
    // Initialize Opacity adapter for verifiable AI inference
    this.opacity = new OpacityAdapter({
      apiKey: process.env.OPACITY_OPENAI_KEY!,
      teamId: process.env.OPACITY_TEAM_ID!,
      teamName: process.env.OPACITY_TEAM_NAME!,
      opacityProverUrl: process.env.OPACITY_PROVER_URL!,
    });
  }

  // Initialize all adapters
  async initialize() {
    try {
      console.log("Initializing Opacity adapter...");
      await this.opacity.initialize();

      const characterFiles = ["normal.txt", "legal.txt", "degen.txt", "troll.txt"];
      for (const file of characterFiles) {
        const data = await fs.readFile(path.join(__dirname, file), "utf8");
        this.characters[file.replace(".txt", "")] = data;
      }

      console.log("All adapters initialized successfully");
    } catch (error) {
      console.error("Error initializing adapters:", error);
      throw error;
    }
  }

  // Generate verifiable text using Opacity and log to EigenDA
  async generateVerifiableText(
    characterType: "normal" | "legal" | "degen" | "troll" = "normal",
    args: { person1: string, person2: string }
  ): Promise<VerifiableResponse> {
    try {
      const characterPrompt = this.characters[characterType];
      if (!characterPrompt) {
        throw new Error(`Character type ${characterType} not found`);
      }

      const fullPrompt = characterPrompt
        .replace('${args.person1}', args.person1)
        .replace('${args.person2}', args.person2);
      
      console.log("Generating text with prompt:", fullPrompt);
      // Generate text with proof using Opacity
      const result = await this.opacity.generateText(fullPrompt);
      console.log("Generated result:", result);

      return result;
    } catch (error) {
      console.error("Error in generateVerifiableText:", error);
      throw error;
    }
  }
}

// Export a factory function to create new agent instances
export const createAgent = async (): Promise<Agent> => {
  const agent = new Agent();
  await agent.initialize();
  return agent;
}; 