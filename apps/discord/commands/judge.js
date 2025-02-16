import { SlashCommandBuilder } from "discord.js";
import { api } from "../../../src/lib/api.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("judge")
    .setDescription("Judge two most recent arguments"),

  async execute(interaction) {
    await interaction.deferReply();

    const messages = await interaction.channel.messages.fetch({ limit: 3 });
    const messagesArray = Array.from(messages.values());

    const prompt = `
    you are a judge evaluating the validity of each argument. 
    your task is to analyze the provided arguments and respond with ONLY a valid JSON object.
    DO NOT include any other text, markdown, or formatting.

    Evaluation criteria:
    - effectiveness score should be 0-100
    - arguments should be at least 5 words long to be considered valid
    - each argument must present a clear position or claim
    - pros and cons arrays should contain 0-5 items each
    - validation errors should be provided if either argument is invalid

    Arguments to evaluate:
    Person 1: ${messagesArray[2].content}
    Person 2: ${messagesArray[1].content}

    Respond with an object in this exact format:
    { 
      "winner": "argument_1" | "argument_2 | neither",
      "argument_1": {
        "isValidArgument": boolean,
        "effectiveness": number,
        "pros": string[],
        "cons": string[],
        "keyPoints": string[],
      },
      "argument_2": {
        "isValidArgument": boolean,
        "effectiveness": number,
        "pros": string[],
        "cons": string[],
        "keyPoints": string[],
      },
      "validationErrors": [
        {
          "code": "one of: INVALID_ARG_1, INVALID_ARG_2, INVALID_ARG_BOTH, INSUFFICIENT_LENGTH, NO_CLEAR_POSITION",
          "message": "detailed explanation of what's missing"
        }
      ],
      "summary": {
        "winningReason": string,
        "mainDifference": string
      }
    }`;

    try { 
      const response = await api.generateText(prompt);
      const jsonString = response.content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonString)
      let verdict = `I have reached my verdict. ${result.summary.mainDifference}`
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
      await interaction.editReply(`${verdict}\n\nlog id: ${response.proof.metadata.logId}`);
    } catch (err) {
      console.error(err);
      interaction.editReply("Error analyzing the arguments.");
    }

  }
}