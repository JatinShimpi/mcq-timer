// Calculate analytics from all sessions
export function calculateAnalytics(sessions) {
    const allAttempts = sessions.flatMap(s => s.attempts || []);
    const allResults = allAttempts.flatMap(a => a.results || []);

    // Basic stats
    const totalSessions = sessions.length;
    const totalAttempts = allAttempts.length;
    const totalQuestions = allResults.length;

    // Calculate accuracy
    const correctAnswers = allResults.filter(r => r.status === 'correct').length;
    const incorrectAnswers = allResults.filter(r => r.status === 'incorrect').length;
    const skippedAnswers = allResults.filter(r => r.status === 'skip' || r.status === 'timeout').length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Time analysis
    const totalTimeSpent = allResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0);
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0;

    // Recent performance (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentAttempts = allAttempts.filter(a => new Date(a.date).getTime() > sevenDaysAgo);
    const recentResults = recentAttempts.flatMap(a => a.results || []);
    const recentCorrect = recentResults.filter(r => r.status === 'correct').length;
    const recentAccuracy = recentResults.length > 0 ? Math.round((recentCorrect / recentResults.length) * 100) : 0;

    // Topic breakdown
    const topicStats = {};
    sessions.forEach(session => {
        const topic = session.topic || 'Untitled';
        if (!topicStats[topic]) {
            topicStats[topic] = { attempts: 0, correct: 0, total: 0 };
        }
        (session.attempts || []).forEach(attempt => {
            topicStats[topic].attempts++;
            (attempt.results || []).forEach(result => {
                topicStats[topic].total++;
                if (result.status === 'correct') topicStats[topic].correct++;
            });
        });
    });

    // Daily activity (last 30 days)
    const dailyActivity = {};
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    allAttempts
        .filter(a => new Date(a.date).getTime() > thirtyDaysAgo)
        .forEach(attempt => {
            const date = new Date(attempt.date).toISOString().split('T')[0];
            if (!dailyActivity[date]) {
                dailyActivity[date] = { attempts: 0, questions: 0 };
            }
            dailyActivity[date].attempts++;
            dailyActivity[date].questions += (attempt.results || []).length;
        });

    // Streak calculation
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDates = Object.keys(dailyActivity).sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (dailyActivity[checkDate]) {
            currentStreak++;
        } else if (checkDate !== today) {
            break;
        }
    }

    // Calculate max streak
    let tempStreak = 0;
    sortedDates.forEach((date, i) => {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(date);
            const diffDays = (prevDate - currDate) / (24 * 60 * 60 * 1000);
            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);
    });

    return {
        totalSessions,
        totalAttempts,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        skippedAnswers,
        accuracy,
        totalTimeSpent,
        avgTimePerQuestion,
        recentAccuracy,
        recentAttempts: recentAttempts.length,
        topicStats,
        dailyActivity,
        currentStreak,
        maxStreak
    };
}
