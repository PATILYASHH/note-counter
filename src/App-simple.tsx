import { useState } from 'react';

function App() {
  const [test] = useState('App is working!');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-center">{test}</h1>
      <p className="text-center mt-4">If you can see this, React is working properly.</p>
    </div>
  );
}

export default App;
