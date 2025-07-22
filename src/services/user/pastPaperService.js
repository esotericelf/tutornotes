import { supabase } from '../supabase'

export class PastPaperService {
    // Get all math past paper questions
    static async getMathPastPapers() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get math past papers by year
    static async getMathPastPapersByYear(year) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get math past papers by question number
    static async getMathPastPapersByQuestionNumber(questionNo) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('question_no', questionNo)
                .order('year', { ascending: false })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get single math past paper question by ID
    static async getMathPastPaperById(id) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Search math past papers by content
    static async searchMathPastPapers(searchTerm) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .or(`correct_answer.ilike.%${searchTerm}%,option_a.ilike.%${searchTerm}%,option_b.ilike.%${searchTerm}%,option_c.ilike.%${searchTerm}%,option_d.ilike.%${searchTerm}%`)
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get available years
    static async getAvailableYears() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('year')
                .order('year', { ascending: false })

            if (error) throw error

            // Get unique years
            const uniqueYears = [...new Set(data.map(item => item.year))]
            return { data: uniqueYears, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get available question numbers
    static async getAvailableQuestionNumbers() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('question_no')
                .order('question_no', { ascending: true })

            if (error) throw error

            // Get unique question numbers
            const uniqueQuestionNumbers = [...new Set(data.map(item => item.question_no))]
            return { data: uniqueQuestionNumbers, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get questions by year and question number
    static async getQuestionsByYearAndNumber(year, questionNo) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .eq('year', year)
                .eq('question_no', questionNo)

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get random question for practice
    static async getRandomQuestion() {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .limit(1)
                .order('RANDOM()')

            if (error) throw error
            return { data: data[0], error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get questions by year range
    static async getQuestionsByYearRange(startYear, endYear) {
        try {
            const { data, error } = await supabase
                .from('Math_Past_Paper')
                .select('*')
                .gte('year', startYear)
                .lte('year', endYear)
                .order('year', { ascending: false })
                .order('question_no', { ascending: true })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Get statistics
    static async getMathPastPaperStats() {
        try {
            const [totalQuestions, yearsCount, questionNumbersCount] = await Promise.all([
                supabase.from('Math_Past_Paper').select('*', { count: 'exact' }),
                supabase.from('Math_Past_Paper').select('year'),
                supabase.from('Math_Past_Paper').select('question_no')
            ])

            const uniqueYears = [...new Set(yearsCount.data.map(item => item.year))]
            const uniqueQuestionNumbers = [...new Set(questionNumbersCount.data.map(item => item.question_no))]

            return {
                data: {
                    totalQuestions: totalQuestions.count,
                    totalYears: uniqueYears.length,
                    totalQuestionNumbers: uniqueQuestionNumbers.length,
                    yearRange: {
                        min: Math.min(...uniqueYears),
                        max: Math.max(...uniqueYears)
                    }
                },
                error: null
            }
        } catch (error) {
            return { data: null, error }
        }
    }
}

export default PastPaperService