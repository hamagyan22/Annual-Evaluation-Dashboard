const fs = require('fs');

const targetFile = 'C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/src/components/AnnualEvaluationDashboard.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

console.log('Original content length:', content.length);

// 1. In effectiveAllMembers: add dynamicEmployees
const memberSearch = `    // 1b. Add Special Staff (Trainer, QA, Team Leaders)
    SPECIAL_STAFF_MEMBERS.forEach(s => {
      const k = normalizeAgentName(s.agent_name);
      if (!map.has(k)) {
        map.set(k, { ...s });
      }
    });`;

const memberReplacement = `    // 1b. Add Special Staff (Trainer, QA, Team Leaders)
    SPECIAL_STAFF_MEMBERS.forEach(s => {
      const k = normalizeAgentName(s.agent_name);
      if (!map.has(k)) {
        map.set(k, { ...s });
      }
    });

    // 1c. Add dynamic employees registered via Manage Staff
    dynamicEmployees.forEach(de => {
      const k = normalizeAgentName(de.name);
      map.set(k, {
        id: de.id,
        agent_name: de.name,
        name: de.name,
        employee_id: de.employee_id,
        team: de.team || (de.name + ' Team'),
        department: de.department || 'Contact Center',
        role: de.role || 'Team Leader',
        role_type: de.role_type || 'agent',
        is_active: true,
        is_dynamic: true
      });
    });`;

if (content.includes(memberSearch)) {
  content = content.replace(memberSearch, memberReplacement);
  // Also update dependencies of effectiveAllMembers
  content = content.replace(
    '}, [allMembers, internalMembers]);',
    '}, [allMembers, internalMembers, dynamicEmployees]);'
  );
  console.log('Updated effectiveAllMembers with dynamicEmployees');
}

// 2. Add activeKpiDefinitions, activeCompetenciesList, customSectionsList
const kpiSearch = `  // Operational KPIs dynamic definitions matching Role and Templates`;
const kpiReplacement = `  // Dynamic user criteria mapped to KPI section
  const activeKpiDefinitions: KpiItemDefinition[] = useMemo(() => {
    const customKpis = criteria.filter(c => c.sectionId === 'kpi');
    if (customKpis.length > 0) {
      return customKpis.map(c => ({
        id: c.id,
        name: c.name + (c.nameAr ? ' (' + c.nameAr + ')' : ''),
        description: c.description,
        actual: null
      }));
    }
    return kpiDefinitions;
  }, [criteria, kpiDefinitions]);

  // Dynamic user criteria mapped to Competencies section
  const activeCompetenciesList = useMemo(() => {
    const customComps = criteria.filter(c => c.sectionId === 'competencies');
    if (customComps.length > 0) {
      return customComps.map(c => ({
        id: c.id,
        name: c.name + (c.nameAr ? ' (' + c.nameAr + ')' : ''),
        description: c.description
      }));
    }
    return currentCompetenciesList;
  }, [criteria, currentCompetenciesList]);

  // Custom sections beyond KPI and Competencies
  const customSectionsList = useMemo(() => {
    return sections.filter(s => s.id !== 'kpi' && s.id !== 'competencies');
  }, [sections]);

  // Operational KPIs dynamic definitions matching Role and Templates`;

if (content.includes(kpiSearch) && !content.includes('activeKpiDefinitions')) {
  content = content.replace(kpiSearch, kpiReplacement);
  console.log('Added activeKpiDefinitions and activeCompetenciesList');
}

// 3. Update selfKpiAvg, managerKpiAvg, selfCompAvg, managerCompAvg to use active definitions
content = content.replace(
  'const vals = kpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);',
  'const vals = activeKpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);'
);
content = content.replace(
  'const vals = kpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);',
  'const vals = activeKpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);'
);
content = content.replace(
  'const vals = currentCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);',
  'const vals = activeCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);'
);
content = content.replace(
  'const vals = currentCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);',
  'const vals = activeCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);'
);

// 4. Update the table renders to use activeKpiDefinitions and activeCompetenciesList
content = content.replace(
  '{kpiDefinitions.map((kpi) => {',
  '{activeKpiDefinitions.map((kpi) => {'
);
content = content.replace(
  '{currentCompetenciesList.map((comp) => {',
  '{activeCompetenciesList.map((comp) => {'
);

