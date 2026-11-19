import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialElonAlgoVersionState,
  executeElonAlgoAndAgentsVersionRun,
  routeHermesOperationTrigger,
  calculateFrontDeskLeadFitScore,
  resolveHitlApprovalWebhook,
  ensureAtLeastOneCyclePerDay,
  VERTEX_AI_RAG_DATA_STORES,
  VERTEX_OPENAPI_CLOUD_RUN_TOOLS,
  ELON_FIVE_STEP_ALGORITHM,
} from './hermesVertexOrchestratorAndElonAlgo';

test('Hermes Root Orchestrator deterministically routes all 8 departmental triggers and enforces HITL gates', () => {
  const r1 = routeHermesOperationTrigger('INBOUND_LEAD_WEB_CHAT_MISSED_CALL');
  assert.equal(r1.routedAgentId, 'Front_Desk_Agent');
  assert.equal(r1.requiresHitlGate, false);

  const r2 = routeHermesOperationTrigger('COMPLETED_DISCOVERY_CALL_PRICING');
  assert.equal(r2.routedAgentId, 'Quotes_Proposals_Agent');
  assert.equal(r2.requiresHitlGate, true);

  const r3 = routeHermesOperationTrigger('MEETING_RECORDING_TRANSCRIPT');
  assert.equal(r3.routedAgentId, 'Meetings_Calls_Agent');

  const r4 = routeHermesOperationTrigger('PROJECT_COMPLETION_BILLING_EVENT');
  assert.equal(r4.routedAgentId, 'Payments_Collections_Agent');
  assert.equal(r4.requiresHitlGate, true);

  const r5 = routeHermesOperationTrigger('INTERNAL_DOCUMENT_SOP_QUERY');
  assert.equal(r5.routedAgentId, 'Company_Brain_Agent');

  const r6 = routeHermesOperationTrigger('EMAIL_TRIAGE_TODO_SCHEDULING');
  assert.equal(r6.routedAgentId, 'Inbox_Tasks_Agent');
  assert.equal(r6.requiresHitlGate, true);

  const r7 = routeHermesOperationTrigger('EMPLOYEE_ONBOARDING_LEAVE_EQUIPMENT');
  assert.equal(r7.routedAgentId, 'HR_Onboarding_Agent');

  const r8 = routeHermesOperationTrigger('DAILY_METRICS_8AM_SCHEDULED_TRIGGER');
  assert.equal(r8.routedAgentId, 'Reporting_Insights_Agent');
});

test('Front_Desk_Agent calculates Lead Fit Score (0-100) and qualifies leads >= 75 with Calendar booking link', () => {
  const highFit = calculateFrontDeskLeadFitScore({
    teamOrOrderSizeUnits: 10,
    roughBudgetUsd: 18000,
    targetStartDays: 10,
    isMissedCallVoicemail: true,
  });
  assert.ok(highFit.fitScore >= 75);
  assert.equal(highFit.crmQualificationStatus, 'QUALIFIED');
  assert.equal(highFit.calendarBookingLinkOffered, true);
  assert.equal(highFit.smsVoicemailReplyDispatched, true);

  const lowFit = calculateFrontDeskLeadFitScore({
    teamOrOrderSizeUnits: 1,
    roughBudgetUsd: 1000,
    targetStartDays: 90,
    isMissedCallVoicemail: false,
  });
  assert.ok(lowFit.fitScore < 75);
  assert.equal(lowFit.crmQualificationStatus, 'NURTURE_BELOW_THRESHOLD');
  assert.equal(lowFit.calendarBookingLinkOffered, false);
});

