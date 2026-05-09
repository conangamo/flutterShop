# Jewelry Toast System - Bộ Toast Trang Sức

Hệ thống toast thông báo đẹp mắt với tông màu pastel dịu dàng cho ứng dụng thương mại điện tử trang sức.

---

## 📋 Nội dung

1. [Cài đặt nhanh](#cài-đặt-nhanh)
2. [Cách sử dụng](#cách-sử-dụng)
3. [Component Code](#component-code)
4. [Cấu hình Theme](#cấu-hình-theme)

---

## 🚀 Cài đặt nhanh

### Step 1: Copy hai file component

#### File 1: `components/jewelry-toast.tsx`
```typescript
import React, { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
    titleColor: 'text-gray-900 dark:text-white',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-error/10',
    borderColor: 'border-error/30',
    textColor: 'text-error',
    titleColor: 'text-gray-900 dark:text-white',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
    titleColor: 'text-gray-900 dark:text-white',
  },
  info: {
    icon: Info,
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    textColor: 'text-info',
    titleColor: 'text-gray-900 dark:text-white',
  },
  loading: {
    icon: Loader2,
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    textColor: 'text-primary',
    titleColor: 'text-gray-900 dark:text-white',
  },
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false)
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (type === 'loading') return

    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, type, duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor}
          border rounded-2xl p-4 shadow-lg backdrop-blur-sm
          max-w-sm w-full
        `}
      >
        <div className="flex gap-3">
          <div className={`flex-shrink-0 mt-1 ${config.textColor}`}>
            <Icon
              className={`w-5 h-5 ${type === 'loading' ? 'animate-spin' : ''}`}
              strokeWidth={2.5}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${config.titleColor}`}>
              {title}
            </h3>
            {message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Subtle progress bar for non-loading toasts */}
        {type !== 'loading' && (
          <div
            className={`
              h-1 ${config.bgColor} mt-3 rounded-full overflow-hidden
              bg-gradient-to-r from-transparent via-${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}/50 to-transparent
            `}
            style={{
              animation:
                type !== 'loading'
                  ? `shrink ${duration}ms linear`
                  : 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Toast
```

#### File 2: `components/toast-container.tsx`
```typescript
'use client'

import React, { useCallback, useState } from 'react'
import Toast, { ToastType } from './jewelry-toast'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => void
  removeToast: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      duration?: number
    ) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration: duration ?? (type === 'loading' ? undefined : 4000),
      }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastProvider
```

### Step 2: Cập nhật `app/layout.tsx`
```typescript
import ToastProvider from '@/components/toast-container'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="bg-background">
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

### Step 3: Thêm animation vào `app/globals.css`
```css
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
```

### Step 4: Thêm color tokens vào `app/globals.css`
```css
:root {
  --success: oklch(0.75 0.16 140);
  --success-foreground: oklch(0.99 0.01 240);
  --warning: oklch(0.8 0.15 65);
  --warning-foreground: oklch(0.25 0.05 260);
  --error: oklch(0.72 0.18 20);
  --error-foreground: oklch(0.99 0.01 240);
  --info: oklch(0.75 0.16 200);
  --info-foreground: oklch(0.99 0.01 240);
}

.dark {
  --success: oklch(0.78 0.15 140);
  --success-foreground: oklch(0.2 0.04 260);
  --warning: oklch(0.82 0.14 65);
  --warning-foreground: oklch(0.2 0.04 260);
  --error: oklch(0.75 0.16 20);
  --error-foreground: oklch(0.2 0.04 260);
  --info: oklch(0.78 0.15 200);
  --info-foreground: oklch(0.2 0.04 260);
}

@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-error: var(--error);
  --color-error-foreground: var(--error-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
}
```

---

## 📖 Cách sử dụng

### Import hook
```typescript
import { useToast } from '@/components/toast-container'
```

### Cách gọi toast

#### 1. Success Toast (Thành công)
```typescript
const { addToast } = useToast()

addToast('success', 'Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng')
```

#### 2. Error Toast (Lỗi)
```typescript
addToast('error', 'Lỗi!', 'Vui lòng kiểm tra lại thông tin')
```

#### 3. Warning Toast (Cảnh báo)
```typescript
addToast('warning', 'Cảnh báo', 'Hàng tồn kho chỉ còn 2 sản phẩm')
```

#### 4. Info Toast (Thông tin)
```typescript
addToast('info', 'Thông tin', 'Đơn hàng đang được xử lý')
```

#### 5. Loading Toast (Đang xử lý)
```typescript
// Loading toast KHÔNG tự động đóng
const toastId = addToast('loading', 'Đang xử lý...', 'Vui lòng đợi')

// Sau khi hoàn tất, đóng thủ công:
// removeToast(toastId)
```

### Ví dụ trong component
```typescript
'use client'

import { useToast } from '@/components/toast-container'

export default function ProductPage() {
  const { addToast } = useToast()

  const handleAddToCart = async () => {
    const toastId = addToast('loading', 'Đang thêm sản phẩm...', 'Vui lòng đợi')
    
    try {
      // Thêm sản phẩm vào giỏ hàng
      await addProductToCart()
      addToast('success', 'Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng')
    } catch (error) {
      addToast('error', 'Lỗi!', 'Không thể thêm sản phẩm')
    }
  }

  return (
    <button onClick={handleAddToCart}>
      Thêm vào giỏ hàng
    </button>
  )
}
```

---

## ⚙️ Cấu hình Theme

### Thay đổi màu sắc

Mở `app/globals.css` và chỉnh sửa các color tokens:

```css
:root {
  /* Success - Xanh lục nhạt */
  --success: oklch(0.75 0.16 140);
  
  /* Warning - Vàng nhạt */
  --warning: oklch(0.8 0.15 65);
  
  /* Error - Hồng đỏ nhạt */
  --error: oklch(0.72 0.18 20);
  
  /* Info - Xanh da trời nhạt */
  --info: oklch(0.75 0.16 200);
}
```

### Thay đổi duration (thời gian hiển thị)
```typescript
// Mặc định: 4000ms (4 giây)
addToast('success', 'Thành công!', 'Tin nhắn', 6000) // 6 giây

// Loading toast không tự động đóng
addToast('loading', 'Đang xử lý...') // Không có timeout
```

---

## 🎨 Tính năng

✅ 5 loại toast: Success, Error, Warning, Info, Loading
✅ Tông màu pastel dịu dàng, tươi sáng
✅ Responsive design (Web & Mobile)
✅ Dark mode support
✅ Icon tự động cho mỗi loại
✅ Progress bar hiệu ứng
✅ Animation mượt mà fade-out
✅ Close button tùy chỉnh
✅ Multiple toast cùng lúc
✅ TypeScript support

---

## 📱 Responsive

Toast được thiết kế responsive tự động:
- **Desktop**: Hiển thị ở góc dưới bên phải
- **Mobile**: Chiều rộng tối đa 448px (max-w-sm), padding responsive

---

## 💡 Tips

- **Loading toast**: Không tự động đóng, phù hợp cho loading/processing
- **Auto-close**: Success, Error, Warning, Info tự động đóng sau 4 giây
- **Custom duration**: Truyền tham số `duration` để thay đổi thời gian
- **Message optional**: Có thể chỉ có title mà không có message
- **Multiple toasts**: Có thể hiển thị nhiều toast cùng lúc, sẽ xếp chồng

---

Chúc bạn sử dụng thành công! 🎉
