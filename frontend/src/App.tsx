import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Project from './components/Project';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/project/:projectId" element={<Project />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
