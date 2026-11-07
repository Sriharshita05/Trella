import { useEffect, useState } from 'react';
import { boardService } from '../services';

const ts = (b) => new Date(b.updatedAt || b.createdAt || 0).getTime();

/**
 * Loads real data for a set of workspaces using the existing REST endpoints:
 *   GET /workspaces/:id/boards  → boardsByWs
 *   GET /boards/:id/activity    → merged, newest-first activity (from the most recently touched boards)
 *
 * Failures are tolerated per-request so one inaccessible board never blanks the page.
 */
export default function useBoardsAndActivity(workspaces, { activityBoards = 4, activityLimit = 8, enabled = true } = {}) {
  const [boardsByWs, setBoardsByWs] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const key = workspaces.map((w) => w._id).join(',');

  useEffect(() => {
    if (!enabled) return undefined;
    if (workspaces.length === 0) {
      setBoardsByWs({});
      setActivity([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const boardResults = await Promise.allSettled(workspaces.map((w) => boardService.getAll(w._id)));
      if (cancelled) return;

      const map = {};
      const all = [];
      boardResults.forEach((r, i) => {
        if (r.status === 'fulfilled' && Array.isArray(r.value.data)) {
          map[workspaces[i]._id] = r.value.data;
          all.push(...r.value.data);
        }
      });
      setBoardsByWs(map);

      const recent = [...all].sort((a, b) => ts(b) - ts(a)).slice(0, activityBoards);
      const logResults = await Promise.allSettled(recent.map((b) => boardService.getActivity(b._id)));
      if (cancelled) return;

      const logs = [];
      logResults.forEach((r, i) => {
        if (r.status === 'fulfilled' && Array.isArray(r.value.data)) {
          r.value.data.forEach((log) => logs.push({ ...log, boardId: recent[i]._id, boardName: recent[i].name }));
        }
      });
      logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivity(logs.slice(0, activityLimit));
      setLoading(false);
    })().catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { boardsByWs, activity, loading };
}
