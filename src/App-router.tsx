import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold text-center">Note Counter</h1>
            <p className="text-center mt-4">Basic routing is working!</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
