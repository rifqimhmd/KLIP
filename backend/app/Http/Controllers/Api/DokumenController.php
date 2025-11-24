<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DokumenResource;
use App\Models\Dokumen;
use Illuminate\Http\Request;

class DokumenController extends Controller
{
    /**
     * index
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $dokumens = Dokumen::all();
        return new DokumenResource(true, 'Data List Banners', $dokumens);
    }
}
