import { type Database } from '~/types/database.types';

export type ReportStatus = {
    isNotPure: boolean;
    addedDecors: Set<string>;
    removedDecors: Set<string>;
};

type CachedCellReport = {
    ts: number;
    np?: boolean;
    ad?: string[];
    rd?: string[];
};

type CellReportSummaryRow = {
    s2_cell_id: string;
    is_not_pure: boolean | null;
    added_decors: string[] | null;
    removed_decors: string[] | null;
};

// Global cache registry to track which cells we've already asked Supabase about.
const fetchedCellIds = new Set<string>();
const cellReports = reactive<Map<string, ReportStatus>>(new Map());
const cellReportsVersion = ref(0);
let cacheLoaded = false;

// LocalStorage Cache Key & TTL
const CACHE_KEY = 'pikmin-cell-reports-cache';
const CACHE_VERSION = 3;
const CACHE_TTL = 12 * 60 * 60 * 1000;

// Fetch tuning
const FETCH_BATCH_SIZE = 100;
const MAX_BATCHES_PER_FLUSH = 1;
const FETCH_DEBOUNCE_MS = 2000;
const MAX_PENDING_CELL_IDS = 800;
const MAX_CACHE_CELLS = 5000;

// Debounce / queue state
let fetchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let isFetchingReports = false;
let needsTrailingFetch = false;

const pendingCellIds = new Set<string>();

const createEmptyStatus = (): ReportStatus => ({
    isNotPure: false,
    addedDecors: new Set<string>(),
    removedDecors: new Set<string>(),
});

const enqueueCellIds = (cellIds: string[]) => {
    const freshIds = cellIds.filter(id => id && !fetchedCellIds.has(id));

    for (const id of freshIds) {
        pendingCellIds.add(id);
    }

    // 如果 queue 超過上限，丟掉最舊的 pending cell，保留最新畫面
    while (pendingCellIds.size > MAX_PENDING_CELL_IDS) {
        const oldest = pendingCellIds.values().next().value;
        if (!oldest) break;
        pendingCellIds.delete(oldest);
    }
};

