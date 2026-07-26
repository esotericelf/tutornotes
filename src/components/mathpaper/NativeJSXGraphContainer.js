import React, { useEffect, useState } from 'react';

const JSXGRAPH_CSS_ID = 'jsxgraph-cdn-css';
const JSXGRAPH_SCRIPT_ID = 'jsxgraph-cdn-js';
const JSXGRAPH_CSS_HREF = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.10.1/distrib/jsxgraph.css';
const JSXGRAPH_JS_SRC = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.10.1/distrib/jsxgraphcore.js';

let jsxGraphLoadPromise = null;

function ensureStylesheet() {
    if (document.getElementById(JSXGRAPH_CSS_ID)) {
        return;
    }

    const link = document.createElement('link');
    link.id = JSXGRAPH_CSS_ID;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = JSXGRAPH_CSS_HREF;
    document.head.appendChild(link);
}

function loadJSXGraph() {
    if (typeof window !== 'undefined' && window.JXG) {
        return Promise.resolve(window.JXG);
    }

    if (jsxGraphLoadPromise) {
        return jsxGraphLoadPromise;
    }

    jsxGraphLoadPromise = new Promise((resolve, reject) => {
        ensureStylesheet();

        const existingScript = document.getElementById(JSXGRAPH_SCRIPT_ID);
        if (existingScript) {
            if (window.JXG) {
                resolve(window.JXG);
                return;
            }
            existingScript.addEventListener('load', () => resolve(window.JXG), { once: true });
            existingScript.addEventListener('error', () => {
                jsxGraphLoadPromise = null;
                reject(new Error('Failed to load JSXGraph script'));
            }, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = JSXGRAPH_SCRIPT_ID;
        script.src = JSXGRAPH_JS_SRC;
        script.async = true;
        script.onload = () => {
            if (window.JXG) {
                resolve(window.JXG);
            } else {
                jsxGraphLoadPromise = null;
                reject(new Error('JSXGraph loaded but window.JXG is unavailable'));
            }
        };
        script.onerror = () => {
            jsxGraphLoadPromise = null;
            reject(new Error('Failed to load JSXGraph script'));
        };
        document.head.appendChild(script);
    });

    return jsxGraphLoadPromise;
}

function freeBoardByElementId(JXG, elementId) {
    if (!JXG?.JSXGraph) {
        return;
    }

    try {
        if (typeof JXG.JSXGraph.freeBoard === 'function') {
            // Newer JSXGraph accepts board id string
            JXG.JSXGraph.freeBoard(elementId);
            return;
        }
    } catch {
        // Fall through to manual lookup
    }

    try {
        const boards = JXG.JSXGraph.boards;
        if (!boards) {
            return;
        }
        Object.keys(boards).forEach((boardKey) => {
            const board = boards[boardKey];
            if (board?.containerObj?.id === elementId || board?.container === elementId) {
                JXG.JSXGraph.freeBoard(board);
            }
        });
    } catch {
        // Ignore cleanup failures
    }
}

/**
 * Renders native JSXGraph by injecting CDN assets (once) and executing trusted code.
 * Props:
 * - code: string — JS body that may use JXG and elementId
 * - elementId: string — id of the .jxgbox container
 */
const NativeJSXGraphContainer = ({ code, elementId }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setError(null);

            if (!code || !elementId) {
                return;
            }

            try {
                const JXG = await loadJSXGraph();
                if (cancelled) {
                    return;
                }

                freeBoardByElementId(JXG, elementId);

                const container = document.getElementById(elementId);
                if (container) {
                    container.innerHTML = '';
                }

                // Execute against window.JXG; expose elementId for initBoard(elementId, ...)
                // Trusted admin/content-authored JSXGraph snippets; Function scopes JXG + elementId.
                // eslint-disable-next-line no-new-func -- intentional sandboxed board init
                const execute = new Function('JXG', 'elementId', `"use strict";\n${code}`);
                execute(JXG, elementId);
            } catch (err) {
                if (!cancelled) {
                    console.error('NativeJSXGraphContainer failed to render:', err);
                    setError(err?.message || 'Failed to render JSXGraph diagram');
                }
            }
        };

        run();

        return () => {
            cancelled = true;
            if (window.JXG) {
                freeBoardByElementId(window.JXG, elementId);
            }
            const container = document.getElementById(elementId);
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [code, elementId]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {error && (
                <div
                    style={{
                        padding: '8px 12px',
                        color: '#b71c1c',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}
                >
                    {error}
                </div>
            )}
            <div
                id={elementId}
                className="jxgbox"
                style={{ width: '100%', height: '500px', flex: 1 }}
            />
        </div>
    );
};

export default NativeJSXGraphContainer;
