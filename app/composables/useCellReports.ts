import { type Database } from '~/types/database.types';

export type ReportStatus = {
    isNotPure: boolean; // True if reported as 'not_pure'
    addedDecors: Set<string>; // Set of decor_ids reported as 'missing_decor'
};

export const useCellReports = () => {
    const supabase = useSupabaseClient<Database>();
    
    // State: Map cellId -> ReportStatus
    const cellReports = reactive<Map<string, ReportStatus>>(new Map());

    // Helper to get or create status
    const getReportStatus = (cellId: string): ReportStatus => {
        if (!cellReports.has(cellId)) {
            cellReports.set(cellId, { isNotPure: false, addedDecors: new Set() });
        }
        return cellReports.get(cellId)!;
    };

    // Helper check
    const isReportedNotPure = (cellId: string): boolean => {
        return cellReports.get(cellId)?.isNotPure || false;
    };
    
    const getAddedDecors = (cellId: string): Set<string> => {
        return cellReports.get(cellId)?.addedDecors || new Set();
    };

    const hasAddedDecor = (cellId: string, decorId: string): boolean => {
        return cellReports.get(cellId)?.addedDecors.has(decorId) || false;
    };

    // Fetch reports for visible cells
    const fetchReportsForCells = async (cellIds: string[]) => {
        if (!cellIds.length) return;

        try {
            const { data, error } = await supabase
                .from('cell_reports')
                .select('s2_cell_id, report_type, decor_id')
                .in('s2_cell_id', cellIds);

            if (error) throw error;

            if (data) {
                data.forEach(row => {
                    const status = getReportStatus(row.s2_cell_id);
                    if (row.report_type === 'not_pure') {
                        status.isNotPure = true;
                    } else if (row.report_type === 'missing_decor' && row.decor_id) {
                        status.addedDecors.add(row.decor_id);
                    }
                });
            }
        } catch (e) {
            console.error('[CellReports] Fetch error:', e);
        }
    };

    // Submit a report
    const submitReport = async (cellId: string, reportType: 'not_pure' | 'missing_decor', decorId?: string) => {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('必須登入才能回報');

        // Optimistic Update
        const status = getReportStatus(cellId);
        if (reportType === 'not_pure') {
            if (status.isNotPure) return; // Already reported
            status.isNotPure = true;
        } else if (reportType === 'missing_decor' && decorId) {
            if (status.addedDecors.has(decorId)) return; // Already reported
            status.addedDecors.add(decorId);
        }

        // Send to DB
        // @ts-ignore - Supabase type definitions might be lagging behind migration
        const { error } = await supabase
            .from('cell_reports')
            .insert({
                s2_cell_id: cellId,
                user_id: user.data.user.id,
                report_type: reportType,
                decor_id: decorId || null
            });

        if (error) {
            // Revert on error
            if (reportType === 'not_pure') status.isNotPure = false;
            // Only remove from set if not added by others (actually we can't distinguish here easily without full sync, but good enough for optimistic revert)
            if (reportType === 'missing_decor' && decorId) status.addedDecors.delete(decorId);
             
            // Ignore duplicate key error for missing_decor as well
            if (error.code === '23505') { 
                // Re-apply optimistic state just in case
                if (reportType === 'not_pure') status.isNotPure = true;
                if (reportType === 'missing_decor' && decorId) status.addedDecors.add(decorId);
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
        hasAddedDecor
    };
};
