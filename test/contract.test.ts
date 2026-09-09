import { describe, it, expect, beforeEach } from 'vitest';
import { EligibilityGateClient } from '../src/midnight/contractClient';
import { MidnightZKProverEngine } from '../src/midnight/zkProver';

describe('Midnight Network Compact Contract: Eligibility Gate Test Suite', () => {
  let client: EligibilityGateClient;

  beforeEach(() => {
    client = EligibilityGateClient.getInstance();
    client.resetToDefaults();
  });

  it('Test 1: Successfully proves eligibility when witness age meets threshold (Age >= 18)', async () => {
    const initialState = client.getState();
    const initialVerifications = initialState.totalVerifications;
    const threshold = initialState.minAgeThreshold; // 18

    // User is 24 years old (Eligible)
    const witness = { age: 24, salt: '0xabc123' };

    const result = await client.verifyEligibility(witness);

    // 1. Proof verification outcome
    expect(result.isEligible).toBe(true);
    expect(result.txHash).toBeDefined();
    expect(result.proofHash).toBeDefined();
    expect(result.nullifier).toBeDefined();

    // 2. Ledger state transition check
    const updatedState = client.getState();
    expect(updatedState.totalVerifications).toBe(initialVerifications + 1);

    // 3. Verify logs recorded the on-chain event
    const logs = client.getLogs();
    expect(logs[0].txHash).toBe(result.txHash);
    expect(logs[0].isEligible).toBe(true);
  });

  it('Test 2: Rejects proof when witness age is below threshold without leaking private age', async () => {
    const initialState = client.getState();
    const initialVerifications = initialState.totalVerifications;

    // User is 16 years old (Ineligible for 18+ gate)
    const witness = { age: 16, salt: '0xdef456' };

    const result = await client.verifyEligibility(witness);

    // 1. Proof verification outcome must be false
    expect(result.isEligible).toBe(false);

    // 2. Public ledger counter must NOT increment
    const updatedState = client.getState();
    expect(updatedState.totalVerifications).toBe(initialVerifications);

    // 3. Confirm that no public log or payload exposes the value 16
    const logs = client.getLogs();
    expect(logs[0].isEligible).toBe(false);
    expect(JSON.stringify(logs[0])).not.toContain('"age":16');
  });

  it('Test 3: Zero-Knowledge Privacy Invariant - Witness parameters never exist in public payload', async () => {
    const privateAge = 42;
    const privateSalt = '0xsecret_salt_998877';

    const proofPayload = await MidnightZKProverEngine.executeEligibilityProof(
      { age: privateAge, salt: privateSalt },
      18
    );

    // Assert that the public payload structure only contains circuit name, disclosed output, and commitments
    expect(proofPayload.circuitName).toBe('verifyEligibility');
    expect(proofPayload.disclosedOutput.isEligible).toBe(true);
    expect(proofPayload.publicInputs.minAgeThreshold).toBe(18);

    // Privacy assertion: private parameters are not in the payload keys or values
    const serializedPayload = JSON.stringify(proofPayload);
    expect(serializedPayload).not.toContain(String(privateAge));
    expect(serializedPayload).not.toContain(privateSalt);
    expect((proofPayload as any).age).toBeUndefined();
    expect((proofPayload as any).witness).toBeUndefined();
  });

  it('Test 4: Administrative Circuit & Dynamic Threshold Update (21+ Gate)', async () => {
    // 1. Update minimum age threshold to 21
    await client.setMinAgeThreshold(21);
    expect(client.getState().minAgeThreshold).toBe(21);

    // 2. An 19-year-old user was eligible for 18+, but is now ineligible for 21+
    const result19 = await client.verifyEligibility({ age: 19 });
    expect(result19.isEligible).toBe(false);

    // 3. A 22-year-old user is eligible for 21+
    const result22 = await client.verifyEligibility({ age: 22 });
    expect(result22.isEligible).toBe(true);

    // 4. Test emergency gate pause circuit
    await client.toggleGateActive();
    expect(client.getState().gateActive).toBe(false);

    await expect(client.verifyEligibility({ age: 25 })).rejects.toThrow(
      'Circuit Precondition Failed: Eligibility gate is paused'
    );
  });
});
