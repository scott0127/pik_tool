import { type Database } from '~/types/database.types';

export type ReportStatus = {
    isNotPure: boolean; // True if reported as 'not_pure'
    addedDecors: Set<string>; // Set of decor_ids reported as 'missing_decor'
    removedDecors: Set<string>; // Set of decor_ids reported as 'extra_decor'
};

// Global cache registry to track which cells we've already asked Supabase about (in-memory)
const fetchedCellIds = new Set<string>();
const cellReports = reactive<Map<string, ReportStatus>>(new Map());
let cacheLoaded = false;

// LocalStorage Cache Key & TTL
const CACHE_KEY = 'pikmin-cell-reports-cache';
const CACHE_VERSION = 2;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const FETCH_BATCH_SIZE = 180;
const MAX_BATCHES_PER_CALL = 2;

export const useCellReports = () => {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();

    // Helper to get or create status
    const getReportStatus = (cellId: string): ReportStatus => {
        if (!cellReports.has(cellId)) {
            cellReports.set(cellId, { isNotPure: false, addedDecors: new Set(), removedDecors: new Set() });
        }
        return cellReports.get(cellId)!;
    };

    // --- LocalStorage Cache Implementation ---
    
    // Process cache data from localStorage
    const loadCache = () => {
        if (!import.meta.client) return false;
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return false;
            
            const cache = JSON.parse(raw);
            if (cache.version !== CACHE_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                return false;
            }

            const now = Date.now();
            let hasExpiredItems = false;
            let loadedCount = 0;

            // Load valid cache items
            for (const [cellId, data] of Object.entries(cache.cells || {})) {
                // @ts-ignore
                if (now - data.ts > CACHE_TTL) {
                    hasExpiredItems = true;
                    continue;
                }
                
                // Set memory state
                cellReports.set(cellId, {
                    // @ts-ignore
                    isNotPure: !!data.np,
                    // @ts-ignore
                    addedDecors: new Set(data.ad || []),
                    // @ts-ignore
                    removedDecors: new Set(data.rd || [])
                });
                fetchedCellIds.add(cellId);
                loadedCount++;
            }

            // Clean up if we had expired items
            if (hasExpiredItems) {
                saveCache();
            }
            
            return loadedCount > 0;
        } catch (e) {
            console.error('[CellReports] Failed to load cache:', e);
            localStorage.removeItem(CACHE_KEY);
            return false;
        }
    };

    // Save current memory state to localStorage
    const saveCache = () => {
        if (!import.meta.client) return;
        try {
            const now = Date.now();
            const cellsToSave: Record<string, any> = {};
            
            // Note: We're only saving cells that are in memory currently. 
            // If the map has 10,000 cells long-term, this might grow. 
            // We limit the save to recently fetched cells if possible, but for now we save all known.
            
            // To prevent unbounded growth, optionally limit max cells to save (e.g. 5000)
            let count = 0;
            const entries = Array.from(cellReports.entries());
            
            for (const [cellId, status] of entries) {
                if (count > 5000) break; // Arbitrary safe limit for localStorage
                cellsToSave[cellId] = {
                    ts: now,
                    np: status.isNotPure,
                    ad: Array.from(status.addedDecors),
                    rd: Array.from(status.removedDecors)
                };
                count++;
            }
            
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                version: CACHE_VERSION,
                cells: cellsToSave
            }));
        } catch (e) {
            console.error('[CellReports] Failed to save cache:', e);
        }
    };
    
    // Run loadCache once on initialization
    if (import.meta.client && !cacheLoaded) {
        cacheLoaded = true;
        loadCache();
    }
    // -----------------------------------------

    // Helper check
    const isReportedNotPure = (cellId: string): boolean => {
        return cellReports.get(cellId)?.isNotPure || false;
    };
    
    const getAddedDecors = (cellId: string): Set<string> => {
        return cellReports.get(cellId)?.addedDecors || new Set();
    };

    const getRemovedDecors = (cellId: string): Set<string> => {
        return cellReports.get(cellId)?.removedDecors || new Set();
    };

    const hasAddedDecor = (cellId: string, decorId: string): boolean => {
        return cellReports.get(cellId)?.addedDecors.has(decorId) || false;
    };

    const hasRemovedDecor = (cellId: string, decorId: string): boolean => {
        return cellReports.get(cellId)?.removedDecors.has(decorId) || false;
    };

    // Fetch reports for visible cells
    const fetchReportsForCells = async (cellIds: string[]) => {
        if (!cellIds.length) return;

        // 1. Filter out cells that we have already fetched (in-memory or from loaded LocalStorage)
        const newCellIds = cellIds.filter(id => !fetchedCellIds.has(id));
        if (!newCellIds.length) return;

        try {
            const limitedCellIds = newCellIds.slice(0, FETCH_BATCH_SIZE * MAX_BATCHES_PER_CALL);
            for (let i = 0; i < limitedCellIds.length; i += FETCH_BATCH_SIZE) {
                const batchCellIds = limitedCellIds.slice(i, i + FETCH_BATCH_SIZE);
                const { data, error } = await supabase
                    .from('cell_reports')
                    .select('s2_cell_id, report_type, decor_id')
                    .in('s2_cell_id', batchCellIds);

                if (error) throw error;
                const grouped = new Map<string, { is_not_pure: boolean; added_decors: Set<string>; removed_decors: Set<string> }>();
                (data || []).forEach(row => {
                    if (!grouped.has(row.s2_cell_id)) {
                        grouped.set(row.s2_cell_id, { is_not_pure: false, added_decors: new Set(), removed_decors: new Set() });
                    }
                    const bucket = grouped.get(row.s2_cell_id)!;
                    if (row.report_type === 'not_pure') bucket.is_not_pure = true;
                    if (row.report_type === 'missing_decor' && row.decor_id) bucket.added_decors.add(row.decor_id);
                    if (row.report_type === 'extra_decor' && row.decor_id) bucket.removed_decors.add(row.decor_id);
                });
                const summaryRows = Array.from(grouped.entries()).map(([s2_cell_id, value]) => ({
                    s2_cell_id,
                    is_not_pure: value.is_not_pure,
                    added_decors: Array.from(value.added_decors),
                    removed_decors: Array.from(value.removed_decors),
                }));

                // 2. Mark batch as fetched regardless of whether it has data
                batchCellIds.forEach(id => fetchedCellIds.add(id));

                if (!summaryRows) continue;
                summaryRows.forEach(row => {
                    const status = getReportStatus(row.s2_cell_id);
                    if (row.is_not_pure) {
                        status.isNotPure = true;
                    }
                    (row.added_decors || []).forEach(decorId => status.addedDecors.add(decorId));
                    (row.removed_decors || []).forEach(decorId => status.removedDecors.add(decorId));
                });
            }
            
            // 3. Save to localStorage cache after fetching new data
            saveCache();
        } catch (e) {
            console.error('[CellReports] Fetch error:', e);
        }
    };

    const getCurrentUserId = async () => {
        if (user.value?.id) return user.value.id;

        const { data, error } = await supabase.auth.getUser();
        if (error) {
            throw error;
        }

        return data.user?.id || null;
    };

    // Submit a report
    const submitReport = async (cellId: string, reportType: 'not_pure' | 'missing_decor' | 'extra_decor', decorId?: string) => {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('必須登入才能回報');
        if ((reportType === 'missing_decor' || reportType === 'extra_decor') && !decorId) {
            throw new Error('請選擇要回報的飾品');
        }

        // Optimistic Update
        const status = getReportStatus(cellId);
        if (reportType === 'not_pure') {
            if (status.isNotPure) return; // Already reported
            status.isNotPure = true;
        } else if (reportType === 'missing_decor' && decorId) {
            if (status.addedDecors.has(decorId)) return; // Already reported
            status.addedDecors.add(decorId);
        } else if (reportType === 'extra_decor' && decorId) {
            if (status.removedDecors.has(decorId)) return; // Already reported
            status.removedDecors.add(decorId);
        }
        
        // Save to cache immediately so optimistic update persists reload
        saveCache();

        // Send to DB
        // @ts-ignore - Supabase type definitions might be lagging behind migration
        const { error } = await supabase
            .from('cell_reports')
            .insert({
                s2_cell_id: cellId,
                user_id: userId,
                report_type: reportType,
                decor_id: decorId || null
            });

        if (error) {
            // Revert on error
            if (reportType === 'not_pure') status.isNotPure = false;
            // Only remove from set if not added by others (actually we can't distinguish here easily without full sync, but good enough for optimistic revert)
            if (reportType === 'missing_decor' && decorId) status.addedDecors.delete(decorId);
            if (reportType === 'extra_decor' && decorId) status.removedDecors.delete(decorId);
            saveCache();
             
            // Ignore duplicate key error for decor reports as well
            if (error.code === '23505') { 
                // Re-apply optimistic state just in case
                if (reportType === 'not_pure') status.isNotPure = true;
                if (reportType === 'missing_decor' && decorId) status.addedDecors.add(decorId);
                if (reportType === 'extra_decor' && decorId) status.removedDecors.add(decorId);
                saveCache();
                return;
            }
            throw error;
        }
    };

    return {
        // Expose new helpers
        fetchReportsForCells,
        submitReport,
        // Backward compatibility (sort of, but renamed slightly to be clearer)
        isReported: isReportedNotPure, 
        isReportedNotPure,
        getAddedDecors,
        getRemovedDecors,
        hasAddedDecor,
        hasRemovedDecor
    };
};
