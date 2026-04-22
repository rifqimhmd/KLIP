<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsultationController extends Controller
{
    private function psikologBaseQuery()
    {
        return User::query()
            ->whereRaw('LOWER(COALESCE(status_pengguna, "")) = ?', ['psikolog'])
            ->select([
                'id',
                'name',
                'email',
                'nip',
                'no_wa',
                'foto',
                'is_available',
                'organization_detail',
            ]);
    }

    private function getExportableConsultations($user)
    {
        if ($this->isAdmin($user)) {
            return Consultation::with(['user', 'psikolog'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        if ($this->isPsikolog($user) || $this->isAsisPsikolog($user)) {
            return Consultation::with(['user', 'psikolog'])
                ->where('psikolog_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return collect([]);
    }

    private function isPsikolog($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'psikolog'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'psikolog';
    }

    private function isAsisPsikolog($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'asisten psikolog';
    }

    private function canHandleConsultation($user): bool
    {
        return $this->isPsikolog($user) || $this->isAsisPsikolog($user) || $this->isKonsultanTeknis($user);
    }

    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return strtolower((string) ($user->status_pengguna ?? '')) === 'admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    private function isKonsultanTeknis($user): bool
    {
        if (!$user) {
            return false;
        }

        // Admin atau role konsultan teknis bisa menangani konsultasi teknis
        return $this->isAdmin($user)
            || strtolower((string) ($user->status_pengguna ?? '')) === 'konsultan teknis'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'konsultan teknis';
    }

    /**
     * Get all consultations for admin dashboard
     */
    public function adminIndex(Request $request)
    {
        $consultations = Consultation::with(['user', 'psikolog'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'consultations' => $consultations,
            'total' => $consultations->count(),
            'active' => $consultations->where('status', 'active')->count(),
            'completed' => $consultations->where('status', 'completed')->count(),
        ]);
    }

    /**
     * Get all consultations for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type'); // Filter by type: 'psikolog' or 'teknis'

        $query = Consultation::with(['user', 'psikolog', 'assignedTo']);

        // Filter by type if specified
        if ($type) {
            $query->where('type', $type);
        }

        if ($this->isPsikolog($user) || $this->isAsisPsikolog($user)) {
            // Psikolog hanya bisa melihat konsultasi psikolog yang ditugaskan ke mereka
            $query->where('type', 'psikolog')
                ->where('psikolog_id', $user->id)
                ->where('deleted_by_psikolog', false);
        } elseif ($this->isKonsultanTeknis($user)) {
            // Konsultan teknis bisa melihat semua konsultasi teknis
            if (!$type || $type === 'teknis') {
                $query->where(function ($q) use ($user) {
                    $q->where('type', 'teknis')
                        ->where(function ($sq) use ($user) {
                            $sq->whereNull('assigned_to')
                                ->orWhere('assigned_to', $user->id);
                        });
                });
            }
        } elseif ($this->isAdmin($user)) {
            // Admin bisa melihat semua
        } else {
            // User biasa hanya bisa melihat konsultasi mereka sendiri
            $query->where('user_id', $user->id)
                ->where('deleted_by_user', false);
        }

        $consultations = $query->orderBy('created_at', 'desc')->get();

        return response()->json($consultations);
    }

    /**
     * Store a new consultation
     */
    public function store(Request $request)
    {
        $type = $request->input('type', 'psikolog');
        \Log::info('Creating consultation', ['type' => $type, 'user_id' => $request->user()->id]);

        if ($type === 'teknis') {
            // Validasi untuk konsultasi teknis
            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'description' => 'required|string',
                'subdit' => 'required|string|in:advokasi,pencegahan',
                'category' => 'required|string',
                'urgency' => 'required|string|in:low,medium,high',
            ]);

            \Log::info('Teknis consultation validated', $validated);

            try {
                $consultation = Consultation::create([
                    'user_id' => $request->user()->id,
                    'type' => 'teknis',
                    'subject' => $validated['subject'],
                    'description' => $validated['description'],
                    'subdit' => $validated['subdit'],
                    'category' => $validated['category'],
                    'urgency' => $validated['urgency'],
                    'status' => 'pending',
                    'q1' => $validated['subject'], // Store subject in q1 for compatibility
                    'q2' => $validated['description'], // Store description in q2 for compatibility
                    'q3' => '', // Default empty for teknis
                    'q4' => '', // Default empty for teknis
                    'q5' => '', // Default empty for teknis
                    'q6' => '', // Default empty for teknis
                    'q7' => '', // Default empty for teknis
                ]);

                \Log::info('Teknis consultation created', ['consultation_id' => $consultation->id]);

                return response()->json([
                    'message' => 'Konsultasi teknis berhasil dikirim',
                    'consultation' => $consultation->load(['user'])
                ], 201);
            } catch (\Exception $e) {
                \Log::error('Failed to create teknis consultation', ['error' => $e->getMessage()]);
                return response()->json([
                    'message' => 'Gagal menyimpan konsultasi: ' . $e->getMessage()
                ], 500);
            }
        }

        // Validasi untuk konsultasi psikolog (default)
        $validated = $request->validate([
            'q1' => 'required|string',
            'q2' => 'required|string',
            'q3' => 'required|string',
            'q4' => 'required|string',
            'q5' => 'required|string',
            'q6' => 'required|string',
            'q7' => 'required|string',
            'psikolog_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ],
        ]);

        $psikolog = $this->psikologBaseQuery()
            ->where('id', $validated['psikolog_id'])
            ->first();

        if (!$psikolog) {
            return response()->json([
                'message' => 'Psikolog yang dipilih tidak ditemukan.',
            ], 422);
        }

        if (!$psikolog->is_available) {
            return response()->json([
                'message' => 'Psikolog yang dipilih sedang tidak tersedia. Silakan pilih psikolog lain.',
            ], 422);
        }

        $consultation = Consultation::create([
            'user_id' => $request->user()->id,
            'type' => 'psikolog',
            'q1' => $validated['q1'],
            'q2' => $validated['q2'],
            'q3' => $validated['q3'],
            'q4' => $validated['q4'],
            'q5' => $validated['q5'],
            'q6' => $validated['q6'],
            'q7' => $validated['q7'],
            'status' => 'pending',
            'psikolog_id' => $validated['psikolog_id'],
        ]);

        return response()->json([
            'message' => 'Konsultasi berhasil dikirim',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ], 201);
    }

    /**
     * Get a specific consultation
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::with(['user', 'psikolog', 'assignedTo'])->findOrFail($id);

        if ($this->isAdmin($user)) {
            return response()->json($consultation);
        }

        if ($consultation->user_id === $user->id) {
            return response()->json($consultation);
        }

        if ($this->isPsikolog($user) || $this->isAsisPsikolog($user)) {
            if ($consultation->psikolog_id === $user->id) {
                return response()->json($consultation);
            }
        }

        // Konsultan teknis bisa akses konsultasi teknis
        if ($this->isKonsultanTeknis($user) && $consultation->type === 'teknis') {
            // Bisa akses jika: unassigned, assigned ke mereka, atau sudah pernah reply
            $isUnassigned = is_null($consultation->assigned_to);
            $isAssignedToMe = $consultation->assigned_to === $user->id;

            if ($isUnassigned || $isAssignedToMe) {
                return response()->json($consultation);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Update consultation (only for psikolog/admin to add notes or change status)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$this->canHandleConsultation($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation = Consultation::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,reviewed,in_progress,completed,needs_referral',
            'notes' => 'sometimes|string|nullable',
            'psikolog_id' => 'sometimes|exists:users,id|nullable',
        ]);

        if ($this->canHandleConsultation($user)) {
            if ($consultation->psikolog_id !== null && $consultation->psikolog_id !== $user->id) {
                return response()->json(['message' => 'Laporan ini sudah ditangani oleh penanggungjawab lain'], 403);
            }

            // Asisten psikolog cannot change psikolog_id (only psikolog can reassign)
            if ($this->isAsisPsikolog($user)) {
                unset($validated['psikolog_id']);
            }

            if ($consultation->psikolog_id === null) {
                $validated['psikolog_id'] = $user->id;
            }
        }

        $consultation->update($validated);

        return response()->json([
            'message' => 'Konsultasi berhasil diperbarui',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ]);
    }

    /**
     * Update teknis consultation status (for Konsultan Teknis only)
     */
    public function updateTeknis(Request $request, $id)
    {
        $user = $request->user();

        // Only konsultan teknis or admin can update teknis consultations
        if (!$this->isKonsultanTeknis($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Hanya Konsultan Teknis yang dapat mengubah konsultasi teknis.'], 403);
        }

        $consultation = Consultation::findOrFail($id);

        // Only teknis type consultations
        if ($consultation->type !== 'teknis') {
            return response()->json(['message' => 'Konsultasi ini bukan tipe teknis.'], 403);
        }

        // Can only update if unassigned or assigned to current user
        $isUnassigned = is_null($consultation->assigned_to);
        $isAssignedToMe = $consultation->assigned_to === $user->id;

        if (!$isUnassigned && !$isAssignedToMe && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Konsultasi ini sudah ditangani oleh konsultan lain.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
            'notes' => 'sometimes|string|nullable',
        ]);

        // Auto-assign if unassigned
        if ($isUnassigned && !$this->isAdmin($user)) {
            $validated['assigned_to'] = $user->id;
        }

        $consultation->update($validated);

        return response()->json([
            'message' => 'Konsultasi teknis berhasil diperbarui',
            'consultation' => $consultation->load(['user', 'assignedTo'])
        ]);
    }

    /**
     * Assign a consultation to an Asisten Psikolog (only the owning Psikolog can do this)
     */
    public function assignToAssistant(Request $request, $id)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user)) {
            return response()->json(['message' => 'Hanya Psikolog yang dapat mendelegasikan konsultasi.'], 403);
        }

        $consultation = Consultation::findOrFail($id);

        // Only the psikolog currently assigned (or admin) may reassign
        if ($consultation->psikolog_id !== null && $consultation->psikolog_id !== $user->id) {
            return response()->json(['message' => 'Anda bukan penanggungjawab konsultasi ini.'], 403);
        }

        $validated = $request->validate([
            'assignee_id' => 'required|exists:users,id',
        ]);

        // Verify target is an asisten psikolog or the psikolog themselves (take back)
        $assignee = User::find($validated['assignee_id']);
        $assigneeRole = strtolower((string) ($assignee->status_pengguna ?? ''));
        if (!in_array($assigneeRole, ['asisten psikolog', 'psikolog'])) {
            return response()->json(['message' => 'Target penugasan harus Asisten Psikolog atau Psikolog.'], 422);
        }

        $consultation->update(['psikolog_id' => $validated['assignee_id']]);

        return response()->json([
            'message' => 'Konsultasi berhasil didelegasikan.',
            'consultation' => $consultation->load(['user', 'psikolog']),
        ]);
    }

    /**
     * Get list of Asisten Psikolog (for the assign dropdown)
     */
    public function assistants(Request $request)
    {
        if (!$this->isPsikolog($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assistants = User::query()
            ->whereRaw("LOWER(COALESCE(status_pengguna, '')) = ?", ['asisten psikolog'])
            ->select(['id', 'name', 'email', 'foto', 'is_available', 'organization_detail'])
            ->orderBy('name')
            ->get();

        return response()->json($assistants);
    }

    /**
     * Allow the consultation owner to mark a needs_referral consultation as completed.
     */
    public function markCompleted(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::findOrFail($id);

        if ($consultation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($consultation->status !== 'needs_referral') {
            return response()->json([
                'message' => 'Hanya konsultasi dengan status "Perlu Rujukan" yang dapat ditandai selesai.'
            ], 422);
        }

        $consultation->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Konsultasi berhasil ditandai selesai.',
            'consultation' => $consultation->load(['user', 'psikolog'])
        ]);
    }

    /**
     * Delete a consultation (only own consultations)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::findOrFail($id);

        if ($this->isAdmin($user)) {
            // Admin hard-deletes the record
            $consultation->delete();
            return response()->json(['message' => 'Konsultasi berhasil dihapus']);
        }

        if ($this->isPsikolog($user)) {
            if ($consultation->psikolog_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $consultation->update(['deleted_by_psikolog' => true]);

            // If both sides have deleted, hard-delete the record
            if ($consultation->deleted_by_user) {
                $consultation->delete();
            }

            return response()->json(['message' => 'Riwayat chat berhasil dihapus dari daftar Anda']);
        }

        if ($consultation->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation->update(['deleted_by_user' => true]);

        // If both sides have deleted, hard-delete the record
        if ($consultation->deleted_by_psikolog) {
            $consultation->delete();
        }

        return response()->json(['message' => 'Riwayat chat berhasil dihapus dari daftar Anda']);
    }

    /**
     * Get pending consultations (for psikolog/admin)
     */
    public function pending(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultationsQuery = Consultation::with(['user', 'psikolog'])
            ->where('status', 'pending');

        if ($this->isPsikolog($user)) {
            $consultationsQuery->where('psikolog_id', $user->id);
        }

        $consultations = $consultationsQuery
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($consultations);
    }

    public function psychologists(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $psychologists = $this->psikologBaseQuery()
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($psikolog) {
                return [
                    'id' => $psikolog->id,
                    'name' => $psikolog->name,
                    'email' => $psikolog->email,
                    'nip' => $psikolog->nip,
                    'no_wa' => $psikolog->no_wa,
                    'foto' => $psikolog->foto,
                    'organization_detail' => $psikolog->organization_detail,
                    'is_available' => (bool) $psikolog->is_available,
                    'availability_label' => $psikolog->is_available ? 'Tersedia' : 'Tidak Tersedia',
                ];
            });

        return response()->json($psychologists);
    }

    public function updateAvailability(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user)) {
            return response()->json(['message' => 'Hanya psikolog yang dapat mengubah status ketersediaan.'], 403);
        }

        $validated = $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $user->is_available = (bool) $validated['is_available'];
        $user->save();

        return response()->json([
            'message' => 'Status ketersediaan berhasil diperbarui.',
            'is_available' => (bool) $user->is_available,
            'availability_label' => $user->is_available ? 'Tersedia' : 'Tidak Tersedia',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAsisPsikolog($user) && !$this->isAdmin($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultations = $this->getExportableConsultations($user);

        $pdf = Pdf::loadView('exports.consultations', [
            'consultations' => $consultations,
            'generatedAt' => now(),
            'generatedBy' => $user,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-konsultasi-' . now()->format('Ymd-His') . '.pdf');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $user = $request->user();

        if (!$this->isPsikolog($user) && !$this->isAsisPsikolog($user) && !$this->isAdmin($user)) {
            abort(403, 'Unauthorized');
        }

        $consultations = $this->getExportableConsultations($user);
        $filename = 'laporan-konsultasi-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($consultations) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID Konsultasi',
                'Tanggal',
                'Nama Konsultan',
                'Email Konsultan',
                'Status',
                'Psikolog',
                'Keluhan (Q3)',
                'Catatan Psikolog',
            ]);

            foreach ($consultations as $consultation) {
                fputcsv($handle, [
                    $consultation->id,
                    optional($consultation->created_at)->format('Y-m-d H:i:s'),
                    $consultation->user->name ?? '-',
                    $consultation->user->email ?? '-',
                    $consultation->status,
                    $consultation->psikolog->name ?? '-',
                    trim((string) $consultation->q3),
                    trim((string) ($consultation->notes ?? '')),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
