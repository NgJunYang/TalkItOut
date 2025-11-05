import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Task } from '../models/Task';
import { CheckIn } from '../models/CheckIn';
import { Message } from '../models/Message';
import { Session } from '../models/Session';

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/talkitout';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Task.deleteMany({}),
      CheckIn.deleteMany({}),
      Message.deleteMany({}),
      Session.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const counselor = await User.create({
      name: 'Ms. Sarah Tan',
      email: 'counselor@talkitout.sg',
      password: hashedPassword,
      age: 35,
      role: 'counselor',
    });

    await Profile.create({ userId: counselor._id });

    const students = await User.insertMany([
      {
        name: 'Wei Jie',
        email: 'weijie@student.sg',
        password: hashedPassword,
        age: 15,
        school: 'River Valley High School',
        role: 'student',
        guardianConsent: true,
      },
      {
        name: 'Priya Kumar',
        email: 'priya@student.sg',
        password: hashedPassword,
        age: 17,
        school: 'National Junior College',
        role: 'student',
        guardianConsent: true,
      },
      {
        name: 'Marcus Lim',
        email: 'marcus@student.sg',
        password: hashedPassword,
        age: 14,
        school: 'Raffles Institution',
        role: 'student',
        guardianConsent: true,
      },
      {
        name: 'Aisha Rahman',
        email: 'aisha@student.sg',
        password: hashedPassword,
        age: 16,
        school: 'Dunman High School',
        role: 'student',
        guardianConsent: true,
      },
      {
        name: 'Ethan Ng',
        email: 'ethan@student.sg',
        password: hashedPassword,
        age: 13,
        school: 'School of Science and Technology',
        role: 'student',
        guardianConsent: true,
      },
    ]);

    console.log(`Created ${students.length} students and 1 counselor`);

    // Create profiles for students
    await Profile.insertMany(
      students.map((student) => ({
        userId: student._id,
        preferences: {
          pomodoro: {
            focusDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            cyclesBeforeLongBreak: 4,
          },
          notifications: true,
        },
        goals: [
          {
            title: 'Improve Math grades',
            why: 'Want to do well in exams',
            firstStep: 'Practice 30 min daily',
            createdAt: new Date(),
          },
        ],
        streaks: [
          {
            type: 'checkin',
            count: Math.floor(Math.random() * 10),
            lastDate: new Date(),
          },
        ],
        badges: [
          {
            id: 'first-checkin',
            name: 'First Check-in',
            description: 'Completed your first mood check-in',
            earnedAt: new Date(),
          },
        ],
      }))
    );

    // Create sample tasks for first student
    const student1 = students[0];
    await Task.insertMany([
      {
        userId: student1._id,
        title: 'Complete Math homework Chapter 5',
        subject: 'Mathematics',
        priority: 'high',
        status: 'doing',
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        title: 'Study for Science quiz',
        subject: 'Science',
        priority: 'med',
        status: 'todo',
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        title: 'Finish English essay draft',
        subject: 'English',
        priority: 'high',
        status: 'todo',
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        title: 'Review History notes',
        subject: 'History',
        priority: 'low',
        status: 'done',
        dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Create sample check-ins for students
    const today = new Date();
    for (const student of students.slice(0, 3)) {
      await CheckIn.insertMany([
        {
          userId: student._id,
          mood: 4,
          note: 'Feeling good about today!',
          sentiment: 'pos',
          createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          userId: student._id,
          mood: 3,
          note: 'A bit stressed about homework',
          sentiment: 'neu',
          createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId: student._id,
          mood: 5,
          note: 'Great day, finished all my tasks!',
          sentiment: 'pos',
          createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      ]);
    }

    // Create sample chat messages for first student
    await Message.insertMany([
      {
        userId: student1._id,
        role: 'user',
        text: 'Hi! I need help organizing my study schedule',
        sentiment: 'neu',
        riskTags: [],
        severity: 1,
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        role: 'assistant',
        text: "Hi Wei Jie! I'd love to help you organize your study schedule. Let's start by looking at what subjects you need to focus on. Can you tell me which subjects are coming up soon?",
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000 + 5000),
      },
      {
        userId: student1._id,
        role: 'user',
        text: 'I have Math homework due in 2 days and a Science quiz in 5 days',
        sentiment: 'neu',
        riskTags: [],
        severity: 1,
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        role: 'assistant',
        text: "Great! Let's prioritize. Since Math is due sooner, I suggest spending 45 minutes on it today using the Pomodoro technique. For Science, you can start with 25 minutes of reviewing notes. Would you like to start a focus session now?",
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000 + 5000),
      },
    ]);

    // Create sample Pomodoro sessions
    await Session.insertMany([
      {
        userId: student1._id,
        type: 'pomodoro',
        startedAt: new Date(today.getTime() - 3 * 60 * 60 * 1000),
        endedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
        cyclesCompleted: 2,
      },
      {
        userId: student1._id,
        type: 'pomodoro',
        startedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        endedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        cyclesCompleted: 1,
      },
    ]);

    console.log('✓ Seed data created successfully!');
    console.log('\nTest accounts:');
    console.log('Counselor: counselor@talkitout.sg / password123');
    console.log('Student 1: weijie@student.sg / password123');
    console.log('Student 2: priya@student.sg / password123');
    console.log('Student 3: marcus@student.sg / password123');
    console.log('Student 4: aisha@student.sg / password123');
    console.log('Student 5: ethan@student.sg / password123');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
