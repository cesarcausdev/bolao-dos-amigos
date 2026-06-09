import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { BolaoCard } from './BolaoCard';
import { api } from '../services/api';
import type { Bolao, Screen } from './types';

interface BolaoesListProps {
  boloes?: Bolao[];
  onNavigate: (screen: Screen, data?: unknown) => void;
  embedded?: boolean;
}

export function BoloesList({ boloes: propBoloes, onNavigate, embedded = false }: BolaoesListProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [boloes, setBoloes] = useState<Bolao[]>(propBoloes ?? []);
  const [loading, setLoading] = useState(!propBoloes);

  useEffect(() => {
    if (propBoloes !== undefined) {
      setBoloes(propBoloes);
      return;
    }
    api.boloes.getAll()
      .then(setBoloes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propBoloes]);

  const filtered = boloes.filter(b => {
    const matchSearch = search === '' ||
      b.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      b.awayTeam.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'open' && (b.status === 'Aberto' || b.status === 'Em Andamento')) ||
      (filter === 'closed' && b.status === 'Encerrado');
    return matchSearch && matchFilter;
  });

  return (
    <div className={embedded ? '' : 'flex flex-col min-h-screen pb-20'} style={embedded ? {} : { background: '#0F172A' }}>
      {!embedded && (
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Bolões</h1>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#22C55E' }}>
              <Plus size={18} style={{ color: '#0F172A' }} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Faça seus palpites</p>
        </div>
      )}

      <div className={embedded ? '' : 'px-5'}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={16} style={{ color: '#94A3B8' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar partida..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#FFFFFF' }}
          />
        </div>

        <div className="flex gap-2 mb-4">
          {[{ id: 'all', label: 'Todos' }, { id: 'open', label: 'Abertos' }, { id: 'closed', label: 'Encerrados' }].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: filter === f.id ? '#22C55E' : '#1E293B', color: filter === f.id ? '#0F172A' : '#94A3B8' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-3xl animate-spin">⚽</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">⚽</span>
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Nenhum bolão encontrado</p>
          </div>
        ) : (
          filtered.map((b, i) => <BolaoCard key={b.id} bolao={b} onNavigate={onNavigate} index={i} />)
        )}
      </div>
    </div>
  );
}
