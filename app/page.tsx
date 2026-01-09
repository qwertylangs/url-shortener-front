'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Url } from './lib/api';

export default function Home() {
  const router = useRouter();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    checkAuthAndLoadUrls();
    // Устанавливаем baseUrl после монтирования на клиенте
    setBaseUrl(window.location.origin);
  }, []);

  const checkAuthAndLoadUrls = async () => {
    try {
      const authResponse = await api.checkAuth();
      
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }

      await loadUrls();
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  const loadUrls = async () => {
    try {
      setLoading(true);
      const data = await api.getUrls();
      setUrls(data.urls || []);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки ссылок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const response = await api.createUrl({ url: newUrl, alias: newAlias });
      
      if (response.ok) {
        setNewUrl('');
        setNewAlias('');
        await loadUrls();
      } else {
        const data = await response.json().catch(() => ({}));
        setCreateError(data.error || 'Ошибка создания алиаса');
      }
    } catch (err) {
      setCreateError('Ошибка соединения с сервером');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShortUrl = (alias: string) => {
    return baseUrl ? `${baseUrl}/api/${alias}` : `/api/${alias}`;
  };

  const copyToClipboard = async (alias: string, id: number) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(alias));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔗 Сокращатель ссылок
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Создавайте короткие алиасы для ваших ссылок
          </p>
        </div>

        {/* Create URL Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Создать новый алиас
          </h2>
          
          <form onSubmit={handleCreateUrl} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Алиас
              </label>
              <input
                id="alias"
                type="text"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                required
                placeholder="my-link"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {createError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              {creating ? 'Создание...' : 'Создать алиас'}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Мои алиасы
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Каждый алиас доступен по адресу: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-purple-600 dark:text-purple-400">{baseUrl || 'host'}/api/&#123;alias&#125;</code>
          </p>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                У вас пока нет алиасов. Создайте первый!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {urls.map((url) => (
                <div
                  key={url.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-purple-600 dark:text-purple-400 truncate mb-1">
                        {url.alias}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={getShortUrl(url.alias)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {getShortUrl(url.alias)}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.alias, url.id)}
                          className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          title="Копировать ссылку"
                        >
                          {copiedId === url.id ? (
                            <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-xs">→</span>
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {url.url}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Создано: {formatDate(url.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
