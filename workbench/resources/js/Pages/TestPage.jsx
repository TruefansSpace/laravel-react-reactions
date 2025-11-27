import React from 'react';
import { Head } from '@inertiajs/react';
import Reactions from 'package/Components/Reactions';

export default function TestPage({ post }) {
    return (
        <>
            <Head title="Test Reactions" />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                        <p className="text-gray-700 mb-6">{post.content}</p>
                        
                        <div className="border-t pt-4">
                            <Reactions
                                reactableType="Workbench\\App\\Models\\TestPost"
                                reactableId={post.id}
                                initialReactions={post.reactions_summary || {}}
                                userReaction={post.user_reaction}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
