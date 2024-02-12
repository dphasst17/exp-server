import nodemailer from 'nodemailer'
import { OAuth2Client } from 'google-auth-library'
import dotenv from "dotenv";
dotenv.config();


export const handleSendMail = (res, data) => {
    const toMail = data.toMail;
    const subject = data.subject;
    const content = data.content
    const GOOGLE_MAILER_CLIENT_ID = process.env.G_M_CLIENT_ID
    const GOOGLE_MAILER_CLIENT_SECRET = process.env.G_M_SECRET_ID
    const GOOGLE_MAILER_REFRESH_TOKEN = process.env.G_M_TOKEN
    const ADMIN_EMAIL_ADDRESS = process.env.G_M_FROM

    const myOAuth2Client = new OAuth2Client(
        GOOGLE_MAILER_CLIENT_ID,
        GOOGLE_MAILER_CLIENT_SECRET
    )
    // Set Refresh Token vào OAuth2Client Credentials
    myOAuth2Client.setCredentials({
        refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
    })
    const sendMail = async () => {
        try {
            // Lấy thông tin gửi lên từ client qua body

            const myAccessTokenObject = await myOAuth2Client.getAccessToken()
            // Access Token sẽ nằm trong property 'token' trong Object  vừa get được ở trên
            const myAccessToken = myAccessTokenObject?.token
            // Tạo một biến Transport từ Nodemailer với đầy đủ cấu hình, dùng để gọi hành động gửi mail
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: ADMIN_EMAIL_ADDRESS,
                    clientId: GOOGLE_MAILER_CLIENT_ID,
                    clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
                    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
                    accessToken: myAccessToken
                }
            })
            const mailOptions = {
                to: toMail, // người nhận
                subject: subject, // Tiêu đề email
                html: `<h3>${content}</h3>` // Nội dung email
            }
            await transport.sendMail(mailOptions)
            res.status(200).json({status:200,message: 'Email sent successfully.' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ errors: error.message })
        }
    }
    sendMail()
}