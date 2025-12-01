import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Query {
    sql: string;
    duration: string;
}

interface DebugData {
    queries?: Query[];
    memory?: {
        peak_usage_str?: string;
    };
}

declare global {
    interface Window {
        phpdebugbar?: {
            openHandler?: {
                load: (callback: (data: DebugData) => void) => void;
            };
        };
    }
}

export default function DebugPanel() {
    const [debugData, setDebugData] = useState<DebugData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if debugbar data is available
        const checkDebugbar = () => {
            if (window.phpdebugbar) {
                const openHandler = window.phpdebugbar.openHandler;
                if (openHandler) {
                    openHandler.load((data: DebugData) => {
                        setDebugData(data);
                    });
                }
            }
        };

        // Try immediately and after a short delay
        checkDebugbar();
        const timer = setTimeout(checkDebugbar, 500);

        return () => clearTimeout(timer);
    }, []);

    if (!debugData) return null;

    const queries = debugData.queries || [];
    const queryCount = queries.length;
    const totalTime = queries.reduce((sum, q) => sum + (parseFloat(q.duration) || 0), 0);
    const memory = debugData.memory?.peak_usage_str || 'N/A';

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="shadow-lg"
                    variant="default"
                >
                    🐛 Debug ({queryCount} queries)
                </Button>
            ) : (
                <Card className="w-96 max-h-96 overflow-auto p-4 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Debug Info</h3>
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            size="sm"
                        >
                            ✕
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="text-sm font-semibold">Database Queries</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {queryCount}
                            </div>
                            <div className="text-xs text-gray-500">
                                Total time: {totalTime.toFixed(2)}ms
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-semibold">Memory Usage</div>
                            <div className="text-lg">{memory}</div>
                        </div>

                        {queries.length > 0 && (
                            <div>
                                <div className="text-sm font-semibold mb-2">Recent Queries</div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {queries.slice(0, 5).map((query, idx) => (
                                        <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                            <div className="font-mono text-gray-700 truncate">
                                                {query.sql}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                {query.duration}ms
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
