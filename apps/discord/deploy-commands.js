import { REST, Routes } from "discord.js";
import dotenv from "dotenv"
import fs from "fs";
import path from "path";

dotenv.config()
const commands = [];

const commandsPath = path.join(path.resolve(), "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });