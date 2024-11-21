import React, { useState, useRef, useEffect } from 'react';
import './TshirtCustomizer.css';

const TshirtCustomizer = () => {
  const [tshirtImage, setTshirtImage] = useState(null);
  const [designImage, setDesignImage] = useState(null);
  const [designScale, setDesignScale] = useState(0.5);
  const [designPosition, setDesignPosition] = useState({ x: 250, y: 250 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [customText, setCustomText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 250, y: 400 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textSize, setTextSize] = useState(20);
  const [textColor, setTextColor] = useState('#000000');
  const [fontStyle, setFontStyle] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('center');

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tshirtImage) {
      ctx.fillStyle = '#d3d3d3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (tshirtImage) {
      const tshirtImg = new Image();
      tshirtImg.src = tshirtImage;
      tshirtImg.onload = () => {
        ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);

        if (designImage) {
          drawDesign(ctx);
        }
        if (customText) {
          drawText(ctx);
        }
      };
    } else {
      if (designImage) drawDesign(ctx);
      if (customText) drawText(ctx);
    }
  }, [
    tshirtImage,
    designImage,
    designScale,
    designPosition,
    customText,
    textPosition,
    textSize,
    textColor,
    fontStyle,
    fontWeight,
    textAlign,
  ]);

  const drawDesign = (ctx) => {
    const designImg = new Image();
    designImg.src = designImage;
    designImg.onload = () => {
      const scaledWidth = designImg.width * designScale;
      const scaledHeight = designImg.height * designScale;
      ctx.drawImage(
        designImg,
        designPosition.x - scaledWidth / 2,
        designPosition.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
    };
  };

  const drawText = (ctx) => {
    ctx.font = `${fontWeight} ${textSize}px ${fontStyle}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = textAlign;
    ctx.fillText(customText, textPosition.x, textPosition.y);
  };

  const handleTshirtUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setTshirtImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleDesignUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setDesignImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleZoomIn = () => setDesignScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setDesignScale((prev) => Math.max(prev - 0.1, 0.1));

  const startDragImage = (e) => {
    setIsDraggingImage(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setDesignPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const duringDragImage = (e) => {
    if (isDraggingImage) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setDesignPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const endDragImage = () => setIsDraggingImage(false);

  const startDragText = (e) => {
    setIsDraggingText(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setTextPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const duringDragText = (e) => {
    if (isDraggingText) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setTextPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const endDragText = () => setIsDraggingText(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'custom_tshirt.png';
    link.click();
  };

  return (
    <div className="customizer-container">
      <h2 className="customizer-title">T-shirt Customizer</h2>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        className="customizer-canvas"
        onMouseDown={(e) => {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Determine what to drag
          const designDistance = Math.hypot(mouseX - designPosition.x, mouseY - designPosition.y);
          const textDistance = Math.hypot(mouseX - textPosition.x, mouseY - textPosition.y);

          if (designDistance < 50) startDragImage(e); // Drag image if close to design
          else if (textDistance < 50) startDragText(e); // Drag text if close to text
        }}
        onMouseMove={(e) => {
          duringDragImage(e);
          duringDragText(e);
        }}
        onMouseUp={() => {
          endDragImage();
          endDragText();
        }}
        onMouseLeave={() => {
          endDragImage();
          endDragText();
        }}
      />
      <div className="controls">
        <label>
          Upload T-shirt Image:
          <input type="file" accept="image/*" onChange={handleTshirtUpload} />
        </label>
        <label>
          Upload Design Image:
          <input type="file" accept="image/*" onChange={handleDesignUpload} />
        </label>
        <div>
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Add custom text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
          <input
            type="number"
            placeholder="Text Size"
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
          />
          <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
          <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
          </select>
          <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)}>
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <button onClick={handleDownload}>Download T-shirt Design</button>
      </div>
    </div>
  );
};

export default TshirtCustomizer;
