<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coordinator Account Created</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f0; margin: 0; padding: 20px; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(46, 125, 50, 0.1); border: 1px solid #e8f5e8;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 35px 30px; text-align: center; position: relative;">
            <!-- Decorative pattern -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #4caf50, #8bc34a, #4caf50);"></div>
            
            <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; display: inline-block; border: 2px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <img src="{{ url('images/Opol_logo.png') }}" alt="Opol Logo" style="max-width: 70px; height: auto;">
                    <img src="{{ url('images/MAO_LOGO.png') }}" alt="MAO Logo" style="max-width: 70px; height: auto;">
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">AgriConnect</h1>
                <p style="color: #c8e6c9; margin: 8px 0 0; font-size: 14px; font-weight: 400;">Municipal Agriculture Office – Opol</p>
            </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 35px;">
            <!-- Welcome Section -->
            <div style="text-align: center; margin-bottom: 35px;">
                <div style="width: 50px; height: 3px; background: #2e7d32; margin: 0 auto 20px; border-radius: 2px;"></div>
                <h2 style="color: #1b5e20; margin: 0; font-size: 22px; font-weight: 600;">Account Successfully Created</h2>
                <p style="color: #666; margin: 15px 0 0; font-size: 16px;">Welcome to AgriConnect, {{ $coordinator->fname }}!</p>
            </div>

            <p style="color: #444; margin-bottom: 25px; font-size: 15px;">
                Your coordinator account has been successfully established in our system. Please find your login credentials below:
            </p>

            <!-- Credentials Box -->
            <div style="background: #f8fdf8; border: 2px solid #e8f5e8; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2e7d32; margin: 0 0 20px; font-size: 16px; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Login Credentials</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e8f5e8;">
                            <strong style="color: #1b5e20; font-size: 14px;">Username:</strong>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e8f5e8; text-align: right;">
                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #2e7d32; font-weight: 600; border: 1px solid #ddd;">{{ $coordinator->username }}</code>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <strong style="color: #1b5e20; font-size: 14px;">Temporary Password:</strong>
                        </td>
                        <td style="padding: 12px 0; text-align: right;">
                            <code style="background: #ffffff; padding: 6px 12px; border-radius: 4px; color: #2e7d32; font-weight: 600; border: 1px solid #ddd;">{{ $password }}</code>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Security Notice -->
            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 0 6px 6px 0;">
                <p style="margin: 0; color: #f57c00; font-size: 14px; font-weight: 500;">
                    <strong>Security Requirement:</strong> You must change your password upon first login to ensure account security and compliance with our security policies.
                </p>
            </div>

            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/coordinator-login" 
                   style="display: inline-block; background: #2e7d32; color: white; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 3px 10px rgba(46, 125, 50, 0.2); border: 1px solid #1b5e20;">
                    Access Your Account
                </a>
            </div>

            <!-- Additional Information -->
            <div style="background: #f5f8f5; padding: 20px; border-radius: 6px; margin: 30px 0; border: 1px solid #e8f0e8;">
                <h4 style="color: #2e7d32; margin: 0 0 10px; font-size: 15px;">Getting Started:</h4>
                <ul style="color: #555; margin: 0; padding-left: 18px; font-size: 14px;">
                    <li style="margin-bottom: 5px;">Log in using the credentials provided above</li>
                    <li style="margin-bottom: 5px;">Update your password and profile information</li>
                    <li style="margin-bottom: 5px;">Familiarize yourself with the coordinator dashboard</li>
                    <li>Contact support if you need assistance</li>
                </ul>
            </div>

            <!-- Signature -->
            <div style="margin-top: 35px; padding-top: 20px; border-top: 2px solid #f0f4f0;">
                <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Respectfully,</p>
                <p style="margin: 0; color: #2e7d32; font-weight: 600; font-size: 15px;">Municipal Agriculture Office – Opol</p>
                <p style="margin: 5px 0 0; color: #888; font-size: 13px; font-style: italic;">AgriConnect Administration Team</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f8f8; padding: 20px 35px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px; font-size: 12px; color: #777; line-height: 1.4;">
                This is an official automated notification from AgriConnect.<br>
                Please do not reply to this email address.
            </p>
            <p style="margin: 0; font-size: 12px;">
                <span style="color: #666;">Technical Support: </span>
                <a href="mailto:support@opolagrisys.gov.ph" style="color: #2e7d32; text-decoration: none; font-weight: 500;">support@opolagrisys.gov.ph</a>
            </p>
        </div>
    </div>
</body>
</html>