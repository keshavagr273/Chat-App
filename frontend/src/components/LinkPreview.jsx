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

    return () => controller.abort();
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 w-full max-w-[320px] h-20 bg-surface-container-highest/50 border border-border-glass rounded-xl animate-pulse"></div>
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
      className="mt-2 block w-full max-w-[320px] bg-surface-container-highest/60 hover:bg-surface-container-highest border border-border-glass rounded-xl overflow-hidden transition-all duration-200 group"
    >
      {preview.image && (
        <div className="w-full h-32 overflow-hidden bg-surface-container-lowest relative">
          <img 
            src={preview.image} 
            alt={preview.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-display font-semibold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
          {preview.title || url}
        </h4>
        {preview.description && (
          <p className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default LinkPreview;
