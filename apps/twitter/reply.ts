import dotenv from "dotenv";
import { fetchQuotedTweetsText, createTweet } from "./client"
import { api } from "../../src/lib/api";

dotenv.config();

const CHARACTER = "degen";

const AUTH_TOKEN = process.env.AUTH_TOKEN;

export const reply = async(id: string, auth_token: string, ct0: string) => {
  if (!AUTH_TOKEN) return console.error("no auth_token in .env");

  const args = await fetchQuotedTweetsText(id, auth_token, ct0);
  if (!args) return

  const response = await api.generateText(CHARACTER, { person1: args[1], person2: args[2] });

  const jsonString = response.content.replace(/```json|```/g, '').trim();
  const result = JSON.parse(jsonString)
  let verdict = `I have reached my verdict. ${result.summary.winningReason}`
  if (result.validationErrors) {
    for (const err of result.validationErrors) {
      verdict += ` ${err.message} `
    }
  }
  switch (result.winner) {
    case "neither": 
      verdict += " Because of this, neither side wins."
      break
    case "argument_1":
      verdict += ` With an effectiveness of ${result.argument_1.effectiveness} vs ${result.argument_2.effectiveness}, person one wins.`
      break
    case "argument_2":
      verdict += ` With an effectiveness of ${result.argument_2.effectiveness} vs ${result.argument_1.effectiveness}, person two wins.`
      break
  }

  const resp = await createTweet(verdict, args[0], AUTH_TOKEN, ct0);

  console.log(resp)
}