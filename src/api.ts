import axios from 'axios';
import axiosRetry from 'axios-retry';

export const API_KEY = 'ak_77ecadb96384941a8068b91d954474dda8cacc0ebf3502eb';
export const BASE_URL = 'https://assessment.ksensetech.com/api';

export interface Patient {
    patient_id: string;
    name: string;
    age: any;
    gender: string;
    blood_pressure: any;
    temperature: any;
    visit_date: string;
    diagnosis: string;
    medications: string;
}

export interface PaginatedResponse {
    data: Patient[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
});

axiosRetry(client, {
    retries: 5,
    retryDelay: (retryCount) => {
        // Exponential backoff with jitter
        const delay = Math.pow(2, retryCount) * 1000;
        const jitter = Math.random() * 500;
        return delay + jitter;
    },
    retryCondition: (error) => {
        // Retry on 429 and 5xx
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.response?.status === 429 ||
            (error.response?.status ? error.response.status >= 500 : false);
    }
});

export const fetchPatientsPage = async (page: number, limit: number = 5): Promise<PaginatedResponse> => {
    try {
        const response = await client.get<any>('/patients', {
            params: { page, limit }
        });

        const raw = response.data;

        if (raw.data && raw.pagination) {
            return raw;
        }

        if (raw.patients) {
            const total = raw.total_records || 0;
            const perPage = raw.per_page || limit;
            const totalPages = Math.ceil(total / perPage);

            return {
                data: raw.patients,
                pagination: {
                    page: raw.current_page || page,
                    limit: perPage,
                    total: total,
                    totalPages: totalPages,
                    hasNext: (raw.current_page || page) < totalPages,
                    hasPrevious: (raw.current_page || page) > 1
                }
            };
        }

        // Fallback for unknown valid structure but containing array
        if (Array.isArray(raw)) {
            return {
                data: raw,
                pagination: {
                    page: page,
                    limit: limit,
                    total: raw.length,
                    totalPages: 999,
                    hasNext: raw.length > 0,
                    hasPrevious: page > 1
                }
            };
        }

        console.warn(`Unknown response format on page ${page}:`, JSON.stringify(raw));
        // Return empty to allow loop to possibly continue or handle gracefully
        return {
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            }
        };

    } catch (error: any) {
        console.error(`Error fetching page ${page}:`, error.message);
        throw error;
    }
};

export const fetchAllPatients = async (): Promise<Patient[]> => {
    let allPatients: Patient[] = [];
    let page = 1;
    let hasNext = true;

    console.log('Starting to fetch all patients...');

    while (hasNext) {
        try {
            console.log(`Fetching page ${page}...`);
            const response = await fetchPatientsPage(page);

            // Handle inconsistent response shapes where data might be missing or not an array
            if (response.data && Array.isArray(response.data)) {
                allPatients = [...allPatients, ...response.data];
            } else {
                console.warn(`Page ${page} returned unexpected data format:`, JSON.stringify(response, null, 2));
            }

            hasNext = response.pagination?.hasNext ?? false;

            // Safety break for loop
            if (page > response.pagination?.totalPages) {
                hasNext = false;
            }

            page++;
        } catch (error) {
            console.error(`Failed to fetch page ${page}, stopping fetch.`);
            hasNext = false; // Stop on critical failure after retries
        }
    }

    console.log(`Fetched total ${allPatients.length} patients.`);
    return allPatients;
};

export const submitAssessment = async (results: any) => {
    try {
        const response = await client.post('/submit-assessment', results);
        console.log('Assessment Results:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('Error submitting assessment:', error.response?.data || error.message);
        throw error;
    }
};
