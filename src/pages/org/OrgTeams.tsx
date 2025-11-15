import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useOrganizationContext } from '../../context/OrganizationContext';
import { MembersPanel } from '../../components/organization/MembersPanel';
import { OrgEmptyState } from '../../components/org/OrgModernCards';

/**
 * Organization Teams Management Page
 * 
 * Teams = Members en el sistema multi-tenant.
 * Este componente redirige a MembersPanel que ya tiene toda la funcionalidad
 * de gestión de equipos: invitar miembros, asignar roles, eliminar, etc.
 */
const OrgTeams: React.FC = () => {
  const { org } = useOrg();
  const orgContext = useOrganizationContext();

  // If new multi-tenancy context is available, use it
  if (orgContext?.currentOrg) {
    return (
      <MembersPanel
        organizationId={orgContext.currentOrg.id}
        organizationName={orgContext.currentOrg.name}
        currentUserRole={orgContext.currentRole || 'viewer'}
        canManageMembers={orgContext.canManageMembers}
      />
    );
  }

  // Fallback to legacy org context (for backward compatibility during migration)
  if (org) {
    // For demo/legacy mode, show a placeholder that encourages migration
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md">
          <OrgEmptyState
            icon={<Building2 className="w-6 h-6" />}
            title="Multi-Tenancy Active"
            description="Team management is now powered by the new organization system. Please ensure OrganizationContext is properly initialized."
          />
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
            Legacy org: {org.name} ({org.type})
          </div>
        </div>
      </div>
    );
  }

  // No organization context at all
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 max-w-md">
        <OrgEmptyState
          icon={<AlertCircle className="w-6 h-6" />}
          title="No Organization Selected"
          description="Please select or create an organization to manage your team."
        />
      </div>
    </div>
  );
};

