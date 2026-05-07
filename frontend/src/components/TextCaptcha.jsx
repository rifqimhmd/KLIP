import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export default function TextCaptcha({ onValidate, onChange }) {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = useCallback(() => {
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    setCaptchaText(text);
    setUserInput('');
    onChange('');
    drawCaptcha(text);
  }, [onChange]);

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 180;
    const height = 60;
    
    canvas.width = width;
    canvas.height = height;

    // Background - noisy gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(0.5, '#e0f2fe');
    gradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise dots
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 0.5)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw distorted text
    const fontSize = 28;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 25;
      const y = 38 + Math.random() * 10 - 5;
      
      // Random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.6);
      
      // Random color (dark blue/purple shades)
      const colors = ['#1e40af', '#3730a3', '#581c87', '#1d4ed8', '#312e81'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Add wavy lines over text
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(100, 100, 150, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let startX = 0;
      let startY = 15 + i * 18;
      ctx.moveTo(startX, startY);
      
      for (let x = 0; x <= width; x += 5) {
        const y = startY + Math.sin(x / 15) * 8;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    onChange(value);
    onValidate(value.toLowerCase() === captchaText.toLowerCase());
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Verifikasi Keamanan
      </label>
      
      <div className="flex items-center gap-3">
        {/* CAPTCHA Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-blue-200 shadow-sm cursor-pointer"
            onClick={generateCaptcha}
            title="Klik untuk ganti CAPTCHA"
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-3 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition border border-gray-200"
          title="Ganti CAPTCHA baru"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Masukkan huruf di atas"
        maxLength={6}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase tracking-widest font-medium"
      />
      
      <p className="text-xs text-gray-500">
        Masukkan huruf/angka yang terlihat (tidak case sensitive)
      </p>
    </div>
  );
}
