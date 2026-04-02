import { useEffect, useState } from 'react';
import { Header } from '../../../components/shared/Header';
import {
  PostCard,
  type PostCardProps,
} from '../../../components/shared/PostCard';
import { Sidebar } from '../../../components/shared/Sidebar';
import { postService } from '../../../shared/services/PostService';

export function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await postService.getPosts();
        console.log('data', data);
        setPosts(data.data);
      } catch (err) {
        console.error('Erro ao buscar os posts: ', err);
      }
    }

    loadPosts();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 md:ml-20">
            {posts.length === 0 && (
              <p className="text-gray-500 flex items-center justify-center min-h-[60vh] text-2xl">
                Nenhuma publicação encontrada!
              </p>
            )}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
              {posts.map((post: any) => (
                <PostCard
                  username={post.user.user_name}
                  title={post.title}
                  content={post.content}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
