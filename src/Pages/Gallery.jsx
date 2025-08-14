import React, { useState, useEffect } from 'react';
import { DFA } from '../entities/DFA';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Eye, Trash2, Search, Plus, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';

export default function Gallery() {
  const [dfas, setDfas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDFAs();
  }, []);

  const loadDFAs = async () => {
    setIsLoading(true);
    try {
      const data = await DFA.list('-created_date');
      setDfas(data || []);
    } catch (error) {
      console.error('Error loading DFAs:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteTarget({ id, name });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DFA.delete(deleteTarget.id);
      setDfas(prev => prev.filter(d => d.id !== deleteTarget.id));
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting DFA:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDFAs = (dfas || []).filter(dfa =>
    (dfa.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dfa.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDFAPreview = (dfa) => {
    return (
      <div className="w-full h-32 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 200 100">
          {dfa.states?.slice(0, 4).map((state, index) => (
            <g key={state.id}>
              <circle
                cx={50 + index * 40}
                cy={50}
                r="15"
                fill={state.type === 'start' ? '#fef3c7' : state.type === 'accept' ? '#dcfce7' : '#f8fafc'}
                stroke={state.type === 'start' ? '#f59e0b' : state.type === 'accept' ? '#10b981' : '#94a3b8'}
                strokeWidth="2"
              />
              <text
                x={50 + index * 40}
                y={55}
                textAnchor="middle"
                className="text-xs font-medium"
                fill="#475569"
              >
                {state.label}
              </text>
            </g>
          ))}

          {dfa.transitions?.slice(0, 3).map((transition, index) => {
            const fromState = dfa.states?.find(s => s.id === transition.from);
            const toState = dfa.states?.find(s => s.id === transition.to);
            if (!fromState || !toState) return null;

            const fromIndex = dfa.states.slice(0, 4).findIndex(s => s.id === fromState.id);
            const toIndex = dfa.states.slice(0, 4).findIndex(s => s.id === toState.id);

            if (fromIndex === -1 || toIndex === -1) return null;

            return (
              <line
                key={index}
                x1={50 + fromIndex * 40}
                y1={50}
                x2={50 + toIndex * 40}
                y2={50}
                stroke="#64748b"
                strokeWidth="1"
                markerEnd="url(#arrowhead-mini)"
              />
            );
          })}

          <defs>
            <marker
              id="arrowhead-mini"
              markerWidth="6"
              markerHeight="4"
              refX="5"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 6 2, 0 4" fill="#64748b" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">DFA Gallery</h1>
            <p className="text-slate-600">Browse and manage your saved Deterministic Finite Automata</p>
          </div>

          <Link to={createPageUrl("Visualizer")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New DFA
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search DFAs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* DFA Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-slate-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDFAs.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {searchTerm ? 'No DFAs found' : 'No DFAs created yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first Deterministic Finite Automaton'
              }
            </p>
            {!searchTerm && (
              <Link to={createPageUrl("Visualizer")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First DFA
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDFAs.map((dfa, index) => (
              <motion.div
                key={dfa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dfa.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {dfa.states?.length || 0} states
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {dfa.alphabet?.length || 0} symbols
                      </Badge>
                      {dfa.states?.some(s => s.type === 'accept') && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          Has accept states
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* DFA Preview */}
                    {renderDFAPreview(dfa)}

                    {/* Description */}
                    {dfa.description && (
                      <p className="text-sm text-slate-600 mt-4 line-clamp-2">
                        {dfa.description}
                      </p>
                    )}

                    {/* Alphabet */}
                    <div className="mt-4">
                      <span className="text-xs font-medium text-slate-500">Alphabet: </span>
                      <span className="text-sm font-mono text-slate-700">
                        {'{' + (dfa.alphabet?.join(', ') || '') + '}'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                      <Link to={createPageUrl(`Visualizer?dfa_id=${dfa.id}`)} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(dfa.id, dfa.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${dfa.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal (simple, self-contained) */}
      {showDeleteDialog && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Confirm deletion</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <span className="font-medium">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
