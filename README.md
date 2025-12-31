# Patient Risk Assessment System

This project implements a patient risk scoring system for the DemoMed Healthcare assessment. It fetches patient data from an API, cleans data, calculates risk scores based on Blood Pressure, Temperature, and Age, and submits the aggregated results.


## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build (Optional)**:
    ```bash
    npm run build
    ```
    (Requires adding a build script or running `npx tsc`)

## Running the Assessment

To run the assessment script directly using `ts-node`:

```bash
npx ts-node src/index.ts
```

This will:
1.  Fetch all paginated patient records.
2.  Log progress to the console.
3.  Output the identified risk lists.
4.  Submit the results to the assessment API and print the verification response.

## File Structure

-   `src/api.ts`: API interaction (fetching, retries, submission).
-   `src/parsers.ts`: Data cleaning and validation functions.
-   `src/scoring.ts`: Pure functions for calculating risk scores.
-   `src/index.ts`: Main entry point and orchestration logic.
