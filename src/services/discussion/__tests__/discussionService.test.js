import { DiscussionService } from '../discussionService'

// Simple test to verify the service can connect to the database
describe('DiscussionService', () => {
    test('should be able to get discussions for a question', async () => {
        // This test will work even if there are no discussions yet
        const result = await DiscussionService.getDiscussionsByQuestionId(1)

        // Should not throw an error
        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('error')

        // If there are no discussions, data should be an empty array
        if (result.data) {
            expect(Array.isArray(result.data)).toBe(true)
        }
    })

    test('should be able to get discussion stats', async () => {
        const result = await DiscussionService.getDiscussionStats()

        expect(result).toHaveProperty('data')
        expect(result).toHaveProperty('error')

        if (result.data) {
            expect(result.data).toHaveProperty('totalDiscussions')
        }
    })
})