// 5. In handleSaveEvaluation, add localStorage saving
const saveHookSearch = `      await setDoc(doc(db, "annual_evaluations", docId), payload, { merge: true });`;
const saveHookReplacement = `      await setDoc(doc(db, "annual_evaluations", docId), payload, { merge: true });

      // LocalStorage offline backup
      try {
        saveEvaluationRecord({
          id: docId,
          employeeId: employeeId || currentMember?.employee_id || "",
          employeeName: selectedEmployeeName,
          year: selectedYear,
          period: "Annual",
          status: targetStatus,
          selfScores: { ...cleanSelfKpis, ...selfCompetencies },
          managerScores: { ...cleanManagerKpis, ...managerCompetencies },
          keyStrengths,
          areasForDevelopment,
          managerComments,
          employeeComments,
          submittedAt: autoDate,
          updatedAt: new Date().toISOString()
        });
      } catch (localErr) {
        console.warn("localStorage evaluation save warning:", localErr);
      }`;

if (content.includes(saveHookSearch) && !content.includes('saveEvaluationRecord')) {
  content = content.replace(saveHookSearch, saveHookReplacement);
  console.log('Added localStorage saving in handleSaveEvaluation');
}

// 6. In useEffect for docId loading, add localStorage loading before or fallback
const loadDocSearch = `      if (docSnap.exists()) {`;
const loadDocReplacement = `      // First check localStorage for immediate render
      const localDoc = loadEvaluationRecord(selectedYear, selectedEmployeeName);
      if (localDoc && !docSnap.exists()) {
        setEvaluationDate(localDoc.submittedAt || "");
        setEmployeeId(localDoc.employeeId || knownId || "");
        setSelfKpis(localDoc.selfScores || {});
        setManagerKpis(localDoc.managerScores || {});
        setSelfCompetencies(localDoc.selfScores || {});
        setManagerCompetencies(localDoc.managerScores || {});
        setKeyStrengths(localDoc.keyStrengths || "");
        setAreasForDevelopment(localDoc.areasForDevelopment || "");
        setManagerComments(localDoc.managerComments || "");
        setEmployeeComments(localDoc.employeeComments || "");
        setEvaluationStatus(localDoc.status || "draft");
        setLastSavedAt(localDoc.updatedAt || "");
      }

      if (docSnap.exists()) {`;

if (content.includes(loadDocSearch) && !content.includes('loadEvaluationRecord')) {
  content = content.replace(loadDocSearch, loadDocReplacement);
  console.log('Added localStorage loading fallback in docId useEffect');
}

// 7. Mount ManageCriteriaModal and ManageStaffModal at the bottom
const modalMountSearch = `{/* Copied Toast Notification */}`;
const modalMountReplacement = `{/* Manage Criteria Modal */}
      <ManageCriteriaModal
        isOpen={showManageCriteriaModal}
        onClose={() => setShowManageCriteriaModal(false)}
        criteria={criteria}
        sections={sections}
        onSaveCriteria={(updated) => {
          setCriteria(updated);
          saveStoredCriteria(updated);
          showToastNotification("تم حفظ معايير التقييم بنجاح!", "success");
        }}
        onSaveSections={(updated) => {
          setSections(updated);
          saveStoredSections(updated);
          showToastNotification("تم حفظ أقسام التقييم بنجاح!", "success");
        }}
      />

      {/* Manage Staff Modal */}
      <ManageStaffModal
        isOpen={showManageStaffModal}
        onClose={() => setShowManageStaffModal(false)}
        departments={departments}
        employees={dynamicEmployees}
        onSaveDepartments={(updated) => {
          setDepartments(updated);
          saveStoredDepartments(updated);
          showToastNotification("تم حفظ الأقسام بنجاح!", "success");
        }}
        onSaveEmployees={(updated) => {
          setDynamicEmployees(updated);
          saveStoredEmployees(updated);
          showToastNotification("تم حفظ بيانات الموظفين بنجاح!", "success");
        }}
        onSelectEmployeeForEval={(empName) => {
          setSelectedEmployeeName(empName);
          setShowManageStaffModal(false);
        }}
      />

      {/* Copied Toast Notification */}`;

if (content.includes(modalMountSearch) && !content.includes('ManageCriteriaModal')) {
  content = content.replace(modalMountSearch, modalMountReplacement);
  console.log('Mounted ManageCriteriaModal and ManageStaffModal at the bottom');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully written updated file! Final length:', content.length);
