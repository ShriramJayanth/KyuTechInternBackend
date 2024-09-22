import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { seedDetails } from "../seedDetails.js";

const prisma = new PrismaClient();

export const getAIResponse = async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = req.body.message;

  const result = await model.generateContent(prompt);
  res
    .status(203)
    .json({ reply: result.response.candidates[0].content.parts[0].text });
};

export const selectSeed = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { seedName } = req.body;

    if (!seedName) {
      return res.status(400).json({ message: "Seed name is required" });
    }

    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        seedName: seedName,
        firstTime: false,
      },
    });

    console.log("Updated User:", updatedUser);

    res.status(200).json({
      message: "Seed selected successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user seed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSeedDetailsByName = async (req, res) => {
    try {
      // Extract seedName from the query parameters
      const { seedName } = req.body;

      console.log(seedDetails[seedName]);
  
      if (!seedName) {
        return res.status(400).json({ error: "Seed name is required" });
      }
  
      // Check if the seedName exists in the seedDetails object
      const seedInfo = seedDetails[seedName];
  
      if (!seedInfo) {
        return res.status(404).json({ error: "Seed details not found" });
      }
  
      // Send the seed details as a JSON response
      return res.status(200).json({ status: "success", data: seedInfo });
    } catch (err) {
      console.error("Error fetching seed details:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
}