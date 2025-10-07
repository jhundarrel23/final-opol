<?php

    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Models\ServiceEvent;
    use App\Models\ServiceCatalog;
    use App\Models\Document;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Auth;
    use Illuminate\Support\Facades\Validator;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Facades\DB;

    class ServiceEventController extends Controller
    {
        public function index(Request $request)
        {
            $user = Auth::user();
            $query = ServiceEvent::with(['catalog', 'coordinator', 'beneficiaries', 'stocks', 'documents']);

            if ($user->role !== 'admin') {
                $query->whereHas('catalog', fn($q) => $q->where('sector_id', $user->sector_id));
            }

            if ($request->catalog_id) {
                $query->where('service_catalog_id', $request->catalog_id);
            }

            return response()->json($query->orderByDesc('service_date')->get());
        }

        public function store(Request $request)
        {
            $user = Auth::user();

            $validator = Validator::make($request->all(), [
                'service_catalog_id' => 'required|exists:service_catalogs,id',
                'barangay'           => 'required|string|max:255',
                'service_date'       => 'required|date',
                'remarks'            => 'nullable|string',
            ]);

            if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

            $catalog = ServiceCatalog::findOrFail($request->service_catalog_id);
            if ($user->role !== 'admin' && $catalog->sector_id !== $user->sector_id) {
                return response()->json(['error' => 'Unauthorized sector.'], 403);
            }

            $event = ServiceEvent::create([
                'service_catalog_id' => $catalog->id,
                'coordinator_id'     => $user->id,
                'barangay'           => $request->barangay,
                'service_date'       => $request->service_date,
                'remarks'            => $request->remarks,
                'status'             => 'pending',
            ]);

            return response()->json(['message' => 'Service event created.', 'data' => $event], 201);
        }

        public function show($id)
        {
            $event = ServiceEvent::with(['catalog', 'coordinator', 'beneficiaries.beneficiary', 'stocks.inventoryStock', 'documents'])->findOrFail($id);
            return response()->json($event);
        }

        public function update(Request $request, $id)
        {
            $event = ServiceEvent::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $event->coordinator_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $event->update($request->only(['barangay', 'service_date', 'remarks', 'status']));
            return response()->json(['message' => 'Service event updated.', 'data' => $event]);
        }

        public function destroy($id)
        {
            $event = ServiceEvent::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $event->coordinator_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            DB::transaction(fn() => $event->delete());
            return response()->json(['message' => 'Service event deleted.']);
        }

        public function uploadDocuments(Request $request, $id)
        {
            $event = ServiceEvent::findOrFail($id);
            $user = Auth::user();

            if ($user->role !== 'admin' && $event->coordinator_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'files.*'        => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
                'document_type'  => 'required|string|max:100',
            ]);

            if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

            $uploaded = [];
            foreach ($request->file('files', []) as $file) {
                $path = $file->store('service_events', 'public');
                $doc = Document::create([
                    'file_name'     => $file->getClientOriginalName(),
                    'file_path'     => $path,
                    'file_type'     => $file->getClientMimeType(),
                    'file_size'     => $file->getSize(),
                    'document_type' => $request->document_type,
                    'user_id'       => $user->id,
                    'related_type'  => ServiceEvent::class,
                    'related_id'    => $event->id,
                ]);
                $uploaded[] = $doc;
            }

            return response()->json(['message' => 'Documents uploaded.', 'data' => $uploaded], 201);
        }
    }
