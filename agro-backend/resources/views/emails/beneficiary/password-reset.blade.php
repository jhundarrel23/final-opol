<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password - AgroConnect</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #333;
            margin-top: 0;
        }
        .content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .reset-button:hover {
            background: linear-gradient(135deg, #16a34a, #15803d);
        }
        .alternative {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #22c55e;
        }
        .alternative p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }
        .alternative code {
            background-color: #e9ecef;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
            word-break: break-all;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .warning p {
            color: #856404;
            margin: 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 AgroConnect</h1>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>Hello {{ $beneficiaryName }},</p>
            
            <p>We received a request to reset your password for your AgroConnect beneficiary account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="alternative">
                <p><strong>Alternative method:</strong></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><code>{{ $resetUrl }}</code></p>
            </div>
            
            <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <p>• This link will expire in 24 hours for security reasons</p>
                <p>• If you didn't request this reset, please ignore this email</p>
                <p>• Never share this reset link with anyone</p>
            </div>
            
            <p>If you're having trouble accessing your account or didn't request this reset, please contact our support team immediately.</p>
            
            <p>Best regards,<br>
            The AgroConnect Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from AgroConnect. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} AgroConnect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
