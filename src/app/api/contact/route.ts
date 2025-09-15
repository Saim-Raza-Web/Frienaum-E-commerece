import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // (Optional) Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    console.log('📩 Contact form submission saved:', {
      id: contactMessage.id,
      name: contactMessage.name,
      email: contactMessage.email,
      subject: contactMessage.subject,
      message: contactMessage.message,
      createdAt: contactMessage.createdAt,
    });

    return NextResponse.json(
      { message: 'Message sent successfully', id: contactMessage.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Contact form error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
