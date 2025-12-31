export interface ParsedBP {
    sys: number;
    dia: number;
    valid: boolean;
}

export const parseBloodPressure = (bp: any): ParsedBP => {
    const invalid = { sys: 0, dia: 0, valid: false };

    if (!bp || typeof bp !== 'string') return invalid;
    if (bp.includes('INVALID') || bp.includes('error') || bp.includes('N/A')) return invalid;

    const parts = bp.split('/');
    if (parts.length !== 2) return invalid;

    const sysStr = parts[0].trim();
    const diaStr = parts[1].trim();

    if (sysStr === '' || diaStr === '') return invalid;

    const sys = Number(sysStr);
    const dia = Number(diaStr);

    if (isNaN(sys) || isNaN(dia)) return invalid;

    return { sys, dia, valid: true };
};

export const parseTemperature = (temp: any): { value: number, valid: boolean } => {
    if (temp === null || temp === undefined || temp === '') return { value: 0, valid: false };

    if (typeof temp === 'string') {
        const parsed = parseFloat(temp);
        if (isNaN(parsed)) return { value: 0, valid: false };
        return { value: parsed, valid: true };
    }

    if (typeof temp === 'number') {
        if (isNaN(temp)) return { value: 0, valid: false };
        return { value: temp, valid: true };
    }

    return { value: 0, valid: false };
};

export const parseAge = (age: any): { value: number, valid: boolean } => {
    if (age === null || age === undefined || age === '') return { value: 0, valid: false };

    if (typeof age === 'string') {
        const parsed = parseInt(age, 10);
        if (isNaN(parsed)) return { value: 0, valid: false };
        return { value: parsed, valid: true };
    }

    if (typeof age === 'number') {
        if (isNaN(age)) return { value: 0, valid: false };
        return { value: age, valid: true };
    }

    return { value: 0, valid: false };
};
