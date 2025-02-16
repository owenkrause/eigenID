import { SlashCommandBuilder } from "discord.js";
import { api } from "../../../src/lib/api.ts";

const CHARACTER = "troll";

export default {
  data: new SlashCommandBuilder()
    .setName("judge")
    .setDescription("Judge two most recent arguments"),

  async execute(interaction) {
    await interaction.deferReply();

    const messages = await interaction.channel.messages.fetch({ limit: 3 });
    const messagesArray = Array.from(messages.values());

    try { 
      const response = await api.generateText(CHARACTER, { person1: messagesArray[2].content, person2: messagesArray[1].content });
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
      await interaction.editReply(`${verdict}\n\nlog id: ${response.proof.metadata.logId}`);
    } catch (err) {
      console.error(err);
      interaction.editReply("Error analyzing the arguments.");
    }

  }
}