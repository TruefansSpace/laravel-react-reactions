import { Head, Link, router, usePage } from '@inertiajs/react';
import Reactions from 'package/Components/Reactions';
import Comments from 'package/Components/Comments';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function TestPage({ posts }) {
    const { auth } = usePage().props;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <>
            <Head title="Reactions Demo" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Reactions Demo</h1>
                                <p className="text-sm text-gray-500 mt-1">Facebook-like reaction system</p>
                            </div>
                            
                            {auth?.user ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                                            <p className="text-xs text-gray-500">{auth.user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Login to React
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 py-8">
                    {!auth?.user && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-xl">💡</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-amber-900 mb-1">Login Required</h3>
                                    <p className="text-sm text-amber-800">
                                        You need to be logged in to add reactions to posts.{' '}
                                        <Link href="/login" className="underline font-medium hover:text-amber-900">
                                            Click here to login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts Grid */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {post.content}
                                    </p>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <Reactions
                                            reactableType={post.constructor.name === 'Object' ? 'Workbench\\App\\Models\\TestPost' : post.constructor.name}
                                            reactableId={post.id}
                                            initialReactions={post.reactions_summary || {}}
                                            userReaction={post.user_reaction}
                                            onUserClick={(userId) => {
                                                console.log('User clicked from TestPage:', userId);
                                                // You can add custom logic here, e.g.:
                                                // router.visit(`/users/${userId}`);
                                            }}
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 mt-6">
                                        <Comments
                                            commentableType="Workbench\\App\\Models\\TestPost"
                                            commentableId={post.id}
                                            initialComments={post.comments || []}
                                            reactionsEnabled={true}
                                            currentUserId={auth?.user?.id}
                                            onUserClick={(userId) => {
                                                console.log('User clicked from comment:', userId);
                                            }}
                                        />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <span className="text-3xl">📝</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                            <p className="text-gray-500">Check back later for new content!</p>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
                    <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
                        <p>Built with Laravel, Inertia.js, React & shadcn/ui</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
