import { Header } from '../../../components/shared/Header';
import { PostCard } from '../../../components/shared/PostCard';
import { Sidebar } from '../../../components/shared/Sidebar';

export function FeedPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <PostCard />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
