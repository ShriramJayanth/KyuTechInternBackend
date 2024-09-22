import jwt from 'jsonwebtoken';
import { generateFromEmail } from 'unique-username-generator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const username = generateFromEmail(email, 4);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        username,
        password: passwordHash,
        firstTime:true,
        seedName:"none"
      },
    });

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ message: 'User does not exist' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.cookie('jwt', token, { httpOnly: true });

    res.status(200).json({ message: 'Login successful',firstTime:user.firstTime });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const user = async (req, res) => {
  try {
    const token = req.cookies['jwt'];
    if (!token) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const claims = jwt.verify(token, process.env.JWT_SECRET);
    if (!claims.id) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { password, ...data } = user;
    res.status(200).json(data);
  } catch (e) {
    console.error('Error fetching user:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 900000 });
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteAllUsers = async ()=> {
  try {
    await prisma.user.deleteMany({});
    console.log("All users deleted successfully.");
  } catch (error) {
    console.error("Error deleting users:", error);
  } 
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Fetch all users from the database
    res.status(200).json(users); // Respond with the users' data
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// deleteAllUsers();
// getAllUsers();

