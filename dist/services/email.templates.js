"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOtpEmailTemplate = void 0;
const getOtpEmailTemplate = (otp, name = 'User') => {
    const subject = "Verify Your Account - Vape & Smoke Shop";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1a1a1a;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
      color: #333333;
    }
    .otp-box {
      background-color: #f8f9fa;
      border: 2px dashed #333;
      border-radius: 4px;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      color: #1a1a1a;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    p {
      margin-bottom: 15px;
    }
    .note {
      font-size: 14px;
      color: #666666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vape & Smoke Shop</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>Thank you for choosing Vape & Smoke Shop. To verify your identity and secure your account, please use the following One-Time Password (OTP):</p>
      
      <div class="otp-box">${otp}</div>
      
      <p>This code will expire in 10 minutes.</p>
      <p class="note">If you did not request this verification, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Vape & Smoke Shop. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
    const text = `
Hello ${name},

Your verification code for Vape & Smoke Shop is: ${otp}

This code will expire in 10 minutes.

If you did not request this, please ignore this message.

© ${new Date().getFullYear()} Vape & Smoke Shop
  `.trim();
    return { subject, html, text };
};
exports.getOtpEmailTemplate = getOtpEmailTemplate;
