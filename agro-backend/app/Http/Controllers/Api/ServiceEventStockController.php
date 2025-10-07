<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceEvent;
use App\Models\ServiceEventStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceEventStockController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $user = Auth::user();
        $event = ServiceEvent::with('catalog')->findOrFail($eventId);

        if ($user->role !== 'admin' && $event->catalog->sector_id !== $user->sector_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'inventory_stock_id' => 'required|exists:inventory_stocks,id',
            'quantity_used'      => 'required|numeric|min:0.01',
            'remarks'            => 'nullable|string',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $stock = ServiceEventStock::create([
            'service_event_id'   => $eventId,
            'inventory_stock_id' => $request->inventory_stock_id,
            'quantity_used'      => $request->quantity_used,
            'remarks'            => $request->remarks,
        ]);

        return response()->json(['message' => 'Stock linked to event.', 'data' => $stock], 201);
    }

    public function destroy($eventId, $id)
    {
        $record = ServiceEventStock::findOrFail($id);
        $record->delete();
        return response()->json(['message' => 'Stock detached from event.']);
    }
}
 