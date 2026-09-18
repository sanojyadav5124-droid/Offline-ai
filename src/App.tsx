import React, { useState, useEffect } from "react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  EmergencyChecklist,
  QuickNote,
  ChangeLogEntry,
  MaritimeDepartment,
  WatchMode,
  PhotoAttachment,
} from "./types";
import {
  loadEquipmentItems,
  saveEquipmentItems,
  loadTroubleshootingLogs,
  saveTroubleshootingLogs,
  loadEmergencyChecklists,
  saveEmergencyChecklists,
  loadQuickNotes,
  saveQuickNotes,
  loadChangeLogs,
  saveChangeLogs,
  logAuditEntry,
} from "./utils/storage";
import { Sidebar, ActiveTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { QuickNotesView } from "./components/QuickNotesView";
import { EquipmentKnowledgeView } from "./components/EquipmentKnowledgeView";
import { TroubleshootingLogView } from "./components/TroubleshootingLogView";
import { StatutoryComplianceView } from "./components/StatutoryComplianceView";
import { EmergencyChecklistsView } from "./components/EmergencyChecklistsView";
import { ChangeLogView } from "./components/ChangeLogView";
import { AddEntryModal } from "./components/AddEntryModal";
import { AddEmergencyModal } from "./components/AddEmergencyModal";
import { AddStatutoryModal } from "./components/AddStatutoryModal";
import { UpdateReadingModal } from "./components/UpdateReadingModal";
import { AIAdvisorModal } from "./components/AIAdvisorModal";
import { PhotoViewerModal } from "./components/PhotoViewerModal";
import { BackupModal } from "./components/BackupModal";
import { GuideManualModal } from "./components/GuideManualModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedDepartment, setSelectedDepartment] = useState<MaritimeDepartment | "All">("All");
  const [watchMode, setWatchMode] = useState<WatchMode>(() => {
    return (localStorage.getItem("anchor_ai_watch_mode") as WatchMode) || "day";
  });
  const [vesselName, setVesselName] = useState<string>(() => {
    return localStorage.getItem("anchor_ai_vessel_name") || "M/V PACIFIC HORIZON";
  });
  const [userRank, setUserRank] = useState<string>(() => {
    return localStorage.getItem("anchor_ai_user_rank") || "2nd Engineer";
  });

  const [equipmentList, setEquipmentList] = useState<EquipmentKnowledgeItem[]>(loadEquipmentItems);
  const [troubleshootingList, setTroubleshootingList] = useState<TroubleshootingEntry[]>(loadTroubleshootingLogs);
  const [checklists, setChecklists] = useState<EmergencyChecklist[]>(loadEmergencyChecklists);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(loadQuickNotes);
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>(loadChangeLogs);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPrefillName, setAddModalPrefillName] = useState<string | undefined>(undefined);
  const [isAddEmergencyModalOpen, setIsAddEmergencyModalOpen] = useState(false);
  const [isAddStatutoryModalOpen, setIsAddStatutoryModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isGuideManualOpen, setIsGuideManualOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);
  const [editingEquipmentForReading, setEditingEquipmentForReading] = useState<EquipmentKnowledgeItem | null>(null);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  // Persist vessel settings
  useEffect(() => {
    localStorage.setItem("anchor_ai_vessel_name", vesselName);
  }, [vesselName]);

  useEffect(() => {
    localStorage.setItem("anchor_ai_watch_mode", watchMode);
  }, [watchMode]);

  useEffect(() => {
    localStorage.setItem("anchor_ai_user_rank", userRank);
  }, [userRank]);

  // Handlers for Equipment
  const handleSaveEquipment = (newItem: EquipmentKnowledgeItem) => {
    const isEdit = equipmentList.some((e) => e.id === newItem.id);
    const updated = [newItem, ...equipmentList.filter((e) => e.id !== newItem.id)];
    setEquipmentList(updated);
    saveEquipmentItems(updated);

    logAuditEntry({
      action: isEdit ? "UPDATE" : "CREATE",
      entityType: "Equipment Machinery",
      entityId: newItem.id,
      entityTitle: newItem.equipmentName,
      department: newItem.department,
      authorRank: userRank,
      summary: `${isEdit ? "Updated" : "Added"} specifications for ${newItem.equipmentName} (${newItem.maker})`,
    });
    setChangeLogs(loadChangeLogs());
  };

  const handleUpdateReading = (updated: EquipmentKnowledgeItem) => {
    const updatedList = equipmentList.map((e) => (e.id === updated.id ? updated : e));
    setEquipmentList(updatedList);
    saveEquipmentItems(updatedList);

    logAuditEntry({
      action: "TEST_LOGGED",
      entityType: "Statutory Rule",
      entityId: updated.id,
      entityTitle: updated.equipmentName,
      department: updated.department,
      authorRank: userRank,
      summary: `Logged test reading: ${updated.currentReading.measuredValue} (Status: ${updated.currentReading.status})`,
    });
    setChangeLogs(loadChangeLogs());
  };

  // Handlers for Troubleshooting
  const handleSaveTroubleshooting = (newLog: TroubleshootingEntry) => {
    const isEdit = troubleshootingList.some((t) => t.id === newLog.id);
    const updated = [newLog, ...troubleshootingList.filter((t) => t.id !== newLog.id)];
    setTroubleshootingList(updated);
    saveTroubleshootingLogs(updated);

    logAuditEntry({
      action: isEdit ? "UPDATE" : "CREATE",
      entityType: "Troubleshooting Incident",
      entityId: newLog.id,
      entityTitle: newLog.symptomOrAlarm,
      department: newLog.department,
      authorRank: userRank,
      summary: `${isEdit ? "Updated" : "Logged"} breakdown experience on ${newLog.equipmentName}: "${newLog.symptomOrAlarm}"`,
    });
    setChangeLogs(loadChangeLogs());
  };

  // Handlers for Checklists / Scenarios
  const handleToggleChecklistStep = (checklistId: string, stepId: string) => {
    const updated = checklists.map((chk) => {
      if (chk.id !== checklistId) return chk;
      return {
        ...chk,
        steps: chk.steps.map((st) => (st.id === stepId ? { ...st, isChecked: !st.isChecked } : st)),
      };
    });
    setChecklists(updated);
    saveEmergencyChecklists(updated);
  };

  const handleResetChecklist = (checklistId: string) => {
    const updated = checklists.map((chk) => {
      if (chk.id !== checklistId) return chk;
      return {
        ...chk,
        steps: chk.steps.map((st) => ({ ...st, isChecked: false })),
      };
    });
    setChecklists(updated);
    saveEmergencyChecklists(updated);
  };

  const handleAddEmergencyChecklist = (newChk: EmergencyChecklist) => {
    const updated = [newChk, ...checklists];
    setChecklists(updated);
    saveEmergencyChecklists(updated);

    logAuditEntry({
      action: "CREATE",
      entityType: "Emergency Scenario Card",
      entityId: newChk.id,
      entityTitle: newChk.title,
      department: newChk.department,
      authorRank: userRank,
      summary: `Created new action card: "${newChk.title}" (${newChk.steps.length} operational steps)`,
    });
    setChangeLogs(loadChangeLogs());
  };

  const handleUpdateEmergencyChecklist = (updatedChk: EmergencyChecklist) => {
    const updated = checklists.map((c) => (c.id === updatedChk.id ? updatedChk : c));
    setChecklists(updated);
    saveEmergencyChecklists(updated);

    logAuditEntry({
      action: "UPDATE",
      entityType: "Emergency Scenario Card",
      entityId: updatedChk.id,
      entityTitle: updatedChk.title,
      department: updatedChk.department,
      authorRank: userRank,
      summary: `Updated action card: "${updatedChk.title}"`,
    });
    setChangeLogs(loadChangeLogs());
  };

  const handleDeleteEmergencyChecklist = (checklistId: string) => {
    const target = checklists.find((c) => c.id === checklistId);
    const updated = checklists.filter((c) => c.id !== checklistId);
    setChecklists(updated);
    saveEmergencyChecklists(updated);

    if (target) {
      logAuditEntry({
        action: "DELETE",
        entityType: "Emergency Scenario Card",
        entityId: checklistId,
        entityTitle: target.title,
        department: target.department,
        authorRank: userRank,
        summary: `Deleted action card: "${target.title}"`,
      });
      setChangeLogs(loadChangeLogs());
    }
  };

  // Handlers for Quick Notes (Sticky Notes)
  const handleAddQuickNote = (note: QuickNote) => {
    const updated = [note, ...quickNotes];
    setQuickNotes(updated);
    saveQuickNotes(updated);

    logAuditEntry({
      action: "CREATE",
      entityType: "Quick Scratchpad",
      entityId: note.id,
      entityTitle: note.title,
      department: note.department,
      authorRank: userRank,
      summary: `Pinned watch note: "${note.title}"`,
    });
    setChangeLogs(loadChangeLogs());
  };

  const handleUpdateQuickNote = (note: QuickNote) => {
    const updated = quickNotes.map((n) => (n.id === note.id ? note : n));
    setQuickNotes(updated);
    saveQuickNotes(updated);

    logAuditEntry({
      action: "UPDATE",
      entityType: "Quick Scratchpad",
      entityId: note.id,
      entityTitle: note.title,
      department: note.department,
      authorRank: userRank,
      summary: `Updated watch note: "${note.title}" (${note.isResolved ? "Resolved" : "Active"})`,
    });
    setChangeLogs(loadChangeLogs());
  };

  const handleDeleteQuickNote = (id: string) => {
    const target = quickNotes.find((n) => n.id === id);
    const updated = quickNotes.filter((n) => n.id !== id);
    setQuickNotes(updated);
    saveQuickNotes(updated);

    if (target) {
      logAuditEntry({
        action: "DELETE",
        entityType: "Quick Scratchpad",
        entityId: id,
        entityTitle: target.title,
        department: target.department,
        authorRank: userRank,
        summary: `Removed watch note: "${target.title}"`,
      });
      setChangeLogs(loadChangeLogs());
    }
  };

  const handleConvertToLog = (note: QuickNote) => {
    setAddModalPrefillName(note.title);
    setIsAddModalOpen(true);

    const updated = quickNotes.map((n) => (n.id === note.id ? { ...n, isResolved: true } : n));
    setQuickNotes(updated);
    saveQuickNotes(updated);

    logAuditEntry({
      action: "NOTE_CONVERTED",
      entityType: "Quick Scratchpad",
      entityId: note.id,
      entityTitle: note.title,
      department: note.department,
      authorRank: userRank,
      summary: `Converted watch note "${note.title}" into full technical incident log`,
    });
    setChangeLogs(loadChangeLogs());
  };

  // Handler for adding custom Statutory Rule
  const handleSaveStatutoryRule = (data: {
    code: string;
    title: string;
    governing: EquipmentKnowledgeItem["statutoryRequirement"]["governingBody"];
    limit: string;
    interval: EquipmentKnowledgeItem["statutoryRequirement"]["testInterval"];
    category: MaritimeDepartment;
  }) => {
    const newItem: EquipmentKnowledgeItem = {
      id: `eq-stat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      equipmentName: data.title,
      maker: "Class & Flag State Standard",
      model: data.code,
      department: data.category,
      area: `${data.category} Station`,
      installedLocation: `${data.category} Station`,
      makerDesignSpecs: [
        { label: "Governing Body", nominalValue: data.governing, alarmLimit: "Mandatory" },
        { label: "Statutory Code", nominalValue: data.code, alarmLimit: "PSC / Flag Standard" },
        { label: "Required Limit", nominalValue: data.limit, alarmLimit: "Flag Limit" },
        { label: "Inspection Frequency", nominalValue: data.interval, alarmLimit: "Scheduled" },
      ],
      statutoryRequirement: {
        id: `stat-${Date.now()}`,
        regulationCode: data.code,
        governingBody: data.governing,
        requirementSummary: data.title,
        statutoryLimitValue: data.limit,
        testInterval: data.interval,
        standardTolerance: "Must comply with class and flag state safety baseline",
      },
      currentReading: {
        measuredValue: "Operational / Satisfactory",
        unit: "",
        lastTestedDate: new Date().toISOString().split("T")[0],
        testedByRank: userRank,
        status: "Compliant",
        notes: "Rule added to vessel SMS matrix and verified during watch handover.",
      },
      quickNotes: "",
      criticalSparesOnboard: ["Testing reagents / sensor replacement kit"],
      photos: [],
      updatedAt: new Date().toISOString(),
    };

    handleSaveEquipment(newItem);
    setIsAddStatutoryModalOpen(false);
  };


  const handleReloadData = () => {
    setEquipmentList(loadEquipmentItems());
    setTroubleshootingList(loadTroubleshootingLogs());
    setChecklists(loadEmergencyChecklists());
    setQuickNotes(loadQuickNotes());
    setChangeLogs(loadChangeLogs());
  };

  const handleOpenAddWithPrefill = (name?: string) => {
    setAddModalPrefillName(name);
    setIsAddModalOpen(true);
  };

  const handleSelectItemFromSearch = (type: "equipment" | "troubleshooting", id: string) => {
    setTargetItemId(id);
    if (type === "equipment") {
      setActiveTab("equipment");
    } else {
      setActiveTab("troubleshooting");
    }
  };

  // Dynamic root watch mode theme wrapper
  const getThemeClass = () => {
    if (watchMode === "bridge_night") return "bg-stone-950 text-red-300 min-h-screen";
    if (watchMode === "engine") return "bg-slate-950 text-slate-100 min-h-screen";
    return "bg-slate-50 text-slate-900 min-h-screen";
  };

  return (
    <div className={getThemeClass()}>
      <div className="flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "ai_advisor") {
              setIsAiModalOpen(true);
            } else if (tab === "backup") {
              setIsBackupModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          watchMode={watchMode}
          setWatchMode={setWatchMode}
          vesselName={vesselName}
          setVesselName={setVesselName}
          onOpenAddModal={() => handleOpenAddWithPrefill()}
          onOpenGuideManual={() => setIsGuideManualOpen(true)}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          equipmentCount={equipmentList.length}
          troubleshootingCount={troubleshootingList.length}
          notesCount={quickNotes.filter((n) => !n.isResolved).length}
          changeLogCount={changeLogs.length}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAddModal={() => handleOpenAddWithPrefill()}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onOpenGuideManual={() => setIsGuideManualOpen(true)}
            setIsOpenMobile={setIsOpenMobile}
            watchMode={watchMode}
            equipmentList={equipmentList}
            troubleshootingList={troubleshootingList}
            onSelectItem={handleSelectItemFromSearch}
            userRank={userRank}
            setUserRank={setUserRank}
          />

          {/* Main Area Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView
                equipment={equipmentList}
                troubleshooting={troubleshootingList}
                checklists={checklists}
                quickNotes={quickNotes}
                changeLogs={changeLogs}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                setActiveTab={setActiveTab}
                onOpenAddModal={() => handleOpenAddWithPrefill()}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenAddEmergencyModal={() => setIsAddEmergencyModalOpen(true)}
                onOpenGuideManual={() => setIsGuideManualOpen(true)}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                onSelectEquipment={(id) => {
                  setTargetItemId(id);
                  setActiveTab("equipment");
                }}
                onSelectTroubleshooting={(id) => {
                  setTargetItemId(id);
                  setActiveTab("troubleshooting");
                }}
                onAddQuickNote={handleAddQuickNote}
                onConvertToLog={handleConvertToLog}
                watchMode={watchMode}
                userRank={userRank}
              />
            )}

            {activeTab === "notes" && (
              <QuickNotesView
                notes={quickNotes}
                onAddNote={handleAddQuickNote}
                onUpdateNote={handleUpdateQuickNote}
                onDeleteNote={handleDeleteQuickNote}
                onConvertToLog={handleConvertToLog}
                userRank={userRank}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={(dept) => setSelectedDepartment(dept as MaritimeDepartment | "All")}
              />
            )}

            {activeTab === "equipment" && (
              <EquipmentKnowledgeView
                equipmentList={equipmentList}
                troubleshootingList={troubleshootingList}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={handleOpenAddWithPrefill}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                onUpdateReading={(eq) => setEditingEquipmentForReading(eq)}
                watchMode={watchMode}
                targetEquipmentId={targetItemId}
              />
            )}

            {activeTab === "troubleshooting" && (
              <TroubleshootingLogView
                logs={troubleshootingList}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={handleOpenAddWithPrefill}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                watchMode={watchMode}
                targetLogId={targetItemId}
              />
            )}

            {activeTab === "statutory" && (
              <StatutoryComplianceView
                equipmentList={equipmentList}
                onUpdateReading={(eq) => setEditingEquipmentForReading(eq)}
                onOpenAddStatutory={() => setIsAddStatutoryModalOpen(true)}
                watchMode={watchMode}
              />
            )}

            {activeTab === "checklists" && (
              <EmergencyChecklistsView
                checklists={checklists}
                onToggleStep={handleToggleChecklistStep}
                onResetChecklist={handleResetChecklist}
                onAddChecklist={handleAddEmergencyChecklist}
                onUpdateChecklist={handleUpdateEmergencyChecklist}
                onDeleteChecklist={handleDeleteEmergencyChecklist}
                watchMode={watchMode}
                userRank={userRank}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={(dept) => setSelectedDepartment(dept as MaritimeDepartment | "All")}
              />
            )}

            {activeTab === "changelog" && (
              <ChangeLogView
                logs={changeLogs}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={(dept) => setSelectedDepartment(dept as MaritimeDepartment | "All")}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalPrefillName(undefined);
        }}
        onSaveEquipment={handleSaveEquipment}
        onSaveTroubleshooting={handleSaveTroubleshooting}
        existingEquipmentList={equipmentList}
        initialPrefillName={addModalPrefillName}
      />

      <AddEmergencyModal
        isOpen={isAddEmergencyModalOpen}
        onClose={() => setIsAddEmergencyModalOpen(false)}
        onSave={handleAddEmergencyChecklist}
        userRank={userRank}
      />

      <AddStatutoryModal
        isOpen={isAddStatutoryModalOpen}
        onClose={() => setIsAddStatutoryModalOpen(false)}
        onSave={handleSaveStatutoryRule}
        userRank={userRank}
      />

      <UpdateReadingModal
        equipment={editingEquipmentForReading}
        onClose={() => setEditingEquipmentForReading(null)}
        onSave={handleUpdateReading}
      />

      <AIAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        equipmentList={equipmentList}
        troubleshootingList={troubleshootingList}
      />

      <PhotoViewerModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        vesselName={vesselName}
        onDataReloaded={handleReloadData}
      />

      <GuideManualModal
        isOpen={isGuideManualOpen}
        onClose={() => setIsGuideManualOpen(false)}
        watchMode={watchMode}
      />
    </div>
  );
}
