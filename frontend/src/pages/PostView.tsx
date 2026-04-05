import { useLocation, useParams } from 'react-router-dom';
import {
  CommentCard,
  type CommentCardProps,
} from '../components/shared/CommentCard';
import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  Eye,
  MessageSquareMore,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { postService } from '../shared/services/PostService';

export function PostView() {
  const { id } = useParams();
  const location = useLocation();
  const { title, content } = location.state || {};
  const [comments, setComments] = useState<CommentCardProps[]>([]);
  const [newComment, setNewComment] = useState('');

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      const data = {
        content: newComment,
        anonymous: false,
      };

      await postService.addComments(id!, data);
      window.location.reload();
    } catch (err) {
      console.error('Erro ao adicionar conmentário: ', err);
    }
  }

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await postService.getCommentsByPostId(id!);
        setComments(data);
      } catch (err) {
        console.error('Erro ao buscar os comentários: ', err);
      }
    }

    loadComments();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
              <div className="w-full rounded-3xl border border-zinc-200 bg-default-color p-6 flex flex-col gap-3">
                <span className="text-main-color text-2xl">{title}</span>
                <div className="border-t border-main-color" />

                <span className="text-main-color">{content}</span>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-main-color w-max">
                  <button className="active:scale-92 transition-colors group">
                    <ArrowBigUp
                      className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                      fill={false ? '#263F4C' : 'none'}
                      onClick={() => {}}
                    />
                  </button>

                  <p className="text-sm font-medium leading-none">400</p>

                  <button className="active:scale-92 transition-colors group">
                    <ArrowBigDown
                      className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                      fill={false ? '#263F4C' : 'none'}
                      onClick={() => {}}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-main-color">
                  <button className="p-1 group active:scale-92">
                    <MessageSquareMore className="group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer" />
                  </button>
                  <span className="text-sm text-main-color">42</span>
                </div>

                <div className="flex items-center gap-1 text-main-color">
                  <Eye />
                  <span className="text-sm">1.200</span>
                </div>

                <p className="text-sm text-main-color ml-4 ">Há 4 dias</p>

                <button className="ml-auto p-2 active:scale-92 transition-colors group">
                  <Bookmark
                    size={22}
                    className="text-main-color group-hover:text-main-color group-hover:scale-120 transition-all cursor-pointer"
                  />
                </button>
              </div>

              <div className="border-t border-second" />
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-1 space-y-8">
              <div className="w-full rounded-3xl border border-main-color bg-default-color p-4 flex flex-col gap-2">
                <textarea
                  className="w-full rounded-xl border border-zinc-300 p-3 focus:outline-none focus:ring-1 focus:ring-main-color resize-none"
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    className="bg-main-color text-white px-4 py-2 rounded-xl hover:bg-main-color/90 transition-colors cursor-pointer"
                    onClick={handleAddComment}
                  >
                    Comentar
                  </button>
                </div>
              </div>

              {comments.map((comment: CommentCardProps) => (
                <CommentCard content={comment.content} user={comment.user} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