export const useCellReports = () => {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();

    const getReportStatus = (cellId: string): ReportStatus => {
        if (!cellReports.has(cellId)) {
            cellReports.set(cellId, createEmptyStatus());
        }
        return cellReports.get(cellId)!;
    };

    const bumpReportsVersion = () => {
        cellReportsVersion.value++;
    };

    const loadCache = () => {
        if (!import.meta.client) return false;

        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return false;

            const cache = JSON.parse(raw) as {
                version: number;
                cells?: Record<string, CachedCellReport>;
            };

            if (cache.version !== CACHE_VERSION) {
                localStorage.removeItem(CACHE_KEY);
                return false;
            }

            const now = Date.now();
            let hasExpiredItems = false;
            let loadedCount = 0;
            let loadedReportCount = 0;

            for (const [cellId, data] of Object.entries(cache.cells || {})) {
                if (!data || typeof data.ts !== 'number') {
                    hasExpiredItems = true;
                    continue;
                }

                if (now - data.ts > CACHE_TTL) {
                    hasExpiredItems = true;
                    continue;
                }

                fetchedCellIds.add(cellId);

                const hasReportData =
                    !!data.np ||
                    (Array.isArray(data.ad) && data.ad.length > 0) ||
                    (Array.isArray(data.rd) && data.rd.length > 0);

                if (hasReportData) {
                    cellReports.set(cellId, {
                        isNotPure: !!data.np,
                        addedDecors: new Set(data.ad || []),
                        removedDecors: new Set(data.rd || []),
                    });
                    loadedReportCount++;
                }

                loadedCount++;
            }

            if (hasExpiredItems) {
                saveCache();
            }

            if (loadedReportCount > 0) {
                bumpReportsVersion();
            }

            if (import.meta.dev && loadedCount > 0) {
                console.log('[CellReports] loaded cache', {
                    fetchedCells: loadedCount,
                    cellsWithReports: loadedReportCount,
                });
            }

            return loadedCount > 0;
        } catch (e) {
            console.error('[CellReports] Failed to load cache:', e);
            localStorage.removeItem(CACHE_KEY);
            return false;
        }
    };

    const saveCache = () => {
        if (!import.meta.client) return;

        try {
            const now = Date.now();
            const cellsToSave: Record<string, CachedCellReport> = {};

            let count = 0;

            for (const cellId of fetchedCellIds) {
                if (count >= MAX_CACHE_CELLS) break;

                const status = cellReports.get(cellId);

                cellsToSave[cellId] = {
                    ts: now,
                    np: status?.isNotPure || false,
                    ad: status ? Array.from(status.addedDecors) : [],
                    rd: status ? Array.from(status.removedDecors) : [],
                };

                count++;
            }

            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                    version: CACHE_VERSION,
                    cells: cellsToSave,
                }),
            );
        } catch (e) {
            console.error('[CellReports] Failed to save cache:', e);
        }
    };

    if (import.meta.client && !cacheLoaded) {
        cacheLoaded = true;
        loadCache();
    }

    const isReportedNotPure = (cellId: string): boolean => {
        return cellReports.get(cellId)?.isNotPure || false;
    };

    const getAddedDecors = (cellId: string): Set<string> => {
        return cellReports.get(cellId)?.addedDecors || new Set<string>();
    };

    const getRemovedDecors = (cellId: string): Set<string> => {
        return cellReports.get(cellId)?.removedDecors || new Set<string>();
    };

    const hasAddedDecor = (cellId: string, decorId: string): boolean => {
        return cellReports.get(cellId)?.addedDecors.has(decorId) || false;
    };

    const hasRemovedDecor = (cellId: string, decorId: string): boolean => {
        return cellReports.get(cellId)?.removedDecors.has(decorId) || false;
    };

    const fetchReportsForCellsNow = async () => {
        if (isFetchingReports) {
            needsTrailingFetch = true;
            return;
        }

        if (!pendingCellIds.size) return;

        isFetchingReports = true;

        try {
            const maxCellsPerFlush = FETCH_BATCH_SIZE * MAX_BATCHES_PER_FLUSH;

            const cellIdsToFetch = Array.from(pendingCellIds)
                .filter(id => !fetchedCellIds.has(id))
                .slice(0, maxCellsPerFlush);

            cellIdsToFetch.forEach(id => pendingCellIds.delete(id));

            if (!cellIdsToFetch.length) return;

            if (import.meta.dev) {
                console.log('[CellReports] RPC flush', {
                    count: cellIdsToFetch.length,
                    pendingLeft: pendingCellIds.size,
                    sample: cellIdsToFetch.slice(0, 5),
                });
            }

            const { data, error } = await (supabase as any).rpc('get_cell_reports_summary', {
                cell_ids: cellIdsToFetch,
            });

            if (error) throw error;

            cellIdsToFetch.forEach(id => fetchedCellIds.add(id));

            ((data || []) as CellReportSummaryRow[]).forEach(row => {
                if (!row?.s2_cell_id) return;

                const status = getReportStatus(row.s2_cell_id);

                if (row.is_not_pure) {
                    status.isNotPure = true;
                }

                (row.added_decors || []).forEach((decorId: string) => {
                    if (decorId) status.addedDecors.add(decorId);
                });

                (row.removed_decors || []).forEach((decorId: string) => {
                    if (decorId) status.removedDecors.add(decorId);
                });
            });

            if ((data || []).length > 0) {
                bumpReportsVersion();
            }

            saveCache();
        } catch (e) {
            console.error('[CellReports] Fetch error:', e);
        } finally {
            isFetchingReports = false;

            if (needsTrailingFetch || pendingCellIds.size > 0) {
                needsTrailingFetch = false;

                if (fetchDebounceTimer) {
                    clearTimeout(fetchDebounceTimer);
                }

                fetchDebounceTimer = setTimeout(() => {
                    fetchReportsForCellsNow();
                }, FETCH_DEBOUNCE_MS);
            }
        }
    };

    const fetchReportsForCells = async (cellIds: string[]) => {
        if (!cellIds.length) return;

        enqueueCellIds(cellIds);

        if (!pendingCellIds.size) return;

        if (import.meta.dev) {
            console.log('[CellReports] enqueue', {
                incoming: cellIds.length,
                pending: pendingCellIds.size,
                alreadyFetched: cellIds.filter(id => fetchedCellIds.has(id)).length,
            });
        }

        if (fetchDebounceTimer) {
            clearTimeout(fetchDebounceTimer);
        }

        fetchDebounceTimer = setTimeout(() => {
            fetchReportsForCellsNow();
        }, FETCH_DEBOUNCE_MS);
    };

    const getCurrentUserId = async () => {
        if (user.value?.id) return user.value.id;

        const { data, error } = await supabase.auth.getUser();

        if (error) {
            throw error;
        }

        return data.user?.id || null;
    };

    const submitReport = async (
        cellId: string,
        reportType: 'not_pure' | 'missing_decor' | 'extra_decor',
        decorId?: string,
    ) => {
        const userId = await getCurrentUserId();

        if (!userId) throw new Error('必須登入才能回報');

        if ((reportType === 'missing_decor' || reportType === 'extra_decor') && !decorId) {
            throw new Error('請選擇要回報的飾品');
        }

        const status = getReportStatus(cellId);

        if (reportType === 'not_pure') {
            if (status.isNotPure) return;
            status.isNotPure = true;
        } else if (reportType === 'missing_decor' && decorId) {
            if (status.addedDecors.has(decorId)) return;
            status.addedDecors.add(decorId);
        } else if (reportType === 'extra_decor' && decorId) {
            if (status.removedDecors.has(decorId)) return;
            status.removedDecors.add(decorId);
        }

        fetchedCellIds.add(cellId);
        bumpReportsVersion();
        saveCache();

        const { error } = await supabase
            .from('cell_reports')
            .insert({
                s2_cell_id: cellId,
                user_id: userId,
                report_type: reportType,
                decor_id: decorId || null,
            } as any);

        if (error) {
            if (reportType === 'not_pure') {
                status.isNotPure = false;
            }

            if (reportType === 'missing_decor' && decorId) {
                status.addedDecors.delete(decorId);
            }

            if (reportType === 'extra_decor' && decorId) {
                status.removedDecors.delete(decorId);
            }

            bumpReportsVersion();
            saveCache();

            if (error.code === '23505') {
                if (reportType === 'not_pure') {
                    status.isNotPure = true;
                }

                if (reportType === 'missing_decor' && decorId) {
                    status.addedDecors.add(decorId);
                }

                if (reportType === 'extra_decor' && decorId) {
                    status.removedDecors.add(decorId);
                }

                fetchedCellIds.add(cellId);
                bumpReportsVersion();
                saveCache();
                return;
            }

            throw error;
        }
    };

    return {
        fetchReportsForCells,
        submitReport,
        isReported: isReportedNotPure,
        isReportedNotPure,
        getAddedDecors,
        getRemovedDecors,
        hasAddedDecor,
        hasRemovedDecor,
        cellReportsVersion: readonly(cellReportsVersion),
    };
};