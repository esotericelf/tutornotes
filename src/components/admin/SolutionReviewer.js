import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    LinearProgress,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    CloudUpload,
    Refresh,
    Publish,
    Save,
    Block,
} from '@mui/icons-material';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NativeJSXGraphContainer from '../mathpaper/NativeJSXGraphContainer';

const API_BASE = process.env.REACT_APP_STAGING_API_URL || 'http://localhost:8000';

function formatQuestionBadge(item) {
    const year = item?.year ?? '????';
    const paper = item?.paper != null ? String(item.paper) : '?';
    const paperLabel = /^p/i.test(paper) || /paper/i.test(paper) ? paper : `P${paper}`;
    const q = item?.question_no ?? '?';
    return `${year} ${paperLabel} Q${q}`;
}

function renderLatexPreview(source) {
    if (!source || !String(source).trim()) {
        return (
            <Typography variant="body2" color="text.secondary">
                No LaTeX to preview
            </Typography>
        );
    }

    const text = String(source);
    const hasDelimiters = /\$|\\\(|\\\[/.test(text);

    if (!hasDelimiters) {
        try {
            return <BlockMath math={text} errorColor="#cc0000" />;
        } catch (err) {
            return (
                <Typography variant="body2" color="error">
                    {err?.message || 'Failed to render LaTeX'}
                </Typography>
            );
        }
    }

    return text.split('\n').map((line, lineIndex) => {
        if (!line.trim()) {
            return <Box key={`blank-${lineIndex}`} sx={{ height: '0.75rem' }} />;
        }

        const parts = line.split(/(\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\])/);
        return (
            <Typography
                key={`line-${lineIndex}`}
                variant="body2"
                sx={{ mb: 0.75, lineHeight: 1.6, wordBreak: 'break-word' }}
            >
                {parts.map((part, index) => {
                    try {
                        if (part.startsWith('$') && part.endsWith('$')) {
                            return <InlineMath key={index} math={part.slice(1, -1)} />;
                        }
                        if (part.startsWith('\\(') && part.endsWith('\\)')) {
                            return <InlineMath key={index} math={part.slice(2, -2)} />;
                        }
                        if (part.startsWith('\\[') && part.endsWith('\\]')) {
                            return <BlockMath key={index} math={part.slice(2, -2)} />;
                        }
                    } catch {
                        return <span key={index}>{part}</span>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </Typography>
        );
    });
}

const emptyDraft = {
    year: '',
    paper: '',
    question_no: '',
    question_text: '',
    solution_latex: '',
    solution_jsxgraph_code: '',
};

const SolutionReviewer = () => {
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [activeId, setActiveId] = useState(null);
    const [draft, setDraft] = useState(emptyDraft);
    const [loadingQueue, setLoadingQueue] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [rerunning, setRerunning] = useState(false);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const deferredLatex = useDeferredValue(draft.solution_latex);
    const deferredJsx = useDeferredValue(draft.solution_jsxgraph_code);

    const activeItem = useMemo(
        () => items.find((item) => item.id === activeId) || null,
        [items, activeId]
    );

    const loadStaging = useCallback(async () => {
        setLoadingQueue(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/staging`);
            if (!response.ok) {
                const detail = await response.text();
                throw new Error(detail || `Failed to load staging (${response.status})`);
            }
            const data = await response.json();
            const nextItems = data.items || [];
            setItems(nextItems);
            setSelectedIds((prev) => {
                const next = new Set();
                nextItems.forEach((item) => {
                    if (prev.has(item.id)) next.add(item.id);
                });
                return next;
            });
            setActiveId((prev) => {
                if (prev && nextItems.some((item) => item.id === prev)) return prev;
                return nextItems[0]?.id ?? null;
            });
        } catch (err) {
            setError(err.message || 'Failed to load staging queue');
        } finally {
            setLoadingQueue(false);
        }
    }, []);

    useEffect(() => {
        loadStaging();
    }, [loadStaging]);

    useEffect(() => {
        if (!activeItem) {
            setDraft(emptyDraft);
            return;
        }
        setDraft({
            year: activeItem.year ?? '',
            paper: activeItem.paper ?? '',
            question_no: activeItem.question_no ?? '',
            question_text: activeItem.question_text ?? '',
            solution_latex: activeItem.solution_latex ?? '',
            solution_jsxgraph_code: activeItem.solution_jsxgraph_code ?? '',
        });
    }, [activeItem]);

    const updateDraftField = (field) => (event) => {
        const value = event.target.value;
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    const toggleSelected = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(new Set(items.map((item) => item.id)));
    };

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setUploading(true);
        setUploadStatus('Uploading PDF…');
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            setUploadStatus('Running OCR → solve → JSXGraph pipeline…');

            const response = await fetch(`${API_BASE}/api/process-pdf`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let detail = `Upload failed (${response.status})`;
                try {
                    const body = await response.json();
                    detail = body.detail || detail;
                } catch {
                    // ignore
                }
                throw new Error(detail);
            }

            const result = await response.json();
            setUploadStatus(
                `Done — ${result.question_count ?? 0} question(s) from ${result.page_count ?? 0} page(s)`
            );
            setSuccess(
                `Processed PDF. Staged ${result.staging_ids?.length ?? 0} row(s).`
            );
            await loadStaging();
        } catch (err) {
            setUploadStatus('');
            setError(err.message || 'PDF processing failed');
        } finally {
            setUploading(false);
        }
    };

    const saveActiveDraft = async () => {
        if (!activeId) return null;
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/staging/${activeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: draft.year === '' ? null : draft.year,
                    paper: draft.paper,
                    question_no: draft.question_no,
                    question_text: draft.question_text,
                    solution_latex: draft.solution_latex,
                    solution_jsxgraph_code: draft.solution_jsxgraph_code,
                }),
            });
            if (!response.ok) {
                let detail = `Save failed (${response.status})`;
                try {
                    const body = await response.json();
                    detail = body.detail || detail;
                } catch {
                    // ignore
                }
                throw new Error(detail);
            }
            const data = await response.json();
            setItems((prev) =>
                prev.map((item) => (item.id === activeId ? { ...item, ...data.item } : item))
            );
            setSuccess('Draft saved to staging');
            return data.item;
        } catch (err) {
            setError(err.message || 'Failed to save draft');
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleRerun = async () => {
        if (!activeId) return;
        setRerunning(true);
        setError(null);
        setSuccess(null);
        try {
            await saveActiveDraft().catch(() => null);
            const response = await fetch(`${API_BASE}/api/staging/${activeId}/rerun`, {
                method: 'POST',
            });
            if (!response.ok) {
                let detail = `Rerun failed (${response.status})`;
                try {
                    const body = await response.json();
                    detail = body.detail || detail;
                } catch {
                    // ignore
                }
                throw new Error(detail);
            }
            const data = await response.json();
            setItems((prev) =>
                prev.map((item) => (item.id === activeId ? { ...item, ...data.item } : item))
            );
            setDraft((prev) => ({
                ...prev,
                solution_latex: data.item?.solution_latex ?? prev.solution_latex,
                solution_jsxgraph_code:
                    data.item?.solution_jsxgraph_code ?? prev.solution_jsxgraph_code,
            }));
            setSuccess('AI generation rerun complete');
        } catch (err) {
            setError(err.message || 'Rerun failed');
        } finally {
            setRerunning(false);
        }
    };

    const handleBulkApprove = async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) {
            setError('Select at least one staging item to approve');
            return;
        }

        setApproving(true);
        setError(null);
        setSuccess(null);
        try {
            if (activeId && selectedIds.has(activeId)) {
                await saveActiveDraft();
            }

            const response = await fetch(`${API_BASE}/api/staging/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staging_ids: ids }),
            });
            if (!response.ok) {
                let detail = `Approve failed (${response.status})`;
                try {
                    const body = await response.json();
                    detail = body.detail || detail;
                } catch {
                    // ignore
                }
                throw new Error(detail);
            }

            const result = await response.json();
            const approvedCount = result.approved?.length ?? 0;
            const failedCount = result.failed?.length ?? 0;
            setSuccess(
                `Published ${approvedCount} item(s)` +
                    (failedCount ? `; ${failedCount} failed` : '')
            );
            if (failedCount) {
                setError(
                    result.failed
                        .map((f) => `${f.id}: ${f.error}`)
                        .join(' | ')
                );
            }
            setSelectedIds(new Set());
            await loadStaging();
        } catch (err) {
            setError(err.message || 'Bulk approve failed');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!activeId) return;

        setRejecting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`${API_BASE}/api/staging/${activeId}/reject`, {
                method: 'POST',
            });
            if (!response.ok) {
                let detail = `Reject failed (${response.status})`;
                try {
                    const body = await response.json();
                    detail = body.detail || detail;
                } catch {
                    // ignore
                }
                throw new Error(detail);
            }

            setSuccess(`Rejected ${formatQuestionBadge(draft)}`);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(activeId);
                return next;
            });
            await loadStaging();
        } catch (err) {
            setError(err.message || 'Reject failed');
        } finally {
            setRejecting(false);
        }
    };

    const busy = uploading || rerunning || approving || rejecting || saving;

    return (
        <Box sx={{ p: { xs: 1.5, md: 2 }, maxWidth: 1600, mx: 'auto' }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Solution Reviewer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Preview staged AI solutions, edit, then publish to Math_Past_Paper
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                        disabled={busy}
                    >
                        Upload PDF
                        <input hidden type="file" accept="application/pdf,.pdf" onChange={handleUpload} />
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={loadStaging}
                        disabled={busy || loadingQueue}
                    >
                        Refresh queue
                    </Button>
                </Stack>
            </Stack>

            {(uploading || uploadStatus) && (
                <Paper sx={{ p: 1.5, mb: 2 }}>
                    {uploading && <LinearProgress sx={{ mb: 1 }} />}
                    <Typography variant="body2">{uploadStatus || 'Working…'}</Typography>
                </Paper>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
                    gap: 2,
                    alignItems: 'start',
                    minHeight: '70vh',
                }}
            >
                {/* Staging queue sidebar */}
                <Paper sx={{ p: 1.5, position: { md: 'sticky' }, top: { md: 16 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Staging queue
                        </Typography>
                        <Chip size="small" label={`${items.length} pending`} />
                    </Stack>

                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={items.length > 0 && selectedIds.size === items.length}
                                indeterminate={selectedIds.size > 0 && selectedIds.size < items.length}
                                onChange={toggleSelectAll}
                                disabled={!items.length}
                            />
                        }
                        label={<Typography variant="body2">Select all</Typography>}
                        sx={{ mb: 0.5 }}
                    />

                    {loadingQueue ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : items.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No pending staging items. Upload a PDF to begin.
                        </Typography>
                    ) : (
                        <List dense disablePadding sx={{ maxHeight: '68vh', overflow: 'auto' }}>
                            {items.map((item) => {
                                const selected = selectedIds.has(item.id);
                                const active = item.id === activeId;
                                return (
                                    <ListItemButton
                                        key={item.id}
                                        selected={active}
                                        onClick={async () => {
                                            if (item.id === activeId) return;
                                            if (activeId) {
                                                try {
                                                    await saveActiveDraft();
                                                } catch {
                                                    // keep selection change; error already surfaced
                                                }
                                            }
                                            setActiveId(item.id);
                                        }}
                                        sx={{ borderRadius: 1, mb: 0.5, alignItems: 'flex-start' }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                                            <Checkbox
                                                edge="start"
                                                size="small"
                                                checked={selected}
                                                tabIndex={-1}
                                                disableRipple
                                                onClick={(event) => event.stopPropagation()}
                                                onChange={() => toggleSelected(item.id)}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {formatQuestionBadge(item)}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={item.status || 'pending'}
                                                        color={item.status === 'pending' ? 'warning' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </Stack>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {item.question_text || 'No question text'}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </Paper>

                {/* Main workspace */}
                <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
                    {!activeItem ? (
                        <Typography color="text.secondary">Select a staging item to review.</Typography>
                    ) : (
                        <Stack spacing={2.5}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatQuestionBadge(draft)}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Button
                                        variant="outlined"
                                        startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                                        onClick={() => saveActiveDraft().catch(() => null)}
                                        disabled={busy}
                                    >
                                        Save draft
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={rerunning ? <CircularProgress size={16} /> : <Refresh />}
                                        onClick={handleRerun}
                                        disabled={busy}
                                    >
                                        Rerun AI Generation
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={approving ? <CircularProgress size={16} color="inherit" /> : <Publish />}
                                        onClick={handleBulkApprove}
                                        disabled={busy || selectedIds.size === 0}
                                    >
                                        Bulk Approve & Publish ({selectedIds.size})
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={rejecting ? <CircularProgress size={16} color="inherit" /> : <Block />}
                                        onClick={handleReject}
                                        disabled={busy || !activeId}
                                    >
                                        Reject
                                    </Button>
                                </Stack>
                            </Stack>

                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Question meta & text
                                </Typography>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
                                    <TextField
                                        label="Year"
                                        size="small"
                                        value={draft.year}
                                        onChange={updateDraftField('year')}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Paper"
                                        size="small"
                                        value={draft.paper}
                                        onChange={updateDraftField('paper')}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Question no"
                                        size="small"
                                        value={draft.question_no}
                                        onChange={updateDraftField('question_no')}
                                        fullWidth
                                    />
                                </Stack>
                                <TextField
                                    label="Question text"
                                    value={draft.question_text}
                                    onChange={updateDraftField('question_text')}
                                    multiline
                                    minRows={4}
                                    fullWidth
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    LaTeX solution
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                                        gap: 1.5,
                                    }}
                                >
                                    <TextField
                                        label="solution_latex"
                                        value={draft.solution_latex}
                                        onChange={updateDraftField('solution_latex')}
                                        multiline
                                        minRows={12}
                                        fullWidth
                                        InputProps={{ sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 } }}
                                    />
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 1.5, minHeight: 280, overflow: 'auto', bgcolor: '#fafafa' }}
                                    >
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            Live preview
                                        </Typography>
                                        {renderLatexPreview(deferredLatex)}
                                    </Paper>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    JSXGraph
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                                        gap: 1.5,
                                    }}
                                >
                                    <TextField
                                        label="solution_jsxgraph_code"
                                        value={draft.solution_jsxgraph_code}
                                        onChange={updateDraftField('solution_jsxgraph_code')}
                                        multiline
                                        minRows={12}
                                        fullWidth
                                        InputProps={{ sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 } }}
                                    />
                                    <Paper variant="outlined" sx={{ p: 1, minHeight: 320, bgcolor: '#fafafa' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', px: 0.5 }}>
                                            Live render
                                        </Typography>
                                        {deferredJsx?.trim() ? (
                                            <Box sx={{ height: 420 }}>
                                                <NativeJSXGraphContainer
                                                    code={deferredJsx}
                                                    elementId="staging_preview_jxg"
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                                                No JSXGraph code yet
                                            </Typography>
                                        )}
                                    </Paper>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default SolutionReviewer;
