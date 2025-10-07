<?php

namespace App\Mail\Beneficiary;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class BeneficiaryPasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $beneficiary;
    public $token;
    public $resetUrl;
    public $expirationTime;

    /**
     * Create a new message instance.
     */
    public function __construct(User $beneficiary, string $token)
    {
        $this->beneficiary = $beneficiary;
        $this->token = $token;
        $this->expirationTime = config('auth.passwords.users.expire', 60); // minutes

        // ✅ Use correct frontend reset route
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        $this->resetUrl = $frontendUrl . '/beneficiary-password-reset?' . http_build_query([
            'token' => $token,
            'email' => $beneficiary->email,
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address'),
                config('mail.from.name')
            ),
            subject: 'Reset Your AgroConnect Beneficiary Password',
            tags: ['password-reset', 'beneficiary'],
            metadata: [
                'beneficiary_id' => $this->beneficiary->id,
                'reset_type' => 'beneficiary_password_reset'
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.beneficiary.password-reset',
            with: [
                'beneficiaryName' => $this->getBeneficiaryFullName(),
                'resetUrl' => $this->resetUrl,
                'token' => $this->token,
                'email' => $this->beneficiary->email,
                'expirationTime' => $this->expirationTime,
                'expirationHours' => round($this->expirationTime / 60, 1),
                'supportEmail' => config('mail.support_email', config('mail.from.address')),
                'appName' => config('app.name', 'AgroConnect'),
            ]
        );
    }

    /**
     * Get the beneficiary's full name safely.
     */
    private function getBeneficiaryFullName(): string
    {
        $parts = array_filter([
            $this->beneficiary->fname,
            $this->beneficiary->mname,
            $this->beneficiary->lname,
            $this->beneficiary->extension_name,
        ]);

        return implode(' ', $parts) ?: $this->beneficiary->username ?: 'User';
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
