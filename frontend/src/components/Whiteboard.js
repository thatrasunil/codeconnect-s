import React, { useState, useRef, useEffect } from 'react';
import { FaPen, FaEraser, FaUndo, FaRedo, FaTrash, FaDownload, FaTimes, FaCircle, FaSquare, FaMinus } from 'react-icons/fa';
import './Whiteboard.css';

const Whiteboard = ({ roomId, isOpen, onClose, onAddDrawing, drawings = [] }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [startPos, setStartPos] = useState(null);

    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        // Set canvas size
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Set white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw all drawings from Firestore
        drawings.forEach(drawing => {
            drawAction(ctx, drawing);
        });
    }, [drawings]);

    const drawAction = (ctx, action) => {
        if (!ctx || !action) return;

        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (action.type === 'stroke') {
            ctx.beginPath();
            action.points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.stroke();
        } else if (action.type === 'shape') {
            if (action.tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(action.points[0].x, action.points[0].y);
                ctx.lineTo(action.points[1].x, action.points[1].y);
                ctx.stroke();
            } else if (action.tool === 'rect') {
                const width = action.points[1].x - action.points[0].x;
                const height = action.points[1].y - action.points[0].y;
                ctx.strokeRect(action.points[0].x, action.points[0].y, width, height);
            } else if (action.tool === 'circle') {
                const radius = Math.sqrt(
                    Math.pow(action.points[1].x - action.points[0].x, 2) +
                    Math.pow(action.points[1].y - action.points[0].y, 2)
                );
                ctx.beginPath();
                ctx.arc(action.points[0].x, action.points[0].y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        const pos = getMousePos(e);
        setIsDrawing(true);
        setStartPos(pos);

        if (tool === 'pen' || tool === 'eraser') {
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getMousePos(e);

        if (tool === 'pen' || tool === 'eraser') {
            ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;

        const pos = getMousePos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let action = null;

        if (tool === 'pen' || tool === 'eraser') {
            // For pen/eraser, we'd need to track all points during drawing
            // For simplicity, we'll create a simple stroke
            action = {
                type: 'stroke',
                tool: tool,
                color: tool === 'eraser' ? '#FFFFFF' : color,
                width: strokeWidth,
                points: [startPos, pos],
                timestamp: Date.now()
            };
        } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
            // Draw shape
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;

            if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === 'rect') {
                const width = pos.x - startPos.x;
                const height = pos.y - startPos.y;
                ctx.strokeRect(startPos.x, startPos.y, width, height);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(
                    Math.pow(pos.x - startPos.x, 2) +
                    Math.pow(pos.y - startPos.y, 2)
                );
                ctx.beginPath();
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }

            action = {
                type: 'shape',
                tool: tool,
                color: color,
                width: strokeWidth,
                points: [startPos, pos],
                timestamp: Date.now()
            };
        }

        if (action && onAddDrawing) {
            onAddDrawing(action);
        }

        setIsDrawing(false);
        setStartPos(null);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (onAddDrawing) {
            onAddDrawing({ type: 'clear', timestamp: Date.now() });
        }
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `whiteboard_${roomId}_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="whiteboard-container">
            <div className="whiteboard-header">
                <h3>Whiteboard</h3>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="whiteboard-toolbar">
                <div className="tool-group">
                    <button
                        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}
                        title="Pen"
                    >
                        <FaPen />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                        onClick={() => setTool('eraser')}
                        title="Eraser"
                    >
                        <FaEraser />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
                        onClick={() => setTool('line')}
                        title="Line"
                    >
                        <FaMinus />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'rect' ? 'active' : ''}`}
                        onClick={() => setTool('rect')}
                        title="Rectangle"
                    >
                        <FaSquare />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
                        onClick={() => setTool('circle')}
                        title="Circle"
                    >
                        <FaCircle />
                    </button>
                </div>

                <div className="color-picker">
                    {colors.map(c => (
                        <button
                            key={c}
                            className={`color-btn ${color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                            title={c}
                        />
                    ))}
                </div>

                <div className="stroke-width">
                    <label>Width: {strokeWidth}px</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    />
                </div>

                <div className="action-buttons">
                    <button className="action-btn" onClick={clearCanvas} title="Clear">
                        <FaTrash />
                    </button>
                    <button className="action-btn" onClick={downloadCanvas} title="Download">
                        <FaDownload />
                    </button>
                </div>
            </div>

            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>
        </div>
    );
};

export default Whiteboard;
