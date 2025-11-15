/**
 * Contracts - Gestión de Contratos con Upload de PDFs
 * - Lista de contratos con filtros por estado
 * - Upload y preview de documentos PDF
 * - Asociación con shows
 * - Tracking de firmas y expiración
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Download, Upload, FileText, Calendar, 
  User, CheckCircle2, Clock, AlertCircle, X, Eye, Edit2, Trash2,
  Filter, Upload as UploadIcon
} from 'lucide-react';
import { useContractsQuery, useCreateContractMutation, useDeleteContractMutation, uploadContractPDF } from '../../hooks/useContractsQuery';
import { useShows } from '../../hooks/useShows';
import { useToast } from '../../context/ToastContext';
import { Contract, ContractStatus } from '../../types/contract';

type StatusFilter = 'all' | ContractStatus;

const STATUS_COLORS: Record<ContractStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  signed: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  expired: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
};

const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente de Firma',
  signed: 'Firmado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

// Helper para formatear fechas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const Contracts: React.FC = () => {
  const toast = useToast();
  const { data: contracts = [], isLoading } = useContractsQuery();
  const { shows } = useShows();
  const createContractMutation = useCreateContractMutation();
  const deleteContractMutation = useDeleteContractMutation();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Filtrado de contratos
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.parties.some(p => p.name.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contracts, statusFilter, searchQuery]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    signed: contracts.filter(c => c.status === 'signed').length,
    expired: contracts.filter(c => c.status === 'expired').length,
  }), [contracts]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const fileData = await uploadContractPDF(file);
      
      // Crear contrato con PDF
      const newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
        title: file.name.replace('.pdf', ''),
        description: '',
        status: 'draft',
        parties: [],
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        requiresSignature: false,
        tags: [],
      };

      await createContractMutation.mutateAsync(newContract as any);
      toast.success('Contrato creado correctamente');
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Error al subir el PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contrato?')) return;

    try {
      await deleteContractMutation.mutateAsync(id);
      toast.success('Contrato eliminado');
      if (selectedContract?.id === id) {
        setSelectedContract(null);
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass rounded-xl p-8 border border-theme">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Cargando contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-theme">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-theme-primary">Contratos</h1>
          <span className="text-sm text-slate-300 dark:text-white/50">
            {filteredContracts.length} de {contracts.length}
          </span>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg text-white hover:from-accent-600 hover:to-accent-700 font-medium flex items-center gap-2 shadow-lg shadow-accent-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent-500/30 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Nuevo Contrato
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 py-5 bg-gradient-to-r from-accent-500/10 to-purple-500/10 border-b border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover transition-all duration-200">
            <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold text-theme-primary">{stats.total}</div>
          </div>
          <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover transition-all duration-200">
            <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Borradores</div>
            <div className="text-2xl font-bold text-slate-400">{stats.draft}</div>
          </div>
          <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover transition-all duration-200">
            <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          </div>
          <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover transition-all duration-200">
            <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Firmados</div>
            <div className="text-2xl font-bold text-green-400">{stats.signed}</div>
          </div>
          <div className="bg-interactive rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:bg-interactive-hover transition-all duration-200">
            <div className="text-xs text-slate-300 dark:text-white/50 mb-2 font-medium uppercase tracking-wide">Expirados</div>
            <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-interactive border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Buscar por título o parte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder:text-theme-muted focus:outline-none focus:border-accent-500/50 text-sm transition-all duration-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2.5 bg-interactive border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500/50 hover:bg-interactive-hover transition-all duration-200 cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borradores</option>
          <option value="pending_signature">Pendiente de Firma</option>
          <option value="signed">Firmados</option>
          <option value="expired">Expirados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {/* Contracts List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredContracts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {contracts.length === 0 ? 'No hay contratos' : 'Sin resultados'}
              </h3>
              <p className="text-theme-secondary mb-6">
                {contracts.length === 0 ? 'Sube tu primer contrato en PDF' : 'Ajusta los filtros'}
              </p>
              {contracts.length === 0 && (
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl text-white hover:from-accent-600 hover:to-accent-700 font-medium inline-flex items-center gap-2"
                >
                  <UploadIcon className="w-5 h-5" /> Subir Contrato
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/10 group cursor-pointer"
                onClick={() => setSelectedContract(contract)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1 truncate">
                        {contract.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[contract.status].bg} ${STATUS_COLORS[contract.status].text} border ${STATUS_COLORS[contract.status].border} inline-block`}>
                        {STATUS_LABELS[contract.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {contract.showId && (
                    <div className="flex items-center gap-2 text-xs text-theme-secondary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {shows.find(s => s.id === contract.showId)?.name || 'Show asociado'}
                      </span>
                    </div>
                  )}
                  {contract.parties.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-theme-secondary">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{contract.parties[0]?.name || 'Sin nombre'}</span>
                      {contract.parties.length > 1 && (
                        <span className="text-accent-400">+{contract.parties.length - 1}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-theme-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Creado {formatDate(contract.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedContract(contract); }}
                    className="flex-1 px-3 py-2 rounded-lg hover:bg-accent-500/20 text-theme-secondary hover:text-accent-400 flex items-center justify-center gap-2 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver
                  </button>
                  {contract.fileUrl && (
                    <a
                      href={contract.fileUrl}
                      download={contract.fileName}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 rounded-lg hover:bg-blue-500/20 text-theme-secondary hover:text-blue-400 flex items-center justify-center gap-2 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(contract.id); }}
                    className="px-3 py-2 rounded-lg hover:bg-red-500/20 text-theme-secondary hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 border border-theme max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Subir Contrato</h2>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block w-full">
                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg p-8 text-center hover:border-accent-500/50 hover:bg-accent-500/5 transition-all duration-200 cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-500"></div>
                      <p className="text-sm text-theme-secondary">Subiendo...</p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-12 h-12 text-accent-400 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">Click para subir PDF</p>
                      <p className="text-xs text-theme-secondary">Máximo 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-interactive border border-slate-200 dark:border-white/10 text-white hover:bg-interactive-hover transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Detail Dialog */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl border border-theme max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-surface-card/95 backdrop-blur-sm border-b border-white/10 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedContract.title}</h2>
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${STATUS_COLORS[selectedContract.status].bg} ${STATUS_COLORS[selectedContract.status].text} border ${STATUS_COLORS[selectedContract.status].border}`}>
                    {STATUS_LABELS[selectedContract.status]}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-2 rounded-lg hover:bg-interactive-hover text-theme-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* PDF Preview */}
              {selectedContract.fileUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Documento</h3>
                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <iframe
                      src={selectedContract.fileUrl}
                      className="w-full h-[600px]"
                      title="Contract PDF"
                    />
                  </div>
                  <a
                    href={selectedContract.fileUrl}
                    download={selectedContract.fileName}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-interactive border border-white/10 rounded-lg text-white hover:bg-interactive-hover transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </a>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Detalles</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-300 dark:text-white/50 mb-1">Creado</div>
                      <div className="text-sm text-white">{formatDate(selectedContract.createdAt)}</div>
                    </div>
                    {selectedContract.expirationDate && (
                      <div>
                        <div className="text-xs text-slate-300 dark:text-white/50 mb-1">Expira</div>
                        <div className="text-sm text-white">{formatDate(selectedContract.expirationDate)}</div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedContract.parties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Partes</h3>
                    <div className="space-y-2">
                      {selectedContract.parties.map((party, idx) => (
                        <div key={idx} className="glass rounded-lg p-3 border border-white/10">
                          <div className="text-sm font-medium text-white">{party.name}</div>
                          {party.email && (
                            <div className="text-xs text-theme-secondary mt-1">{party.email}</div>
                          )}
                          {party.signedAt && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Firmado {formatDate(party.signedAt)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
