import React, { useState } from 'react';
import { API_BASE } from '../app';
import axios from 'axios';

export default function FaqChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    axios
      .post(`${API_BASE}/faq/chat`, { question: question.trim() })
      .then(({ data }) => setAnswer(data.answer))
      .catch(() => setAnswer('Sorry, something went wrong. Please try again.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-stone-800">Ask a question</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How far in advance should I book?"
          className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </form>
      {answer && (
        <div className="mt-4 rounded-lg bg-stone-100 p-4 text-stone-700">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  );
}
