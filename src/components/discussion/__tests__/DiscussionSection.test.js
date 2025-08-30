import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DiscussionSection from '../DiscussionSection'
import { AuthProvider } from '../../../contexts/AuthContext'

// Mock the DiscussionService
jest.mock('../../../services/discussion/discussionService', () => ({
    DiscussionService: {
        getDiscussionsWithUsers: jest.fn(),
        createDiscussion: jest.fn(),
        voteDiscussion: jest.fn(),
        deleteDiscussion: jest.fn()
    }
}))

const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
}

const renderWithAuth = (component) => {
    return render(
        <AuthProvider>
            {component}
        </AuthProvider>
    )
}

describe('DiscussionSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders discussion section with title', async () => {
        const { DiscussionService } = require('../../../services/discussion/discussionService')
        DiscussionService.getDiscussionsWithUsers.mockResolvedValue({
            data: [],
            error: null
        })

        renderWithAuth(<DiscussionSection questionId={1} />)

        // Wait for loading to complete and title to appear
        await waitFor(() => {
            expect(screen.getByText(/Discussions/)).toBeInTheDocument()
        })
    })

    test('shows loading state initially', async () => {
        const { DiscussionService } = require('../../../services/discussion/discussionService')
        // Don't mock the service for this test to see loading state
        DiscussionService.getDiscussionsWithUsers.mockImplementation(() =>
            new Promise(() => { }) // Never resolves to keep loading state
        )

        renderWithAuth(<DiscussionSection questionId={1} />)

        expect(screen.getByText('Loading discussions...')).toBeInTheDocument()
    })

    test('shows no comments message when no discussions exist', async () => {
        const { DiscussionService } = require('../../../services/discussion/discussionService')
        DiscussionService.getDiscussionsWithUsers.mockResolvedValue({
            data: [],
            error: null
        })

        renderWithAuth(<DiscussionSection questionId={1} />)

        // Wait for loading to complete
        await screen.findByText('No comments yet. Be the first to comment!')
    })
})
