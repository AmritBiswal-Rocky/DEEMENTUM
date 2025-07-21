// src/components/PredictionComponent.jsx
import React, { useState } from 'react';
import { signInWithGoogle, generateFirebaseToken } from '../firebaseClient';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa'; // ✅ spinner icon

const PredictionComponent = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    await signInWithGoogle();
    toast.success('✅ Logged in!');
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const idToken = await generateFirebaseToken();
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/predict`,
        { task_description: input },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setResult(data);
    } catch (err) {
      toast.error('❌ Prediction failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">AI Prediction</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full border rounded p-3"
        placeholder="Describe your task..."
      />

      <button
        disabled={!input || loading}
        onClick={handlePredict}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
      >
        {loading ? <FaSpinner className="animate-spin" /> : '🔮 Predict'}
      </button>

      {!result && (
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
        >
          🔑 Login with Google to Predict
        </button>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PredictionComponent;
