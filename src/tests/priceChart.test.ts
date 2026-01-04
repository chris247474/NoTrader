import { describe, it, expect } from 'vitest';
import { filterDataByTimeRange } from '../components/PriceChart';

describe('filterDataByTimeRange', () => {
    // Helper to create test data
    const createDataPoint = (dateStr: string) => ({
        date: dateStr,
        price: 100000,
        ma20w: 90000,
        ma200w: 45000,
    });

    describe('ALL range', () => {
        it('should return all data when range is ALL', () => {
            const data = [
                createDataPoint('2020-01-01'),
                createDataPoint('2023-06-15'),
                createDataPoint('2025-12-31'),
            ];
            const result = filterDataByTimeRange(data, 'ALL');
            expect(result).toHaveLength(3);
            expect(result).toEqual(data);
        });

        it('should return empty array when data is empty', () => {
            const result = filterDataByTimeRange([], 'ALL');
            expect(result).toHaveLength(0);
        });
    });

    describe('6M range', () => {
        it('should filter to only data from last 6 months', () => {
            const data = [
                createDataPoint('2024-01-01'),  // ~2 years ago - excluded
                createDataPoint('2025-06-01'),  // ~7 months ago - excluded
                createDataPoint('2025-08-01'),  // ~5 months ago - included
                createDataPoint('2025-10-01'),  // ~3 months ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '6M');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2025-08-01');
            expect(result[2].date).toBe('2026-01-04');
        });
    });

    describe('1Y range', () => {
        it('should filter to only data from last 1 year', () => {
            const data = [
                createDataPoint('2023-01-01'),  // ~3 years ago - excluded
                createDataPoint('2024-12-01'),  // ~1 year ago - excluded (before cutoff)
                createDataPoint('2025-02-01'),  // ~11 months ago - included
                createDataPoint('2025-08-01'),  // ~5 months ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '1Y');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2025-02-01');
        });
    });

    describe('2Y range', () => {
        it('should filter to only data from last 2 years', () => {
            const data = [
                createDataPoint('2022-01-01'),  // ~4 years ago - excluded
                createDataPoint('2024-06-01'),  // ~1.5 years ago - included
                createDataPoint('2025-06-01'),  // ~7 months ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '2Y');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2024-06-01');
        });
    });

    describe('3Y range', () => {
        it('should filter to only data from last 3 years', () => {
            const data = [
                createDataPoint('2020-01-01'),  // ~6 years ago - excluded
                createDataPoint('2023-06-01'),  // ~2.5 years ago - included
                createDataPoint('2025-01-01'),  // ~1 year ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '3Y');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2023-06-01');
        });
    });

    describe('5Y range', () => {
        it('should filter to only data from last 5 years', () => {
            const data = [
                createDataPoint('2018-01-01'),  // ~8 years ago - excluded
                createDataPoint('2021-06-01'),  // ~4.5 years ago - included
                createDataPoint('2024-01-01'),  // ~2 years ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '5Y');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2021-06-01');
        });
    });

    describe('10Y range', () => {
        it('should filter to only data from last 10 years', () => {
            const data = [
                createDataPoint('2010-01-01'),  // ~16 years ago - excluded
                createDataPoint('2017-01-01'),  // ~9 years ago - included
                createDataPoint('2022-01-01'),  // ~4 years ago - included
                createDataPoint('2026-01-04'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '10Y');
            expect(result).toHaveLength(3);
            expect(result[0].date).toBe('2017-01-01');
        });
    });

    describe('edge cases', () => {
        it('should handle single data point', () => {
            const data = [createDataPoint('2026-01-04')];
            const result = filterDataByTimeRange(data, '1Y');
            expect(result).toHaveLength(1);
        });

        it('should use latest date in data as reference, not current date', () => {
            // Data from 2020 - 1Y filter should include 2019-06-01 onwards
            const data = [
                createDataPoint('2018-01-01'),  // excluded
                createDataPoint('2019-06-01'),  // included (within 1Y of 2020-01-01)
                createDataPoint('2020-01-01'),  // latest - included
            ];
            const result = filterDataByTimeRange(data, '1Y');
            expect(result).toHaveLength(2);
            expect(result[0].date).toBe('2019-06-01');
        });

        it('should return empty for empty input regardless of range', () => {
            expect(filterDataByTimeRange([], '6M')).toHaveLength(0);
            expect(filterDataByTimeRange([], '1Y')).toHaveLength(0);
            expect(filterDataByTimeRange([], '10Y')).toHaveLength(0);
        });
    });
});
