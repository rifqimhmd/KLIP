<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use App\Http\Resources\BannerResource;

class BannerController extends Controller
{
    /**
     * index
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $banners = Banner::latest()->paginate(3);
        return new BannerResource(true, 'Data List Banners', $banners);
    }
}
