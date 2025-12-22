
import { describe, it, expect } from 'vitest';
import { TribeService, UserProfileStub } from '../src/services/api/tribes';

// Mock Data
const userA: UserProfileStub = {
    id: 'userA', email: 'a@test.com', name: 'User A', instagram: '@a',
    category: 'Moda Mujer', city: 'Santiago', affinity: 'Moda Mujer'
};

const userCompetitor: UserProfileStub = {
    id: 'userB', email: 'b@test.com', name: 'User B', instagram: '@b',
    category: 'Moda Mujer', city: 'Viña', affinity: 'None'
};

const userComplementary: UserProfileStub = {
    id: 'userC', email: 'c@test.com', name: 'User C', instagram: '@c',
    category: 'Belleza', city: 'Rancagua', affinity: 'None'
};

const userLocal: UserProfileStub = {
    id: 'userD', email: 'd@test.com', name: 'User D', instagram: '@d',
    category: 'Mecánica', city: 'Santiago', affinity: 'None'
};

describe('TribeService Matchmaking Algorithm', () => {

    it('should penalize competitors correctly', () => {
        // We can't access calculateCompatibilityScore directly if it's not exported,
        // but we can test the result of calculateAssignments
        const result = TribeService.calculateAssignments(userA, [userCompetitor]);
        // Should be excluded or very low on list if logic holds
        // In current implementation, score < -50 is filtered out
        expect(result.iShareTo).not.toContain('userB');
    });

    it('should prioritize complementary categories', () => {
        const result = TribeService.calculateAssignments(userA, [userComplementary, userLocal]);
        // userC (Belleza) is complementary to userA (Moda Mujer affinity) -> Score ~80
        // userD (Mecánica) is just Local -> Score ~65 (50 base + 15 city)

        // We expect userC to be the first match if both are returned
        expect(result.iShareTo[0]).toBe('userC');
    });

    it('should exclude the current user from results', () => {
        const result = TribeService.calculateAssignments(userA, [userA, userComplementary]);
        expect(result.iShareTo).not.toContain('userA');
        expect(result.iShareTo).toContain('userC');
    });

    it('should return a maximum of 10 matches', () => {
        const candidates = Array.from({ length: 20 }, (_, i) => ({
            id: `user${i}`,
            email: `user${i}@test.com`,
            name: `User ${i}`,
            category: 'Construcción', // Neutral category
            instagram: `@user${i}`,
            city: 'Arica'
        }));

        const result = TribeService.calculateAssignments(userA, candidates);
        expect(result.iShareTo.length).toBeLessThan(11); // Should be 10 or less
        expect(result.iShareTo.length).toBe(10);
    });

});
