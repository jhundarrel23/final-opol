<?php

namespace App\Http\Controllers;

use App\Models\ServicesProgram;
use App\Models\ServiceCatalog;
use App\Models\ProgramBeneficiaryService;
use App\Models\BeneficiaryDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServicesProgramController extends Controller
{
    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $validator = Validator::make($data, [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'sector' => 'required|string|max:64',
                'barangay' => 'nullable|string|max:255',
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $program = ServicesProgram::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'status' => 'ongoing',
                'sector' => $data['sector'],
                'barangay' => $data['barangay'] ?? null,
                'created_by' => $request->user()?->id ?? auth()->id(),
            ]);

            return response()->json(['program' => $program], 201);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to create services program'], 500);
        }
    }

    public function show($id)
    {
        $program = ServicesProgram::with(['services'])->findOrFail($id);
        return response()->json(['program' => $program]);
    }

    public function addService(Request $request, $id)
    {
        try {
            $program = ServicesProgram::findOrFail($id);
            $data = $request->all();
            $validator = Validator::make($data, [
                'service_catalog_id' => 'required|integer|exists:service_catalogs,id',
                'planned_units' => 'nullable|integer|min:0',
                'config' => 'nullable|array',
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $catalog = ServiceCatalog::findOrFail($data['service_catalog_id']);
            $program->services()->syncWithoutDetaching([
                $catalog->id => [
                    'planned_units' => $data['planned_units'] ?? null,
                    'config' => $data['config'] ?? null,
                ]
            ]);

            $program->load('services');
            return response()->json(['program' => $program]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to add service to program'], 500);
        }
    }

    public function addBeneficiaryRecord(Request $request, $id, $beneficiaryId)
    {
        try {
            $program = ServicesProgram::findOrFail($id);
            BeneficiaryDetail::findOrFail($beneficiaryId);

            $data = $request->all();
            $validator = Validator::make($data, [
                'service_catalog_id' => 'required|integer|exists:service_catalogs,id',
                'units' => 'nullable|integer|min:1',
                'delivered_at' => 'nullable|date',
                'location' => 'nullable|string|max:255',
                'metadata' => 'nullable|array',
                'status' => 'nullable|in:provided,scheduled,cancelled',
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $record = ProgramBeneficiaryService::create([
                'services_program_id' => $program->id,
                'beneficiary_id' => $beneficiaryId,
                'service_catalog_id' => $data['service_catalog_id'],
                'units' => $data['units'] ?? 1,
                'delivered_at' => $data['delivered_at'] ?? null,
                'location' => $data['location'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'status' => $data['status'] ?? 'provided',
            ]);

            return response()->json(['record' => $record], 201);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to record beneficiary service'], 500);
        }
    }

    public function summary($id)
    {
        try {
            $program = ServicesProgram::findOrFail($id);
            $totals = ProgramBeneficiaryService::selectRaw('service_catalog_id, COUNT(*) as records, SUM(units) as total_units')
                ->where('services_program_id', $program->id)
                ->groupBy('service_catalog_id')
                ->get();
            $beneficiariesServed = ProgramBeneficiaryService::where('services_program_id', $program->id)
                ->distinct('beneficiary_id')
                ->count('beneficiary_id');
            return response()->json([
                'program' => $program,
                'beneficiaries_served' => $beneficiariesServed,
                'service_totals' => $totals,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to generate program summary'], 500);
        }
    }
}


