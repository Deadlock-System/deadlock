import { useEffect, useState } from 'react';
import { Header } from '../components/shared/Header';
import { PostCard } from '../components/shared/PostCard';
import { Sidebar } from '../components/shared/Sidebar';
import { postService } from '../shared/services/PostService';
import { ButtonPagination } from '../components/shared/ButtonPagination';
import type { PaginationMeta } from '../types/PaginationType';
import { resolveAvatarSrc, useAvatarsData } from '../utils/avatar';

export function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const avatarsData = useAvatarsData();

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await postService.getPosts(page);
        setPosts(data.data);
        setMeta(data.meta);
      } catch (err) {
        console.error('Erro ao buscar os posts: ', err);
      }
    }

    loadPosts();
  }, [page]);

  useEffect(() => {
    if (posts.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [posts]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            {posts.length === 0 && (
              <p className="text-gray-500 flex items-center justify-center min-h-[60vh] text-2xl">
                Nenhuma publicação encontrada!
              </p>
            )}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
              {posts
                .filter((post: any) => post?.content !== '[[DELETED]]')
                .map((post: any) => {
                const storedPhotoUrl = post.anonymous
                  ? null
                  : (post.user?.user_photo ?? post.user?.userPhoto ?? null);
                const avatarSrc = resolveAvatarSrc({
                  avatars: avatarsData.avatars,
                  avatarsById: avatarsData.avatarsById,
                  storedPhotoUrl,
                });

                return (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    username={post.anonymous ? 'anonimo' : post.user?.user_name ?? 'usuario'}
                    title={post.title}
                    content={post.content}
                    avatarSrc={avatarSrc}
                    languages={Array.isArray(post.languages) ? post.languages : []}
                  />
                );
              })}
            </div>
            {meta && meta.totalPages > 1 && (
              <ButtonPagination
                meta={meta}
                onPageChange={(newPage) => {
                  setPage(newPage);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
