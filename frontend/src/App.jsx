import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-dark-300">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/chat" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/chat" />}
          />
          <Route
            path="/chat"
            element={user ? <Chat /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/chat" : "/login"} />}
          />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
