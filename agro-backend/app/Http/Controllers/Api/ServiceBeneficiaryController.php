<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceBeneficiary;
use App\Models\ServiceEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceBeneficiaryController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $user = Auth::user();
        $event = ServiceEvent::with('catalog')->findOrFail($eventId);

        if ($user->role !== 'admin' && $event->catalog->sector_id !== $user->sector_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'beneficiary_id' => 'required|exists:beneficiary_details,id',
            'species'        => 'nullable|string|max:100',
            'quantity'       => 'required|numeric|min:1',
            'remarks'        => 'nullable|string',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $beneficiary = ServiceBeneficiary::create([
            'service_event_id' => $eventId,
            'beneficiary_id'   => $request->beneficiary_id,
            'species'          => $request->species,
            'quantity'         => $request->quantity,
            'remarks'          => $request->remarks,
            'status'           => 'active',
        ]);

        return response()->json(['message' => 'Beneficiary added.', 'data' => $beneficiary], 201);
    }

    public function destroy($eventId, $id)
    {
        $beneficiary = ServiceBeneficiary::findOrFail($id);
        $beneficiary->delete();
        return response()->json(['message' => 'Beneficiary removed.']);
    }
}
