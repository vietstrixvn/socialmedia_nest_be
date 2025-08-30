// src/common/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenv.config();

const mail = process.env.NEXT_PRIVATE_EMAIL_USER || 'vietstrix+spam@gmail.com';
const pass = process.env.NEXT_PRIVATE_EMAIL_PASS || 'qplg rowm fpun jfxo';

interface EmailOptions {
  recipientEmail: string;
  name?: string;
}

@Injectable()
export class EmailService {
  private createTransporter() {
    if (!mail || !pass) {
      throw new Error('Email credentials are missing');
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: mail,
        pass: pass,
      },
    });
  }

  async sendEmail({
    recipientEmail,
    name = 'You',
  }: EmailOptions): Promise<void> {
    const transporter = this.createTransporter();

    const mailOptions = {
      from: {
        name: 'VIETSTRIX',
        address: mail,
      },
      to: recipientEmail,
      subject: 'Welcome to Vietstrix!',
      html: `
        <!doctype html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f8f8f8;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  overflow: hidden;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #013162 0%, #89cff0 100%);
                  padding: 25px;
                  text-align: center;
                }
                .header h2 {
                  color: white;
                  margin: 0;
                  font-size: 28px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .content {
                  padding: 30px;
                  line-height: 1.6;
                  color: #333;
                }
                .highlight {
                  color: #013162;
                  font-weight: bold;
                }
                .footer {
                  background: linear-gradient(135deg, #89cff0 0%, #013162 100%);
                  color: white;
                  padding: 20px;
                }
                .footer-table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .footer-table td {
                  padding: 10px;
                  vertical-align: middle;
                }
                .logo {
                  height: 60px;
                  border-radius: 6px;
                  border: 2px solid rgba(255, 255, 255, 0.3);
                }
                .company-name {
                  font-size: 20px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .company-tagline {
                  font-size: 14px;
                  opacity: 0.8;
                  margin-bottom: 10px;
                }
                .contact-info {
                  font-size: 14px;
                  line-height: 1.8;
                }
                .contact-link {
                  color: #9dd9f5;
                  text-decoration: none;
                  transition: color 0.2s;
                }

                .divider {
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                  margin: 15px 0;
                }
                .btn {
                  display: inline-block;
                  background: linear-gradient(135deg, #013162 0%, #013162 100%);
                  color: #89cff0;
                  padding: 12px 24px;
                  text-decoration: none;
                  font-weight: bold;
                  margin-top: 15px;
                  transition:
                    transform 0.2s,
                    box-shadow 0.2s;
                }
                .btn-wrapper {
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>VIETSTIRX</h2>
                </div>

                <div class="content">
                  <p>Dear <span class="highlight">${name}</span>,</p>

                  <p>
                    Thank you for signing up! Your registration is complete, and we’re
                    excited to have you on board.
                  </p>

                  <p>
                    If you have any additional questions in the meantime, feel free to
                    reach out.
                  </p>

                  <div class="btn-wrapper">
                    <a href="https://vietstrix.com" class="btn">Visit Our Website</a>
                  </div>

                  <p>
                    Welcome aboard! We're thrilled to have you as part of our community
                    and can’t wait to see what you create with us.
                  </p>

                  <p>
                    Best regards,<br />
                    <span class="highlight">Vietstrix Team</span>
                  </p>
                </div>

                <div class="footer">
                  <table class="footer-table">
                    <tr>
                      <td style="width: 30%; text-align: left">
                        <img
                          src="https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-1/492173604_650003057815755_39794938617424652_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=105&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=N6oaog0aQNMQ7kNvwGmGV1K&_nc_oc=Adm88v4o3zEvZt7Y__cM00q2y0sf4uYgDUS4UNVKhR__avu5-vE_7rX0rUk-JcA8WVE&_nc_zt=24&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=VCEyrEyqLTJqSQ-48xafIQ&oh=00_AfRpBC7HDQsGr0HJ-TdWi3qQgra4DnR5wm-J_DQ-_STCNw&oe=688FF8CE"
                          alt="VietStrix Logo"
                          class="logo"
                        />
                      </td>
                      <td style="width: 70%; text-align: right">
                        <div class="company-name">VietStrix</div>
                        <div class="company-tagline">Build. Launch. Scale.</div>
                        <div class="contact-info">
                        📧
                        <a href="mailto:vietstrix@gmail.com" class="contact-link"
                          >vietstrix@gmail.com</a
                        ><br />
                        🌐
                        <a href="https://vietstrix.com" class="contact-link"
                          >vietstrix.com</a
                        ><br />
                        📞 +84 377 783 437
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </body>
        </html>
     `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent to:', recipientEmail);
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
