#!/usr/bin/env node

// Quick script to generate Ethereal Email credentials for testing
// Run with: node scripts/generate-ethereal.js

import nodemailer from 'nodemailer';

async function generateEtherealCredentials() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('=== ETHEREAL EMAIL CREDENTIALS ===');
    console.log('SMTP Host: smtp.ethereal.email');
    console.log('SMTP Port: 587');
    console.log('SMTP User:', testAccount.user);
    console.log('SMTP Pass:', testAccount.pass);
    console.log('');
    console.log('Web Interface:', `https://ethereal.email/login`);
    console.log('');
    console.log('Add these to your .env.local file:');
    console.log(`SMTP_HOST=smtp.ethereal.email`);
    console.log(`SMTP_PORT=587`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`FROM_EMAIL=${testAccount.user}`);
    console.log(`FROM_NAME=Your App`);
    console.log('');
    console.log('Then restart your development server.');

    return testAccount;
  } catch (error) {
    console.error('Error generating Ethereal credentials:', error);
  }
}

generateEtherealCredentials();
