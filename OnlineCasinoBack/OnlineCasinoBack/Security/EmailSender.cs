using System.Net;
using System.Net.Mail;

namespace OnlineCasinoBack.Security
{
    public class EmailSender
    {
        private readonly string _senderEmail = "TFBBG1@gmail.com";
        private readonly string _senderPassword;
        private readonly string _baseUrl;

        public EmailSender(IConfiguration configuration)
        {
            _senderPassword = configuration["Email:Password"];
            _baseUrl = configuration["App:BaseUrl"];
        }

        public async Task SendConfirmationEmailAsync(string recipientEmail, string fullName, string token)
        {
            string confirmUrl = $"{_baseUrl}/api/auth/confirm/{token}";
            string declineUrl = $"{_baseUrl}/api/auth/decline/{token}";

            string htmlBody = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Confirm Registration</title>
</head>
<body style=""margin:0;padding:0;background-color:#000d20;font-family:'Segoe UI',sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#000d20;padding:48px 16px;"">
    <tr>
      <td align=""center"">
        <table width=""480"" cellpadding=""0"" cellspacing=""0"" style=""background:linear-gradient(160deg,#041530,#020b1a);border:1px solid rgba(201,168,76,0.2);border-radius:16px;overflow:hidden;"">
          <tr>
            <td style=""height:3px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);""></td>
          </tr>
          <tr>
            <td style=""padding:40px 40px 16px;"">
              <h1 style=""margin:0;font-size:32px;letter-spacing:3px;color:#f0c96a;text-transform:uppercase;"">BET<span style=""color:#ffffff;"">&</span>BET</h1>
            </td>
          </tr>
          <tr>
            <td style=""padding:8px 40px 24px;"">
              <h2 style=""margin:0 0 12px;font-size:22px;color:#e8dfc8;font-weight:600;"">Thanks for registering, {fullName}!</h2>
              <p style=""margin:0;font-size:15px;color:#7a8fa8;line-height:1.6;"">
                Your account has been created. Do you want to confirm your registration and activate your BET&amp;BET account?
              </p>
            </td>
          </tr>
          <tr>
            <td style=""padding:8px 40px 40px;"">
              <table cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td style=""padding-right:12px;"">
                    <a href=""{confirmUrl}"" style=""display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#c9a84c,#f0c96a);color:#000;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:8px;"">
                      Yes, Confirm
                    </a>
                  </td>
                  <td>
                    <a href=""{declineUrl}"" style=""display:inline-block;padding:12px 32px;background:transparent;color:#7a8fa8;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:8px;border:1px solid rgba(122,143,168,0.3);"">
                      No, Delete
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=""padding:20px 40px;border-top:1px solid rgba(201,168,76,0.1);"">
              <p style=""margin:0;font-size:12px;color:rgba(122,143,168,0.5);"">
                If you did not create this account, you can safely ignore this email or click No to delete it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            var mail = new MailMessage
            {
                From = new MailAddress(_senderEmail, "BET&BET"),
                Subject = "Confirm your BET&BET registration",
                Body = htmlBody,
                IsBodyHtml = true
            };

            mail.To.Add(recipientEmail);

            using var smtp = new SmtpClient("smtp.gmail.com", 587)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_senderEmail, _senderPassword),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            await smtp.SendMailAsync(mail);
        }
    }
}