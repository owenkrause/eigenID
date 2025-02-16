import { promises as fs } from "fs";
import crypto from "crypto";

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const getTokens = async(): Promise<string[]> => {
  try {
    const fileContent = await fs.readFile("tokens.txt", "utf-8");
    return fileContent.split("\n").filter(line => line.trim() !== "");
  } catch (err) {
    throw err;
  }
};

export const generateCt0 = () => {
  const randomNum = Math.floor(Math.random() * 100000);
  const randomStr = randomNum.toString();
  const hash = crypto.createHash("md5").update(randomStr).digest("hex");
  
  return hash;
};