import React, { useEffect, useState } from 'react';
import { API_BASE } from '../App';
import axios from 'axios';
import FaqChat from '../components/FaqChat';

export default function FAQs() {
  const [page, setPage] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/cms/pages/faqs`).then(({ data }) => setPage(data.data)).catch(() => setPage(null));
    axios.get(`${API_BASE}/cms/pages`).then(() => {}).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-stone-800">FAQs</h1>
      {page?.content && (
        <div className="prose prose-stone mb-8 max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      <FaqChat />
    </div>
  );
}
