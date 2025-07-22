import { supabase } from '../supabase'

export class MathPastPaperAdminService {
    // Create new math past paper question
    static async createMathPastPaper(questionData) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .insert({
                    year: questionData.year,
                    question_no: questionData.question_no,
                    correct_answer: questionData.correct_answer,
                    option_a: questionData.option_a,
                    option_b: questionData.option_b,
                    option_c: questionData.option_c,
                    option_d: questionData.option_d,
                    option_a_graph: questionData.option_a_graph || null,
                    option_b_graphic: questionData.option_b_graphic || null,
                    option_c_graphic: questionData.option_c_graphic || null,
                    option_d_graphic: questionData.option_d_graphic || null,
                    user_id: questionData.user_id
                })
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Update math past paper question
    static async updateMathPastPaper(id, updates) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .update({
                    year: updates.year,
                    question_no: updates.question_no,
                    correct_answer: updates.correct_answer,
                    option_a: updates.option_a,
                    option_b: updates.option_b,
                    option_c: updates.option_c,
                    option_d: updates.option_d,
                    option_a_graph: updates.option_a_graph,
                    option_b_graphic: updates.option_b_graphic,
                    option_c_graphic: updates.option_c_graphic,
                    option_d_graphic: updates.option_d_graphic
                })
                .eq('id', id)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Delete math past paper question
    static async deleteMathPastPaper(id) {
        try {
            const { error } = await supabase
                .from('Math_Past_Paper')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Get all math past papers (admin view)
    static async getAllMathPastPapers() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select(`
          *,
          profiles:user_id (id, email, full_name)
        `)
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Bulk insert math past paper questions
    static async bulkInsertMathPastPapers(questionsArray) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .insert(questionsArray)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Delete questions by year
    static async deleteQuestionsByYear(year) {
        try {
            const { error } = await supabase
                .from('Math_Past_Paper')
                .delete()
                .eq('year', year)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Delete questions by question number
    static async deleteQuestionsByQuestionNumber(questionNo) {
        try {
            const { error } = await supabase
                .from('Math_Past_Paper')
                .delete()
                .eq('question_no', questionNo)

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    // Update question graphics
    static async updateQuestionGraphics(id, graphicsData) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .update({
                    option_a_graph: graphicsData.option_a_graph,
                    option_b_graphic: graphicsData.option_b_graphic,
                    option_c_graphic: graphicsData.option_c_graphic,
                    option_d_graphic: graphicsData.option_d_graphic
                })
                .eq('id', id)
                .select()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get questions by user (who created them)
    static async getQuestionsByUser(userId) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('user_id', userId)
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get questions with missing graphics
    static async getQuestionsWithMissingGraphics() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .or('option_a_graph.is.null,option_b_graphic.is.null,option_c_graphic.is.null,option_d_graphic.is.null')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get questions with missing options
    static async getQuestionsWithMissingOptions() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .or('option_a.is.null,option_b.is.null,option_c.is.null,option_d.is.null')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get detailed statistics for admin
    static async getDetailedMathPastPaperStats() {
        try {
            const [totalQuestions, yearsData, questionNumbersData, usersData] = await Promise.all([
                supabase.from('Math_Past_Paper').select('*', { count: 'exact' }),
                supabase.from('Math_Past_Paper').select('year'),
                supabase.from('Math_Past_Paper').select('question_no'),
                supabase.from('Math_Past_Paper').select('user_id')
            ])

            const uniqueYears = [...new Set(yearsData.data.map(item => item.year))]
            const uniqueQuestionNumbers = [...new Set(questionNumbersData.data.map(item => item.question_no))]
            const uniqueUsers = [...new Set(usersData.data.map(item => item.user_id).filter(Boolean))]

            // Count questions per year
            const questionsPerYear = yearsData.data.reduce((acc, item) => {
                acc[item.year] = (acc[item.year] || 0) + 1
                return acc
            }, {})

            return {
                data: {
                    totalQuestions: totalQuestions.count,
                    totalYears: uniqueYears.length,
                    totalQuestionNumbers: uniqueQuestionNumbers.length,
                    totalContributors: uniqueUsers.length,
                    yearRange: {
                        min: Math.min(...uniqueYears),
                        max: Math.max(...uniqueYears)
                    },
                    questionsPerYear,
                    averageQuestionsPerYear: Math.round(totalQuestions.count / uniqueYears.length)
                },
                error: null
            }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default MathPastPaperAdminService