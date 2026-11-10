const fs = require('fs');

const targetFile = 'C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/src/components/AnnualEvaluationDashboard.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. effectiveAllMembers: Add dynamicEmployees
const targetSpecialStaff = `    SPECIAL_STAFF_MEMBERS.forEach(s => {
      const k = normalizeAgentName(s.agent_name);
      if (!map.has(k)) {
        map.set(k, { ...s });
      } else {
        const existing = map.get(k);
        map.set(k, { ...existing, ...s });
      }
    });`;

const replacementSpecialStaff = `    SPECIAL_STAFF_MEMBERS.forEach(s => {
      const k = normalizeAgentName(s.agent_name);
      if (!map.has(k)) {
        map.set(k, { ...s });
      } else {
        const existing = map.get(k);
        map.set(k, { ...existing, ...s });
      }
    });

    // Add dynamic employees from Manage Staff
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

if (content.includes(targetSpecialStaff)) {
  content = content.replace(targetSpecialStaff, replacementSpecialStaff);
  content = content.replace(
    '}, [allMembers, internalMembers]);',
    '}, [allMembers, internalMembers, dynamicEmployees]);'
  );
  console.log('Successfully injected dynamicEmployees into effectiveAllMembers');
} else {
  console.log('WARNING: targetSpecialStaff not found');
}

// 2. In lines 1574-1590: Replace kpiDefinitions and currentCompetenciesList in selfOverall and managerOverall
content = content.replace(
  'const kpiVals = kpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);',
  'const kpiVals = activeKpiDefinitions.map(k => getKpiScore(selfKpis, k.id)).filter(v => v > 0);'
);
content = content.replace(
  'const compVals = currentCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);',
  'const compVals = activeCompetenciesList.map(c => selfCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);'
);
content = content.replace(
  'const kpiVals = kpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);',
  'const kpiVals = activeKpiDefinitions.map(k => getKpiScore(managerKpis, k.id)).filter(v => v > 0);'
);
content = content.replace(
  'const compVals = currentCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);',
  'const compVals = activeCompetenciesList.map(c => managerCompetencies[c.id]).filter(v => v !== undefined && v !== null && v > 0);'
);
console.log('Successfully updated selfOverall and managerOverall to active definitions');

// 3. Mount ManageCriteriaModal and ManageStaffModal right above Copied Toast Notification
const toastTarget = `{/* Copied Toast Notification */}`;
const modalMarkup = `{/* Manage Criteria Modal */}
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

if (content.includes(toastTarget)) {
  content = content.replace(toastTarget, modalMarkup);
  console.log('Successfully mounted ManageCriteriaModal and ManageStaffModal');
} else {
  console.log('WARNING: toastTarget not found');
}

// 4. In handleSaveEvaluation: Save to localStorage as well
const saveFirestoreCall = `await setDoc(doc(db, "annual_evaluations", docId), payload, { merge: true });`;
const saveWithLocal = `await setDoc(doc(db, "annual_evaluations", docId), payload, { merge: true });

      // LocalStorage backup
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
      } catch (e) {
        console.warn("localStorage evaluation save warning:", e);
      }`;

if (content.includes(saveFirestoreCall) && !content.includes('localStorage evaluation save warning')) {
  content = content.replace(saveFirestoreCall, saveWithLocal);
  console.log('Successfully added localStorage saving in handleSaveEvaluation');
}

// 5. In useEffect for docId loading: Load from localStorage fallback if exists
const unsubCall = `const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
      if (!isMounted) return;`;

const unsubWithLocalFallback = `const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
      if (!isMounted) return;

      // Local storage fallback for instant response
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
      }`;

if (content.includes(unsubCall) && !content.includes('Local storage fallback for instant response')) {
  content = content.replace(unsubCall, unsubWithLocalFallback);
  console.log('Successfully added localStorage fallback on docId load');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully written file, length:', content.length);
