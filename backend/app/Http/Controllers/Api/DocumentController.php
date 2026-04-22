<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        return ($user->status_pengguna ?? null) === 'Admin'
            || strtolower((string) ($user->daftar_sebagai ?? '')) === 'admin';
    }

    /**
     * Admin documents index - Get all documents for admin dashboard
     */
    public function adminIndex(Request $request)
    {
        $documents = Document::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'documents' => $documents,
            'total' => $documents->count(),
            'published' => $documents->where('status', 'published')->count(),
            'pending' => $documents->where('status', 'pending')->count(),
        ]);
    }

    /**
     * Display a listing of the resource.
     * Public can see published documents, authenticated users can see their own drafts
     */
    public function index(Request $request)
    {
        // Admin sees every document regardless of status
        if ($this->isAdmin($request->user())) {
            $query = Document::with('user');

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            if ($request->has('sub_category')) {
                $query->where('sub_category', $request->sub_category);
            }
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            return response()->json($query->orderBy('created_at', 'desc')->get());
        }

        // Public / regular users: only published documents
        $query = Document::where('status', 'published')->with('user');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('sub_category')) {
            $query->where('sub_category', $request->sub_category);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Also show authenticated user's own drafts
        if ($request->user()) {
            $query->orWhere(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->where('status', 'draft');
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created document (Admin only)
     */
    public function store(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can add documents'], 403);
        }

        \Log::info('Document store payload:', $request->all());
        \Log::info('Has file?', ['file' => $request->hasFile('file')]);
        \Log::info('Files:', $request->allFiles());

        // Handle cover: uploaded file takes priority over URL string
        if ($request->hasFile('cover')) {
            $request->validate(['cover' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120']);
            $coverPath = $request->file('cover')->store('documents/covers', 'public');
            $coverValue = Storage::disk('public')->url($coverPath);
        } else {
            $coverValue = $request->input('cover') ?? null;
        }

        // Handle document file: uploaded file takes priority over URL string
        $fileValue = null;
        if ($request->hasFile('file')) {
            $request->validate(['file' => 'file|mimes:pdf,doc,docx,xlsx,xls,pptx,ppt|max:20480']);
            $filePath = $request->file('file')->store('documents', 'public');
            $fileValue = Storage::disk('public')->url($filePath);
        } else {
            $fileValue = $request->input('file') ?: null;
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'category'    => 'required|string|in:peraturan,ebook,edukasi',
            'sub_category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'required|string|in:pdf,video,ebook,other',
            'video_url'   => 'nullable|url',
        ]);

        $document = Document::create([
            'user_id'      => $request->user()->id,
            'title'        => $validated['title'],
            'category'     => $validated['category'],
            'sub_category' => $validated['sub_category'],
            'cover'        => $coverValue,
            'file'         => $fileValue,
            'description'  => $validated['description'] ?? null,
            'type'         => $validated['type'],
            'video_url'    => $validated['video_url'] ?? null,
            'status'       => 'published',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data'    => $document->load('user'),
        ], 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        return response()->json($document->load('user'));
    }

    /**
     * Update the specified resource in storage (Admin only)
     */
    public function update(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can update documents'], 403);
        }

        $document = Document::find($id);

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        // Handle cover file or URL first
        $coverValue = null;
        if ($request->hasFile('cover')) {
            $request->validate(['cover' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120']);
            $coverPath = $request->file('cover')->store('documents/covers', 'public');
            $coverValue = Storage::disk('public')->url($coverPath);
        } elseif ($request->has('cover')) {
            $coverValue = $request->input('cover') ?: null;
        }

        // Handle document file or URL first
        $fileValue = null;
        if ($request->hasFile('file')) {
            $request->validate(['file' => 'file|mimes:pdf,doc,docx,xlsx,xls,pptx,ppt|max:20480']);
            $filePath = $request->file('file')->store('documents', 'public');
            $fileValue = Storage::disk('public')->url($filePath);
        } elseif ($request->has('file')) {
            $fileValue = $request->input('file') ?: null;
        }

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'category'    => 'sometimes|string|in:peraturan,ebook,edukasi',
            'sub_category' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'sometimes|string|in:pdf,video,ebook,other',
            'video_url'   => 'nullable|url',
        ]);

        if ($coverValue !== null) {
            $validated['cover'] = $coverValue;
        }
        if ($fileValue !== null) {
            $validated['file'] = $fileValue;
        }

        $document->update($validated);

        return response()->json([
            'message' => 'Document updated successfully',
            'data'    => $document->load('user'),
        ]);
    }

    /**
     * Remove the specified resource from storage (Admin only)
     */
    public function destroy(Request $request, string $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can delete documents'], 403);
        }

        $document = Document::find($id);

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }

    /**
     * Approve a document (Admin only)
     */
    public function approve(Request $request, string $id)
    {
        // Check if user is admin
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can approve documents'], 403);
        }

        $document = Document::find($id);

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        $document->update(['status' => 'published', 'rejection_reason' => null]);

        return response()->json([
            'message' => 'Document approved successfully',
            'data' => $document->load('user'),
        ]);
    }

    /**
     * Reject a document (Admin only)
     */
    public function reject(Request $request, string $id)
    {
        // Check if user is admin
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can reject documents'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $document = Document::find($id);

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        $document->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);

        return response()->json([
            'message' => 'Document rejected successfully',
            'data' => $document->load('user'),
        ]);
    }

    /**
     * Get pending documents (Admin only)
     */
    public function pending(Request $request)
    {
        // Check if user is admin
        if (!$this->isAdmin($request->user())) {
            return response()->json(['error' => 'Only admin can view pending documents'], 403);
        }

        $documents = Document::where('status', 'draft')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }
}