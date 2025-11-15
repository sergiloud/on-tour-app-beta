/**
 * ContractsList - Componente reutilizable para mostrar contratos
 * Puede usarse en Contracts page y ShowEditorDrawer
 */

import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, Calendar, User, Clock, Plus, Upload as UploadIcon, X } from 'lucide-react';
import { Contract, ContractStatus } from '../../types/contract';
import { useContractsByShowQuery, useCreateContractMutation, useDeleteContractMutation, uploadContractPDF } from '../../hooks/useContractsQuery';
import { useToast } from '../../context/ToastContext';

interface ContractsListProps {
  showId: string;
  showName?: string;
  compact?: boolean; // Modo compacto para ShowEditorDrawer
}

const STATUS_COLORS: Record<ContractStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  signed: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  expired: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
};

const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  signed: 'Firmado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const ContractsList: React.FC<ContractsListProps> = ({ showId, showName, compact = false }) => {
  const toast = useToast();
  const { data: contracts = [], isLoading } = useContractsByShowQuery(showId);
  const createContractMutation = useCreateContractMutation();
  const deleteContractMutation = useDeleteContractMutation();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      
      const newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
        title: file.name.replace('.pdf', ''),
        description: '',
        status: 'draft',
        showId: showId,
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
      console.error('Error deleting contract:', error);
      toast.error('Error al eliminar el contrato');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
            Contratos {showName && `- ${showName}`}
          </h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            {contracts.length} {contracts.length === 1 ? 'contrato' : 'contratos'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className={`inline-flex items-center gap-2 px-3 py-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 rounded-lg transition-all duration-200 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <Plus className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {!compact && 'Añadir Contrato'}
        </button>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className={`text-center ${compact ? 'py-6' : 'py-12'} glass rounded-xl border border-slate-200 dark:border-white/10`}>
          <FileText className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} text-white/20 mx-auto mb-3`} />
          <p className="text-theme-secondary text-sm mb-4">
            No hay contratos asociados
          </p>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="px-4 py-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 rounded-lg text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Subir primer contrato
          </button>
        </div>
      ) : (
        <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-3'}`}>
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className={`glass rounded-lg ${compact ? 'p-3' : 'p-4'} border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/10 group cursor-pointer`}
              onClick={() => setSelectedContract(contract)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0`}>
                    <FileText className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'} mb-1 truncate`}>
                      {contract.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[contract.status].bg} ${STATUS_COLORS[contract.status].text} border ${STATUS_COLORS[contract.status].border} inline-block`}>
                      {STATUS_LABELS[contract.status]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className={`space-y-1.5 ${compact ? 'mb-2' : 'mb-3'}`}>
                {contract.parties.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-theme-secondary">
                    <User className="w-3 h-3" />
                    <span className="truncate">{contract.parties[0]?.name || 'Sin nombre'}</span>
                    {contract.parties.length > 1 && (
                      <span className="text-accent-400">+{contract.parties.length - 1}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-theme-secondary">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-1 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedContract(contract); }}
                  className="flex-1 px-2 py-1.5 rounded-lg hover:bg-accent-500/20 text-theme-secondary hover:text-accent-400 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Eye className="w-3 h-3" /> Ver
                </button>
                {contract.fileUrl && (
                  <a
                    href={contract.fileUrl}
                    download={contract.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1.5 rounded-lg hover:bg-blue-500/20 text-theme-secondary hover:text-blue-400 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(contract.id); }}
                  className="px-2 py-1.5 rounded-lg hover:bg-red-500/20 text-theme-secondary hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                          <div className="font-medium text-sm text-white">{party.name}</div>
                          <div className="text-xs text-theme-secondary capitalize">{party.role}</div>
                          {party.email && <div className="text-xs text-theme-secondary mt-1">{party.email}</div>}
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

export default ContractsList;
