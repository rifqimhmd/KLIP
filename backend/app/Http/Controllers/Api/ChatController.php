<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get message history for a consultation.
     * Allowed: the user who owns the consultation, the assigned psikolog, any admin.
     */
    public function index(Request $request, int $consultationId)
    {
        $user = $request->user();

        \Log::info('Chat index called', [
            'consultation_id' => $consultationId,
            'user_id' => $user?->id,
            'user_status' => $user?->status_pengguna,
            'auth_header' => $request->header('Authorization') ? 'Present' : 'Missing',
        ]);

        if (!$user) {
            \Log::error('No authenticated user');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $consultation = Consultation::findOrFail($consultationId);

        if (!$this->canAccess($user, $consultation)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = ChatMessage::with('sender')
            ->where('consultation_id', $consultationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($msg) => $this->formatMessage($msg));

        return response()->json($messages);
    }

    /**
     * Send a new message and broadcast it to all channel subscribers.
     */
    public function store(Request $request, int $consultationId)
    {
        $consultation = Consultation::findOrFail($consultationId);
        $user = $request->user();

        if (!$this->canAccess($user, $consultation)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // Auto-assign untuk konsultasi teknis yang belum diassign
        // ketika konsultan teknis mengirim pesan pertama
        if ($consultation->type === 'teknis' && is_null($consultation->assigned_to)) {
            $isKonsultanTeknis = strtolower((string) ($user->status_pengguna ?? '')) === 'konsultan teknis'
                || strtolower((string) ($user->daftar_sebagai ?? '')) === 'konsultan teknis'
                || str_contains(strtolower((string) ($user->status_pengguna ?? '')), 'konsultan')
                || str_contains(strtolower((string) ($user->daftar_sebagai ?? '')), 'konsultan');

            if ($isKonsultanTeknis && $consultation->user_id !== $user->id) {
                $consultation->update(['assigned_to' => $user->id]);
                \Log::info('Auto-assigned teknis consultation', [
                    'consultation_id' => $consultation->id,
                    'assigned_to' => $user->id,
                ]);
            }
        }

        $chatMessage = ChatMessage::create([
            'consultation_id' => $consultationId,
            'user_id'         => $user->id,
            'message'         => $validated['message'],
        ]);

        // Broadcast to all other subscribers on the private channel
        broadcast(new MessageSent($chatMessage))->toOthers();

        return response()->json($this->formatMessage($chatMessage), 201);
    }

    /**
     * End a chat session by marking the consultation as completed.
     * Allowed: the user who owns it, the assigned psikolog, or any admin.
     */
    public function endChat(Request $request, int $consultationId)
    {
        $consultation = Consultation::findOrFail($consultationId);
        $user = $request->user();

        if (!$this->canAccess($user, $consultation)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $consultation->update(['status' => 'completed']);

        return response()->json([
            'message'      => 'Sesi chat telah diakhiri.',
            'consultation' => $consultation->load(['user', 'psikolog']),
        ]);
    }

    /**
     * Get chat statistics per psikolog (admin only).
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->status_pengguna !== 'Admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Active chats: consultations with psikolog assigned and status not completed
        $activeChats = Consultation::with(['psikolog'])
            ->whereNotNull('psikolog_id')
            ->where('status', '!=', 'completed')
            ->get()
            ->groupBy('psikolog_id')
            ->map(function ($group) {
                $psikolog = $group->first()->psikolog;
                return [
                    'psikolog_id'   => $psikolog?->id,
                    'psikolog_name' => $psikolog?->name ?? '-',
                    'active_chats'  => $group->count(),
                ];
            })
            ->values();

        $completedTotal = Consultation::where('status', 'completed')
            ->whereNotNull('psikolog_id')
            ->count();

        $activeTotal = Consultation::whereNotNull('psikolog_id')
            ->where('status', '!=', 'completed')
            ->count();

        return response()->json([
            'active_total'    => $activeTotal,
            'completed_total' => $completedTotal,
            'per_psikolog'    => $activeChats,
        ]);
    }

    /**
     * Delete a single message.
     * Allowed: the sender of the message, or any admin.
     */
    public function destroyMessage(Request $request, int $consultationId, int $messageId)
    {
        $consultation = Consultation::findOrFail($consultationId);
        $user = $request->user();

        if (!$this->canAccess($user, $consultation)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message = ChatMessage::where('consultation_id', $consultationId)
            ->where('id', $messageId)
            ->firstOrFail();

        if ($message->user_id !== $user->id && $user->status_pengguna !== 'Admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Pesan berhasil dihapus']);
    }

    /**
     * Delete all messages in a consultation room.
     * Allowed: the user or psikolog who owns the consultation, or any admin.
     */
    public function destroyAllMessages(Request $request, int $consultationId)
    {
        $consultation = Consultation::findOrFail($consultationId);
        $user = $request->user();

        if (!$this->canAccess($user, $consultation)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        ChatMessage::where('consultation_id', $consultationId)->delete();

        return response()->json(['message' => 'Semua pesan berhasil dihapus']);
    }

    private function canAccess($user, Consultation $consultation): bool
    {
        // Log untuk debug
        \Log::info('Checking chat access', [
            'user_id' => $user->id,
            'user_status' => $user->status_pengguna,
            'user_daftar_sebagai' => $user->daftar_sebagai ?? null,
            'consultation_id' => $consultation->id,
            'consultation_type' => $consultation->type,
            'consultation_user_id' => $consultation->user_id,
            'consultation_assigned_to' => $consultation->assigned_to,
        ]);

        // Admin bisa akses semua
        if ($user->status_pengguna === 'Admin') {
            \Log::info('Access granted: Admin');
            return true;
        }

        // User pemilik konsultasi selalu bisa akses
        if ($consultation->user_id === $user->id) {
            \Log::info('Access granted: Owner');
            return true;
        }

        // Konsultasi psikolog: psikolog yang ditugaskan bisa akses
        if ($consultation->type === 'psikolog' || $consultation->psikolog_id) {
            $granted = $consultation->psikolog_id === $user->id;
            \Log::info('Psikolog access check', ['granted' => $granted]);
            return $granted;
        }

        // Konsultasi teknis: konsultan teknis bisa akses
        if ($consultation->type === 'teknis') {
            // Cek apakah user adalah konsultan teknis (case insensitive)
            $statusPengguna = strtolower((string) ($user->status_pengguna ?? ''));
            $daftarSebagai = strtolower((string) ($user->daftar_sebagai ?? ''));

            $isKonsultanTeknis = $statusPengguna === 'konsultan teknis'
                || $daftarSebagai === 'konsultan teknis'
                || str_contains($statusPengguna, 'konsultan')
                || str_contains($daftarSebagai, 'konsultan');

            \Log::info('Konsultan teknis check', [
                'isKonsultanTeknis' => $isKonsultanTeknis,
                'statusPengguna' => $statusPengguna,
                'daftarSebagai' => $daftarSebagai,
            ]);

            // Konsultan teknis bisa akses konsultasi teknis yang:
            // 1. Belum diassign (unassigned)
            // 2. Sudah diassign ke mereka
            // 3. Sudah ada chat message dari mereka sebelumnya
            if ($isKonsultanTeknis) {
                // Cek apakah sudah pernah chat di konsultasi ini
                $hasReplied = ChatMessage::where('consultation_id', $consultation->id)
                    ->where('user_id', $user->id)
                    ->exists();

                $isUnassigned = is_null($consultation->assigned_to);
                $isAssignedToMe = $consultation->assigned_to === $user->id;

                $granted = $isUnassigned || $isAssignedToMe || $hasReplied;

                \Log::info('Access check result', [
                    'isUnassigned' => $isUnassigned,
                    'isAssignedToMe' => $isAssignedToMe,
                    'hasReplied' => $hasReplied,
                    'granted' => $granted,
                ]);

                return $granted;
            }
        }

        \Log::info('Access denied');
        return false;
    }

    private function formatMessage(ChatMessage $msg): array
    {
        return [
            'id'              => $msg->id,
            'consultation_id' => $msg->consultation_id,
            'user_id'         => $msg->user_id,
            'message'         => $msg->message,
            'sender'          => [
                'id'              => $msg->sender->id,
                'name'            => $msg->sender->name,
                'status_pengguna' => $msg->sender->status_pengguna,
            ],
            'created_at' => $msg->created_at->toISOString(),
        ];
    }
}
