export function getWelcomeEmailTemplate({ name }) {
  return {
    subject: "Welcome to Kodex Feedback",
    text: `Hi ${name}, your account is ready and you can now log in to Kodex Feedback.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;background:#050505;color:#f5f0ea;">
        <h1 style="margin:0 0 12px;color:#e35927;">Welcome, ${name}</h1>
        <p style="margin:0 0 10px;">Your account has been created successfully.</p>
        <p style="margin:0;">You can now log in and access the feedback dashboard.</p>
      </div>
    `,
  };
}

export function getOwnerSignupTemplate({ name, email }) {
  return {
    subject: "New signup on Kodex Feedback",
    text: `${name} (${email}) just created an account.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;background:#0b0b0b;color:#f5f0ea;">
        <h1 style="margin:0 0 12px;color:#e35927;">New account created</h1>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${name}</p>
        <p style="margin:0;"><strong>Email:</strong> ${email}</p>
      </div>
    `,
  };
}

export function getResetPasswordTemplate({ name, resetLink }) {
  return {
    subject: "Reset your Kodex Feedback password",
    text: `Hi ${name}, use this secure link to reset your password: ${resetLink}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;background:#050505;color:#f5f0ea;">
        <h1 style="margin:0 0 12px;color:#e35927;">Reset your password</h1>
        <p style="margin:0 0 16px;">Hi ${name}, click the button below to set a new password.</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#e35927;color:#140902;text-decoration:none;font-weight:700;">
          Reset Password
        </a>
        <p style="margin:16px 0 0;">This link expires in 15 minutes.</p>
      </div>
    `,
  };
}
