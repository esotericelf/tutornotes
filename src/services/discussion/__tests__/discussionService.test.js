import DiscussionService from '../discussionService'
import { supabase } from '../../supabase'

jest.mock('../../supabase')

describe('DiscussionService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getDiscussionsByNoteId', () => {
        test('should successfully get discussions by note ID', async () => {
            const mockData = [
                {
                    id: '1',
                    note_id: 'note1',
                    title: 'Question about algebra',
                    content: 'I need help with this problem',
                    user_id: 'user123',
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' },
                    replies: []
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await DiscussionService.getDiscussionsByNoteId('note1')

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          profiles:user_id (id, email, full_name, avatar_url),
          replies:discussion_replies (
            *,
            profiles:user_id (id, email, full_name, avatar_url)
          )
        `)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('createDiscussion', () => {
        test('should successfully create a new discussion', async () => {
            const mockDiscussionData = {
                noteId: 'note1',
                userId: 'user123',
                title: 'Question about algebra',
                content: 'I need help with this problem'
            }

            const mockData = { id: '1', ...mockDiscussionData, is_resolved: false }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await DiscussionService.createDiscussion(mockDiscussionData)

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockInsert).toHaveBeenCalledWith({
                note_id: mockDiscussionData.noteId,
                user_id: mockDiscussionData.userId,
                title: mockDiscussionData.title,
                content: mockDiscussionData.content,
                is_resolved: false
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateDiscussion', () => {
        test('should successfully update a discussion', async () => {
            const mockUpdates = {
                title: 'Updated question',
                content: 'Updated content',
                is_resolved: true
            }

            const mockData = { id: '1', ...mockUpdates }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await DiscussionService.updateDiscussion('1', mockUpdates)

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockUpdate).toHaveBeenCalledWith({
                title: mockUpdates.title,
                content: mockUpdates.content,
                is_resolved: mockUpdates.is_resolved,
                updated_at: expect.any(String)
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('deleteDiscussion', () => {
        test('should successfully delete a discussion', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await DiscussionService.deleteDiscussion('1')

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockDelete).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })
    })

    describe('addReply', () => {
        test('should successfully add a reply to a discussion', async () => {
            const mockReplyData = {
                discussionId: 'discussion1',
                userId: 'user123',
                content: 'This is a helpful reply'
            }

            const mockData = { id: '1', ...mockReplyData }
            const mockResponse = { data: mockData, error: null }

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                insert: mockInsert
            })

            const result = await DiscussionService.addReply(mockReplyData)

            expect(supabase.from).toHaveBeenCalledWith('discussion_replies')
            expect(mockInsert).toHaveBeenCalledWith({
                discussion_id: mockReplyData.discussionId,
                user_id: mockReplyData.userId,
                content: mockReplyData.content
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('updateReply', () => {
        test('should successfully update a reply', async () => {
            const mockUpdates = {
                content: 'Updated reply content'
            }

            const mockData = { id: '1', ...mockUpdates }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await DiscussionService.updateReply('1', mockUpdates)

            expect(supabase.from).toHaveBeenCalledWith('discussion_replies')
            expect(mockUpdate).toHaveBeenCalledWith({
                content: mockUpdates.content,
                updated_at: expect.any(String)
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('deleteReply', () => {
        test('should successfully delete a reply', async () => {
            const mockResponse = { error: null }

            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                delete: mockDelete
            })

            const result = await DiscussionService.deleteReply('1')

            expect(supabase.from).toHaveBeenCalledWith('discussion_replies')
            expect(mockDelete).toHaveBeenCalled()
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getUserDiscussions', () => {
        test('should successfully get user discussions', async () => {
            const mockData = [
                {
                    id: '1',
                    user_id: 'user123',
                    title: 'My question',
                    tutor_notes: { id: 'note1', title: 'Math Notes', category: 'Mathematics' },
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' }
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await DiscussionService.getUserDiscussions('user123')

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name)
        `)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('markDiscussionResolved', () => {
        test('should successfully mark discussion as resolved', async () => {
            const mockData = { id: '1', is_resolved: true, resolved_at: expect.any(String) }
            const mockResponse = { data: mockData, error: null }

            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                update: mockUpdate
            })

            const result = await DiscussionService.markDiscussionResolved('1')

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockUpdate).toHaveBeenCalledWith({
                is_resolved: true,
                resolved_at: expect.any(String)
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('getAllDiscussions', () => {
        test('should successfully get all discussions for admin', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Question about algebra',
                    tutor_notes: { id: 'note1', title: 'Math Notes', category: 'Mathematics' },
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' },
                    replies: []
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockResponse)
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await DiscussionService.getAllDiscussions()

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name),
          replies:discussion_replies (
            *,
            profiles:user_id (id, email, full_name)
          )
        `)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('searchDiscussions', () => {
        test('should successfully search discussions', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Question about algebra',
                    content: 'I need help with algebra',
                    tutor_notes: { id: 'note1', title: 'Math Notes', category: 'Mathematics' },
                    profiles: { id: 'user123', email: 'test@example.com', full_name: 'Test User' }
                }
            ]
            const mockResponse = { data: mockData, error: null }

            const mockSelect = jest.fn().mockReturnValue({
                or: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue(mockResponse)
                })
            })

            supabase.from.mockReturnValue({
                select: mockSelect
            })

            const result = await DiscussionService.searchDiscussions('algebra')

            expect(supabase.from).toHaveBeenCalledWith('discussions')
            expect(mockSelect).toHaveBeenCalledWith(`
          *,
          tutor_notes (id, title, category),
          profiles:user_id (id, email, full_name)
        `)
            expect(result).toEqual(mockResponse)
        })
    })
})