<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'document_type',
        'user_id',
        'beneficiary_id',
        'related_type',
        'related_id',
        'description'
    ];

    // Polymorphic relationship
    public function related()
    {
        return $this->morphTo();
    }

    // Uploader
    public function uploader()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Beneficiary (optional)
    public function beneficiary()
    {
        return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
    }
}
