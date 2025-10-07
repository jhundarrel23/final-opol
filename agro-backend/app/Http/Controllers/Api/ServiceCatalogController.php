<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceCatalogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = ServiceCatalog::with('sector');

        if ($user->role !== 'admin') {
            $query->where('sector_id', $user->sector_id);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && !$user->sector_id) {
            return response()->json(['error' => 'Coordinator must have sector assigned.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:150',
            'unit'        => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $catalog = ServiceCatalog::create([
            'name'        => $request->name,
            'unit'        => $request->unit,
            'description' => $request->description,
            'sector_id'   => $user->role === 'admin' ? $request->sector_id : $user->sector_id,
            'is_active'   => true,
        ]);

        return response()->json([
            'message' => 'Service catalog created successfully.',
            'data'    => $catalog
        ], 201);
    }

    public function show($id)
    {
        $catalog = ServiceCatalog::with('sector')->findOrFail($id);
        return response()->json($catalog);
    }

    public function update(Request $request, $id)
    {
        $catalog = ServiceCatalog::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'admin' && $catalog->sector_id !== $user->sector_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $catalog->update($request->only(['name', 'unit', 'description', 'is_active']));

        return response()->json([
            'message' => 'Service catalog updated successfully.',
            'data'    => $catalog
        ]);
    }

    public function destroy($id)
    {
        $catalog = ServiceCatalog::findOrFail($id);
        $user = Auth::user();

        if ($user->role !== 'admin' && $catalog->sector_id !== $user->sector_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $catalog->delete();
        return response()->json(['message' => 'Service catalog deleted successfully.']);
    }
}
