import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          message: existingUser.email === email 
            ? 'Email already exists' 
            : 'Username already exists' 
        },
        { status: 409 }
      );
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await prisma.$transaction(async (tx) => {

      const user = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });


      await tx.channel.create({
        data: {
          name: `${username}'s Channel`,
          description: `Welcome to ${username}'s Channel`,
          slug: username.toLowerCase(),
          userId: user.id,
        },
      });

      return user;
    });

    return NextResponse.json(
      { 
        message: 'User successfully registered',
        userId: newUser.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 