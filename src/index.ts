import { fetchAllPatients, submitAssessment, Patient } from './api';
import { parseBloodPressure, parseTemperature, parseAge } from './parsers';
import { calculateBPRisk, calculateTempRisk, calculateAgeRisk, calculateTotalRisk } from './scoring';

const main = async () => {
    try {
        const patients = await fetchAllPatients();

        const highRiskPatients: string[] = [];
        const feverPatients: string[] = [];
        const dataQualityIssues: string[] = [];
        for (const p of patients) {
            // Parse
            const bp = parseBloodPressure(p.blood_pressure);
            const temp = parseTemperature(p.temperature);
            const age = parseAge(p.age);

            // Data Quality Check
            if (!bp.valid || !temp.valid || !age.valid) {
                dataQualityIssues.push(p.patient_id);
            }

            // Score
            const bpScore = calculateBPRisk(bp);
            const tempScore = calculateTempRisk(temp.value, temp.valid);
            const ageScore = calculateAgeRisk(age.value, age.valid);

            const totalScore = calculateTotalRisk(bpScore, tempScore, ageScore);

            // High Risk Check
            if (totalScore >= 4) {
                highRiskPatients.push(p.patient_id);
            }

            // Fever Check
            if (temp.valid && temp.value >= 99.6) {
                feverPatients.push(p.patient_id);
            }
        }

        const assessmentResults = {
            high_risk_patients: highRiskPatients,
            fever_patients: feverPatients,
            data_quality_issues: dataQualityIssues
        };

        console.log('Processed', patients.length, 'patients.');
        console.log('Submitting results...');
        console.log(JSON.stringify(assessmentResults, null, 2));

        await submitAssessment(assessmentResults);

    } catch (error) {
        console.error('Fatal error in assessment runner:', error);
        process.exit(1);
    }
};

main();
