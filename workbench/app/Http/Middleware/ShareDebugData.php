<?php

namespace Workbench\App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShareDebugData
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (config('app.debug') && $request->header('X-Inertia')) {
            $queries = DB::getQueryLog();
            
            $debugData = [
                'queries' => array_map(function ($query) {
                    return [
                        'sql' => $query['query'],
                        'bindings' => $query['bindings'],
                        'duration' => $query['time'],
                    ];
                }, $queries),
                'memory' => [
                    'peak_usage' => memory_get_peak_usage(true),
                    'peak_usage_str' => $this->formatBytes(memory_get_peak_usage(true)),
                ],
            ];

            if (method_exists($response, 'with')) {
                $response->with('debugData', $debugData);
            }
        }

        return $response;
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
