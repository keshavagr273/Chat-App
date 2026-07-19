import { useState, useEffect } from 'react';
import api from '../utils/api';

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPreview = async () => {
      try {
        const { data } = await api.get(`/preview?url=${encodeURIComponent(url)}`, {
          signal: controller.signal
        });
        setPreview(data);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Failed to fetch link preview:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();

    return () => controller.abort(); // cancel on unmount or url change
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 w-full max-w-[300px] h-20 bg-black/20 rounded-xl animate-pulse"></div>
    );
  }

  if (!preview || (!preview.title && !preview.description && !preview.image)) {
    return null;
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer"
      className="mt-2 block w-full max-w-[320px] bg-black/20 hover:bg-black/30 border border-black/10 rounded-xl overflow-hidden transition-colors"
    >
      {preview.image && (
        <img 
          src={preview.image} 
          alt={preview.title} 
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-3">
        <h4 className="font-semibold text-sm truncate">{preview.title || url}</h4>
        {preview.description && (
          <p className="text-xs opacity-70 mt-1 line-clamp-2 leading-snug">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default LinkPreview;