export default OrgTeams;

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  orgId: string;
  onMemberAdded: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ open, onClose, team, orgId, onMemberAdded }) => {
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState<'manager' | 'owner'>('manager');
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setIsCreating(true);

    try {
      const result = inviteMember(orgId, memberName.trim(), role);
      
      if (result) {
        assignMemberToTeam(team.id, result.userId);
        logger.info('Member added to team', { component: 'OrgTeams', teamId: team.id, userId: result.userId, memberName: memberName.trim(), role });
        toast.success(memberName + ' añadido al equipo');
        onMemberAdded();
        setMemberName('');
        onClose();
      } else {
        toast.error('Error al crear el miembro');
      }
    } catch (error) {
      logger.error('Failed to add member', error as Error);
      toast.error('Error al añadir miembro');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div 
        className="glass rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md shadow-2xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent-400" />
            Añadir Miembro a {team.name}
          </h3>
          <p className="text-sm text-slate-400 dark:text-white/60 mt-1">Crea un nuevo manager o miembro del equipo</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
              Nombre Completo *
            </label>
            <input 
              type="text" 
              value={memberName} 
              onChange={(e) => setMemberName(e.target.value)} 
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-accent-500/50 focus:outline-none transition-fast" 
              placeholder="Ej: María García" 
              maxLength={50} 
              required 
              autoFocus 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2 font-medium">
              Rol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setRole('manager')} 
                className={'p-3 rounded-xl border transition-all ' + (
                  role === 'manager' 
                    ? 'bg-accent-500/20 border-accent-500/40 text-accent-200' 
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-accent-500/30'
                )}
              >
                <Shield className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-semibold">Manager</div>
              </button>
              <button 
                type="button" 
                onClick={() => setRole('owner')} 
                className={'p-3 rounded-xl border transition-all ' + (
                  role === 'owner' 
                    ? 'bg-accent-500/20 border-accent-500/40 text-accent-200' 
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-accent-500/30'
                )}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-semibold">Owner</div>
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-300 dark:hover:border-white/20 font-semibold transition-fast"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isCreating || !memberName.trim()} 
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-500/80 to-accent-600/60 border border-accent-500/40 text-white font-semibold hover:from-accent-500 hover:to-accent-600 transition-fast disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/20"
            >
              {isCreating ? 'Añadiendo...' : 'Añadir Miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrgTeams: React.FC = () => {
  const { org, teams, refresh, members } = useOrg();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const toast = useToast();
  
  if (!org) return null;

  const handleCreateTeam = () => setShowCreateModal(true);

  const handleSaveTeam = (teamData: { name: string; description?: string }) => {
    const result = addTeam(org.id, teamData.name);
    if (result) {
      logger.info('Team created successfully', { component: 'OrgTeams', teamId: result.teamId, orgId: org.id, teamName: teamData.name });
      toast.success('Equipo creado correctamente');
      refresh();
      setShowCreateModal(false);
    } else {
      logger.error('Failed to create team', new Error('addTeam returned undefined'), { component: 'OrgTeams', orgId: org.id, teamName: teamData.name });
      toast.error('Error al crear el equipo');
    }
  };

  const handleAddMember = (team: Team) => {
    setSelectedTeam(team);
    setShowAddMemberModal(true);
  };

  const handleRemoveMember = (team: Team, userId: string) => {
    const user = members.find(m => m.user.id === userId);
    const userName = user ? user.user.name : listUsers().find(u => u.id === userId)?.name;
    const confirmMsg = '¿Eliminar a ' + (userName || userId) + ' del equipo ' + team.name + '?';
    if (confirm(confirmMsg)) {
      const success = removeMemberFromTeam(team.id, userId);
      if (success) {
        toast.success('Miembro eliminado del equipo');
        refresh();
      } else {
        toast.error('Error al eliminar miembro');
      }
    }
  };

  const getUserName = (userId: string): string => {
    const user = listUsers().find(u => u.id === userId);
    return user?.name || userId;
  };

  const getUserRole = (userId: string): string => {
    const member = members.find(m => m.user.id === userId);
    return member?.role === 'owner' ? 'Propietario' : member?.role === 'manager' ? 'Manager' : 'Miembro';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-6 pb-8">
      <PageHeader 
        title={t('org.teams.title') || 'Equipos'} 
        subtitle={t('org.teams.subtitle') || 'Organiza y gestiona a los miembros de tu equipo'} 
        actions={
          <button 
            onClick={handleCreateTeam} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all duration-300 shadow-lg shadow-accent-500/10"
          >
            <Plus className="w-4 h-4" />
            {t('teams.create') || 'Crear Equipo'}
          </button>
        }
      />
      
      {teams.length === 0 ? (
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 md:p-12 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3">
          <OrgEmptyState 
            icon="👥" 
            title={t('empty.noTeams') || 'Aún no hay equipos'} 
            description={t('empty.noTeams.desc') || 'Crea equipos para organizar a tus miembros y agilizar la colaboración'} 
            action={{ label: t('teams.create') || 'Crear Equipo', onClick: handleCreateTeam }} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-5 bg-gradient-to-br from-slate-100 dark:from-white/8 to-white/3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-4">
                <OrgSectionHeader 
                  title={team.name} 
                  icon={
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
                      <Users className="w-4 h-4 text-blue-300" />
                    </div>
                  } 
                  action={
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-200 text-xs font-bold">
                      {team.members.length}
                    </span>
                  }
                />
                
                {team.members.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 dark:text-white/60 font-semibold uppercase tracking-wide">
                      Miembros
                    </p>
                    <ul className="space-y-1.5">
                      {team.members.slice(0, 5).map((memberId) => {
                        const userName = getUserName(memberId);
                        const userRole = getUserRole(memberId);
                        return (
                          <li 
                            key={memberId} 
                            className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-accent-500/20 border border-accent-500/40 text-accent-100 text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-slate-600 dark:text-white/80 truncate">{userName}</div>
                                <div className="text-[10px] text-slate-400 dark:text-white/50">{userRole}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveMember(team, memberId)} 
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all" 
                              title="Eliminar del equipo"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </li>
                        );
                      })}
                      {team.members.length > 5 && (
                        <li className="text-xs text-slate-400 dark:text-white/60 pt-1 font-medium">
                          +{team.members.length - 5} más
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-white/60 italic">
                    Aún no hay miembros en este equipo
                  </p>
                )}
                
                <button 
                  onClick={() => handleAddMember(team)} 
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-accent-500/20 to-accent-600/10 border border-accent-500/30 hover:from-accent-500/30 hover:to-accent-600/20 text-accent-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Añadir Miembro
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <TeamCreationModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSave={handleSaveTeam} 
      />
      
      <AnimatePresence>
        {showAddMemberModal && selectedTeam && (
          <AddMemberModal 
            open={showAddMemberModal} 
            onClose={() => { 
              setShowAddMemberModal(false); 
              setSelectedTeam(null); 
            }} 
            team={selectedTeam} 
            orgId={org.id} 
            onMemberAdded={() => { 
              refresh(); 
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrgTeams;
