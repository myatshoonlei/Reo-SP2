import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, link) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM, // must match a verified sender in SendGrid
        subject: 'Verify your email',
        html: `
      <h2>Welcome to REO!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 15 minutes.</p>
    `,
    };

    await sgMail.send(msg);
};

export default sendVerificationEmail;
