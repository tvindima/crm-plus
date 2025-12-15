'use client';

import { useState, useEffect } from "react";
import { BackofficeLayout } from "../../../backoffice/components/BackofficeLayout";
import { DataTable } from "../../../backoffice/components/DataTable";
import { Drawer } from "../../../backoffice/components/Drawer";
import { TeamForm } from "../../../backoffice/components/TeamForm";
import { ToastProvider, useToast } from "../../../backoffice/components/Toast";
import {
  BackofficeTeam,
  BackofficeAgent,
  getBackofficeTeams,
  getBackofficeAgents,
  createBackofficeTeam,
  updateBackofficeTeam,
  deleteBackofficeTeam,
} from "../../../src/services/backofficeApi";
import { PencilIcon, TrashIcon, PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useRole } from "../../../backoffice/components/RoleContext";

function EquipasPageContent() {
  const { addToast } = useToast();
  const { permissions } = useRole();
  
  const [teams, setTeams] = useState<BackofficeTeam[]>([]);
  const [agents, setAgents] = useState<BackofficeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<BackofficeTeam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeams();
    loadAgents();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      const data = await getBackofficeTeams({ limit: 100 });
      setTeams(data);
    } catch (err) {
      console.error("Erro ao carregar equipas:", err);
      addToast("Erro ao carregar equipas", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents() {
    try {
      const data = await getBackofficeAgents({ limit: 100 });
      setAgents(data);
    } catch (err) {
      console.error("Erro ao carregar agentes:", err);
    }
  }

  function getLeaderName(managerId?: number | null): string {
    if (!managerId) return "Sem gestor";
    const manager = agents.find(a => a.id === managerId);
    return manager?.name || `ID: ${managerId}`;
  }

  async function handleSubmit(data: { name: string; description?: string | null; manager_id?: number | null }) {
    try {
      if (editingTeam) {
        await updateBackofficeTeam(editingTeam.id, data);
        addToast("Equipa atualizada com sucesso!", "success");
      } else {
        await createBackofficeTeam(data);
        addToast("Equipa criada com sucesso!", "success");
      }
      setDrawerOpen(false);
      setEditingTeam(null);
      loadTeams();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao guardar equipa", "error");
      throw err;
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem a certeza que pretende eliminar esta equipa?")) return;
    try {
      await deleteBackofficeTeam(id);
      addToast("Equipa eliminada com sucesso!", "success");
      loadTeams();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Erro ao eliminar equipa", "error");
    }
  }

  function openCreateDrawer() {
    setEditingTeam(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(team: BackofficeTeam) {
    setEditingTeam(team);
    setDrawerOpen(true);
  }

  const filteredTeams = teams.filter((team) => {
    const search = searchTerm.toLowerCase();
    return (
      team.name.toLowerCase().includes(search) ||
      team.description?.toLowerCase().includes(search) ||
      getLeaderName(team.manager_id).toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: "name" as const,
      label: "Nome da Equipa",
      render: (team: BackofficeTeam) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#5fa2ff] to-[#2d63ff] text-white shadow-[0_0_20px_rgba(95,162,255,0.4)]">
            <UserGroupIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-white">{team.name}</p>
            {team.description && (
              <p className="text-xs text-[#9CA3AF] line-clamp-1">{team.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "manager_id" as const,
      label: "Gestor",
      render: (team: BackofficeTeam) => (
        <span className="text-sm text-[#C5C5C5]">{getLeaderName(team.manager_id)}</span>
      ),
    },
    {
      key: "created_at" as const,
      label: "Criada em",
      render: (team: BackofficeTeam) => (
        <span className="text-sm text-[#9CA3AF]">
          {team.created_at ? new Date(team.created_at).toLocaleDateString("pt-PT") : "—"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "Editar",
      icon: PencilIcon,
      onClick: (team: BackofficeTeam) => openEditDrawer(team),
      show: permissions.canEditAllProperties,
    },
    {
      label: "Eliminar",
      icon: TrashIcon,
      onClick: (team: BackofficeTeam) => handleDelete(team.id),
      variant: "danger" as const,
      show: permissions.canEditAllProperties,
    },
  ];

  return (
    <BackofficeLayout title="Equipas">
      <div className="relative overflow-hidden rounded-3xl border border-[#23345c] bg-gradient-to-br from-[#050711] via-[#080c18] to-[#04050d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
        <div className="pointer-events-none absolute -left-14 -top-20 h-72 w-72 rounded-full bg-[#3b82f6]/30 blur-[150px]" />
        <div className="pointer-events-none absolute -right-16 top-6 h-64 w-64 rounded-full bg-[#7c3aed]/25 blur-[140px]" />

        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Gestão de Equipas</h1>
            <p className="text-sm text-[#C5C5C5]">Organize agentes em equipas e atribua líderes.</p>
          </div>
          {permissions.canEditAllProperties && (
            <button
              onClick={openCreateDrawer}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#0f5afc] to-[#4bc2ff] px-5 py-2.5 font-medium text-white shadow-[0_10px_30px_rgba(79,139,255,0.4)] transition hover:shadow-[0_15px_40px_rgba(79,139,255,0.5)]"
            >
              <PlusIcon className="h-5 w-5" />
              Nova Equipa
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Procurar equipas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0F0F12] px-4 py-2.5 text-white placeholder-[#6B7280] focus:border-[#5fa2ff] focus:outline-none focus:ring-2 focus:ring-[#5fa2ff]/25"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#C5C5C5]">A carregar equipas...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-[#6B7280]" />
            <p className="mt-3 text-sm text-[#C5C5C5]">
              {searchTerm ? "Nenhuma equipa encontrada" : "Ainda não existem equipas criadas"}
            </p>
          </div>
        ) : (
          <DataTable data={filteredTeams} columns={columns} actions={actions.filter(a => a.show !== false)} />
        )}
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? "Editar Equipa" : "Nova Equipa"}
      >
        <TeamForm
          team={editingTeam}
          onSubmit={handleSubmit}
          onCancel={() => {
            setDrawerOpen(false);
            setEditingTeam(null);
          }}
        />
      </Drawer>
    </BackofficeLayout>
  );
}

export default function EquipasPage() {
  return (
    <ToastProvider>
      <EquipasPageContent />
    </ToastProvider>
  );
}