test('Each agent writes 3 SMART goals and accomplishes 2 of them every version run with gradual Elon Algo improvements', () => {
  const initial = createInitialElonAlgoVersionState();
  assert.equal(initial.subAgents.length, 8);
  assert.equal(ELON_FIVE_STEP_ALGORITHM.length, 5);
  assert.ok(VERTEX_AI_RAG_DATA_STORES.length >= 4);
  assert.ok(VERTEX_OPENAPI_CLOUD_RUN_TOOLS.length >= 5);

  // Verify initial state has 3 goals written and 2 accomplished per agent
  for (const agent of initial.subAgents) {
    assert.equal(agent.activeSmartGoals.length, 3);
    const accomplished = agent.activeSmartGoals.filter(
      (g) => g.status === 'ACCOMPLISHED_THIS_RUN'
    );
    assert.equal(accomplished.length, 2);
  }

  // Run a version iteration
  const next = executeElonAlgoAndAgentsVersionRun(initial);
  assert.equal(next.versionMinor, initial.versionMinor + 1);
  assert.ok(next.subMmCadToleranceMm < initial.subMmCadToleranceMm);
  assert.ok(next.overBarrelPlenumEfficiencyPct > initial.overBarrelPlenumEfficiencyPct);
  assert.ok(next.underBarrel300BCheckValveLockMs < initial.underBarrel300BCheckValveLockMs);
  assert.ok(next.stlMeshSlicingFrameTimeMs < initial.stlMeshSlicingFrameTimeMs);

  // Verify Root + all 8 Sub-Agents each wrote 3 new SMART goals and accomplished 2
  assert.equal(next.rootOrchestratorSmartGoals.length, 3);
  assert.equal(
    next.rootOrchestratorSmartGoals.filter((g) => g.status === 'ACCOMPLISHED_THIS_RUN').length,
    2
  );
  for (const agent of next.subAgents) {
    assert.equal(agent.activeSmartGoals.length, 3);
    const accomplished = agent.activeSmartGoals.filter(
      (g) => g.status === 'ACCOMPLISHED_THIS_RUN'
    );
    assert.equal(accomplished.length, 2);
    assert.equal(agent.totalGoalsAccomplished, 4);
  }
  assert.equal(next.totalSmartGoalsWrittenAcrossRuns, 54);
  assert.equal(next.totalSmartGoalsAccomplishedAcrossRuns, 36);
});

test('HITL Approval Gate transitions deal status to SENT_FOR_ESIGNATURE only upon APPROVED webhook', () => {
  const initial = createInitialElonAlgoVersionState();
  const targetId = initial.hitlApprovalQueue[0].approvalId;
  assert.equal(initial.hitlApprovalQueue[0].crmDealStatus, 'AWAITING_HITL_APPROVAL');

  const approved = resolveHitlApprovalWebhook(
    initial,
    targetId,
    'APPROVED_WEBHOOK_RECEIVED'
  );
  assert.equal(approved.hitlApprovalQueue[0].crmDealStatus, 'SENT_FOR_ESIGNATURE');
  assert.equal(approved.hitlApprovalQueue[0].internalMarginHiddenExternally, true);
});

test('Self-Maintaining Daily Routines (/schedule) and ensureAtLeastOneCyclePerDay guarantee >= 1 cycle per day across CLI, iOS, Android, and Desktop', () => {
  const yesterdayState = createInitialElonAlgoVersionState('2026-10-31');
  assert.equal(yesterdayState.selfMaintainingRoutines.length, 5);
  assert.equal(yesterdayState.dailyPrTruckConveyor.length, 5);
  assert.equal(
    yesterdayState.selfMaintainingRoutines[0].singleSentencePrompt,
    'clean up dead code'
  );
  assert.equal(
    yesterdayState.selfMaintainingRoutines[4].id,
    'ROUTINE_5_ABSTRACTION_POLICE'
  );

  // When a new day arrives ('2026-11-01'), ensureAtLeastOneCyclePerDay automatically runs a full cycle
  const { nextState, didAutoRunCycle } = ensureAtLeastOneCyclePerDay(
    yesterdayState,
    '2026-11-01'
  );
  assert.equal(didAutoRunCycle, true);
  assert.equal(nextState.lastDailyCycleDateYmd, '2026-11-01');
  assert.ok(nextState.dailyCyclesCompletedToday >= 1);
  assert.equal(nextState.runCount, yesterdayState.runCount + 1);
  assert.equal(nextState.dailyPrTruckConveyor.length, 5);

  // Calling ensureAtLeastOneCyclePerDay again on the same day does not double-trigger if >= 1 cycle already ran
  const secondCheck = ensureAtLeastOneCyclePerDay(nextState, '2026-11-01');
  assert.equal(secondCheck.didAutoRunCycle, false);
});

