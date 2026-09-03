import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Category {
  id: string;
  name: string;
}

export function ShowForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [section, setSection] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await apiClient('/categories');
        setAvailableCategories(cats);

        if (isEditing) {
          const show = await apiClient(`/shows/${id}`);
          setTitle(show.title);
          setSlug(show.slug);
          setSection(show.section || '');
          setSynopsis(show.synopsis || '');
          setStatus(show.status);
          setSelectedCategories(show.categories?.map((c: any) => c.id) || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const data = {
      title,
      slug,
      section: section || null,
      synopsis: synopsis || null,
      status,
      category_ids: selectedCategories,
    };

    try {
      if (isEditing) {
        await apiClient(`/shows/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiClient('/shows', { method: 'POST', body: JSON.stringify(data) });
      }
      navigate('/shows');
    } catch (err: any) {
      setError(err.message || 'Failed to save show');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>{isEditing ? 'Edit Show' : 'Create Show'}</h1>
      
      <Card style={{ maxWidth: '600px' }}>
        {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} required />
          <Input label="Section" value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. series" />
          
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Synopsis</label>
            <textarea 
              value={synopsis} 
              onChange={e => setSynopsis(e.target.value)} 
              rows={4}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {availableCategories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/shows')} disabled={saving}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
