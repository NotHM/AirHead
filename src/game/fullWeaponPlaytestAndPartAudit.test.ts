import assert from 'node:assert/strict';
import test from 'node:test';
import {
  runFullGamePlaytestAndPartQualityAudit,
  AGENT_RETALIATION_36_NEXT_STEPS,
  runAutonomousAgentGamePlaytestWithDelegation,
} from './fullWeaponPlaytestAndPartAudit';

test('Full Playtest & Part-by-Part Agent Quality Audit sits down with every gun (#01 Mongo through #09 The Protector), fires all rounds, verifies 3D centering & contiguity, and tests 36 Retaliation Steps + 1B->4B Delegation', () => {
  const report = runFullGamePlaytestAndPartQualityAudit();

  assert.equal(report.totalWeaponsPlaytested, 9);
  assert.equal(report.allWeaponsCenteredAndContiguous, true);
  assert.equal(report.leshiy2RealSpecVerified, true);
  assert.equal(report.theLeaf45OnLeshiy2Verified, true);
  assert.equal(report.p50FourReservesBipodLaserVerified, true);
  assert.equal(report.ascent45CustomContiguousVerified, true);
  assert.ok(report.totalShotsFiredAcrossAllGuns >= 50);
  assert.ok(report.totalPartsScrewsOringsInspected >= 100);

  for (const weapon of report.weaponReports) {
    assert.equal(weapon.allRoundsCycledCleanly, true, `${weapon.shortTitle} must cycle all rounds cleanly`);
    assert.equal(weapon.isCenteredInViewport, true, `${weapon.shortTitle} must be centered near [0,0,0]`);
    assert.equal(weapon.hasZeroFloatingGapsWhenAssembled, true);
    assert.ok(weapon.partAgentAssignments.length >= 12, `${weapon.shortTitle} must have all parts, screws, and O-rings assigned to agents`);
    assert.ok(weapon.averageQualityScoreAfter >= 99);
  }

  assert.equal(AGENT_RETALIATION_36_NEXT_STEPS.length, 36);
  const playtestDelegation = runAutonomousAgentGamePlaytestWithDelegation();
  assert.equal(playtestDelegation.totalWeaponsTested, 9);
  assert.ok(playtestDelegation.delegationsFrom1BTo4B >= 4);
  assert.equal(playtestDelegation.allDelegationsCompletedBy4B, true);
});

