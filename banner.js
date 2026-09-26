/* ===== BANNER SECTION (SINGLE FULL WIDTH) ===== */
.banner-section {
    position: relative;
    width: 100%;
    height: 320px; /* Tùy chỉnh chiều cao */
    border-radius: 12px;
    overflow: hidden;
    background: #0f172a;
    margin-bottom: 20px;
}

.banner-slides {
    position: relative;
    width: 100%;
    height: 100%;
}

.banner-slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.6s ease, transform 0.6s ease;
    transform: translateX(30px);
}

.banner-slide.active {
    opacity: 1;
    transform: translateX(0);
    z-index: 2;
}

.banner-slide.exit-left {
    opacity: 0;
    transform: translateX(-30px);
    z-index: 1;
}

.banner-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.banner-slide-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #1e3a8a, #0f172a);
}

/* Dots */
.banner-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
}

.banner-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s;
}

.banner-dot.active {
    background: #fff;
    width: 24px;
    border-radius: 5px;
}

/* Nút prev/next */
.banner-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.banner-nav-btn:hover { background: rgba(0, 0, 0, 0.7); }
.banner-nav-btn.prev { left: 12px; }
.banner-nav-btn.next { right: 12px; }

/* Nút chỉnh sửa (Admin) */
.banner-edit-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    background: rgba(37, 99, 235, 0.9);
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.3s, transform 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.banner-edit-btn:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
}

/* ===== MODAL CHỈNH SỬA ===== */
.banner-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.banner-modal {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 720px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.banner-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
}

.banner-modal-header h3 { margin: 0; font-size: 1.1rem; }

.banner-modal-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: background 0.2s;
}

.banner-modal-close:hover { background: #f3f4f6; }

.banner-modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.banner-upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 10px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
    margin-bottom: 20px;
}

.banner-upload-area:hover,
.banner-upload-area.dragover {
    border-color: #2563eb;
    background: #eff6ff;
}

.banner-upload-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.banner-upload-inner p { margin: 4px 0; font-size: 0.95rem; }
.banner-upload-inner small { color: #6b7280; font-size: 0.8rem; }

.banner-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.banner-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: background 0.2s;
}

.banner-list-item:hover { background: #f9fafb; }

.banner-list-item img {
    width: 100px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.banner-list-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.banner-list-name {
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.banner-list-index { font-size: 0.75rem; color: #6b7280; }

.banner-list-delete {
    background: #fee2e2;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    flex-shrink: 0;
}

.banner-list-delete:hover { background: #fecaca; }

.banner-list-loading,
.banner-list-empty {
    text-align: center;
    color: #6b7280;
    padding: 20px;
    font-size: 0.9rem;
}

.banner-modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.banner-btn-close {
    background: #f3f4f6;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
}

.banner-btn-close:hover { background: #e5e7eb; }

/* Mobile */
@media (max-width: 640px) {
    .banner-section { height: 200px; }
    .banner-edit-btn { font-size: 0.75rem; padding: 6px 10px; }
    .banner-list-item img { width: 70px; height: 45px; }
}
