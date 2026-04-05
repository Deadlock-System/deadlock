import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from '../pages/Register/Register';
import Login from '../pages/Login/Login';
import { FeedPage } from '../pages/FeedPage';
import { PostView } from '../pages/PostView';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/postview/:id" element={<PostView />} />
      </Routes>
    </BrowserRouter>
  );
}
