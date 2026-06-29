
import nodemailer from 'nodemailer'




// setup to transport send email via 'gmail'
const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST, // sandbox.smtp.mailtrap.io
    port: process.env.NODEMAILER_PORT, // 2525
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});


// generate the otp
 export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()   // creating 6 digit string
    const expiry = new Date(Date.now() + 60000)  // 1min expiry

    return { otp, expiry }
}





// functuon to send otp in email

export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Alpha Books - Account Verification OTP",
            html: `<h3>Welcome to Alpha Books!</h3>
                   <p>Your OTP for account verification is: <b>${otp}</b></p>
                   <p>This OTP is valid for 1 minutes only.</p>`
        };

        // sending mail to mail trap
        const info = await transporter.sendMail(mailOptions);

        console.log("Message sent successfully. Response:", info.response);
        console.log(`OTP Email successfully sent to ${email}`);
        
        return info; // function success
    }
    catch (error) {
        console.error("Error in sending OTP email:", error.message);
        throw new Error("Failed to send OTP email");
    }
}

