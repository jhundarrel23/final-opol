<?php

namespace App\Mail\Coordinator;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class CoordinatorPasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $coordinator;
    public $token;
    public $resetUrl;
    public $expirationTime;

    /**
     * Create a new message instance.
     */
    public function __construct(User $coordinator, string $token)
    {
        $this->coordinator = $coordinator;
        $this->token = $token;
        $this->expirationTime = config('auth.passwords.users.expire', 60); // minutes
        
        // Build reset URL with better error handling
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        $this->resetUrl = $frontendUrl . '/coordinator/reset-password?' . http_build_query([
            'token' => $token,
            'email' => $coordinator->email
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
            subject: 'Reset Your AgroConnect Coordinator Password',
            tags: ['password-reset', 'coordinator'],
            metadata: [
                'coordinator_id' => $this->coordinator->id,
                'reset_type' => 'coordinator_password_reset'
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.coordinator.password-reset',
            with: [
                'coordinatorName' => $this->getCoordinatorFullName(),
                'resetUrl' => $this->resetUrl,
                'token' => $this->token,
                'email' => $this->coordinator->email,
                'expirationTime' => $this->expirationTime,
                'expirationHours' => round($this->expirationTime / 60, 1),
                'supportEmail' => config('mail.support_email', config('mail.from.address')),
                'appName' => config('app.name', 'AgroConnect')
            ]
        );
    }

    /**
     * Get the coordinator's full name safely
     */
    private function getCoordinatorFullName(): string
    {
        $parts = array_filter([
            $this->coordinator->fname,
            $this->coordinator->mname,
            $this->coordinator->lname,
            $this->coordinator->extension_name
        ]);

        return implode(' ', $parts) ?: $this->coordinator->username ?: 'User';
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
