const fs = require('fs');

const targetFile = 'C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/src/components/AnnualEvaluationDashboard.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Fix line 757 and 768: isMemberActiveInPeriod with "YEAR - AVG"
content = content.replace(
  'isMemberActiveInPeriod(m, selectedPeriod === "Semi-Annual" ? "H1" : "YEAR - AVG", String(selectedYear))',
  'isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))'
);
content = content.replace(
  'isMemberActiveInPeriod(m, selectedPeriod === "Semi-Annual" ? "H1" : "YEAR - AVG", String(selectedYear))',
  'isMemberActiveInPeriod(m, "YEAR - AVG", String(selectedYear))'
);

// 2. Fix line 879: isChatSemi2026
content = content.replace(
  'return isSelectedEmployeeChat && selectedPeriod === "Semi-Annual" && String(selectedYear) === "2026";',
  'return false;'
);

// 3. Fix line 1061: setSelectedPeriod(period)
content = content.replace(
  'setSelectedPeriod(period);',
  'setSelectedPeriod("Annual");'
);

// 4. Fix line 1302: periodMonths
const periodMonthsSearch = `        const periodMonths = selectedPeriod === 'Semi-Annual'
          ? ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"] // Semi-Annual IS H1
          : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];`;
const periodMonthsReplacement = `        const periodMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];`;
content = content.replace(periodMonthsSearch, periodMonthsReplacement);

// 5. Fix knownId in docId useEffect
const docIdEffectSearch = `    let isMounted = true;
    const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
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
      }
      const norm = normalizeAgentName(currentMember?.agent_name || selectedEmployeeName || "");
      const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[currentMember?.id] || "";`;

const docIdEffectReplacement = `    let isMounted = true;
    const norm = normalizeAgentName(currentMember?.agent_name || selectedEmployeeName || "");
    const knownId = KNOWN_EMPLOYEE_IDS[norm] || KNOWN_EMPLOYEE_IDS[currentMember?.id] || "";

    const unsub = onSnapshot(doc(db, "annual_evaluations", docId), (docSnap) => {
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

content = content.replace(docIdEffectSearch, docIdEffectReplacement);

// 6. Fix order of activeKpiDefinitions and activeCompetenciesList
// Currently they are placed before kpiDefinitions and currentCompetenciesList.
// We should cut them out and paste them right after currentCompetenciesList!
const activeDefsSearch = `  // Dynamic user criteria mapped to KPI section
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
  }, [sections]);`;

if (content.includes(activeDefsSearch)) {
  content = content.replace(activeDefsSearch, ''); // remove from current location
  // Place after currentCompetenciesList
  const afterCompTarget = `    // Trainer & Regular Agents (6 standard competencies)
    return [
      COMPETENCY_DEFINITIONS.communication,
      COMPETENCY_DEFINITIONS.problem_solving,
      COMPETENCY_DEFINITIONS.accountability,
      COMPETENCY_DEFINITIONS.initiative,
      COMPETENCY_DEFINITIONS.responsibility,
      COMPETENCY_DEFINITIONS.team_work,
    ];
  }, [selectedEmployeeName, currentMember, currentMemberRoleType]);`;

  content = content.replace(
    afterCompTarget,
    afterCompTarget + '\n\n' + activeDefsSearch
  );
  console.log('Moved activeKpiDefinitions and activeCompetenciesList after base definitions');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed TypeScript errors in AnnualEvaluationDashboard.tsx');
