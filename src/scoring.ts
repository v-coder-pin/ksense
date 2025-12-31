import { ParsedBP } from './parsers';

export const calculateBPRisk = (bp: ParsedBP): number => {
    if (!bp.valid) return 0;

    const { sys, dia } = bp;

    // Determine category for Systolic
    let sysScore = 0;
    if (sys >= 140) sysScore = 3;
    else if (sys >= 130) sysScore = 2;
    else if (sys >= 120) sysScore = 1;
    else sysScore = 0;

    // Determine category for Diastolic
    let diaScore = 0;
    if (dia >= 90) diaScore = 3;
    else if (dia >= 80) diaScore = 2;
    else diaScore = 0;


    return Math.max(sysScore, diaScore);
};

export const calculateTempRisk = (temp: number, valid: boolean): number => {
    if (!valid) return 0;

    if (temp >= 101) return 2;
    if (temp >= 99.6) return 1;
    return 0;
};

export const calculateAgeRisk = (age: number, valid: boolean): number => {
    if (!valid) return 0;

    if (age > 65) return 2;
    else if (age >= 40) return 1;
    return 0;
};

export const calculateTotalRisk = (bpScore: number, tempScore: number, ageScore: number): number => {
    return bpScore + tempScore + ageScore;
};
