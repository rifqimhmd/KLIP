<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * index
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $videos = Video::latest()->get();
        return new VideoResource(true, 'Data List Videos', $videos);
    }
}
