import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/lib/client-api/auth/types';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: Review[];
  features: string[];
}

export interface Order {
  id: string;
  customerId: string;
  products: { productId: string; quantity: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  deliveryPartnerId?: string | null;
  address: string;
  date: string;
}

interface AppState {
  // User Profile
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;

  // E-commerce state
  products: Product[];
  orders: Order[];
  cart: { product: Product; quantity: number }[];
  wishlist: string[];
  messages: Message[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  placeOrder: (customerId: string, address: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], deliveryPartnerId?: string) => void;
  sendMessage: (orderId: string, senderId: string, text: string) => void;
}

const mockProducts: Product[] = [
  { 
    id: 'p1', 
    name: 'Sony WH-1000XM5 Wireless Headphones', 
    shortDescription: 'Industry leading noise canceling headphones.',
    description: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality.', 
    price: 348.00, 
    originalPrice: 399.00,
    category: 'Electronics', 
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    stock: 15,
    rating: 4.8,
    features: ['Industry Leading NC', '30 Hour Battery', 'Ultra Comfortable', 'Multipoint Connection'],
    reviews: [
      { id: 'r1', userName: 'Alice', rating: 5, comment: 'Best headphones I have ever used.', date: '2023-10-01' }
    ]
  },
  { 
    id: 'p2', 
    name: 'Apple Watch Series 9', 
    shortDescription: 'Smarter, brighter, mightier.',
    description: 'The most powerful chip in Apple Watch ever. A magical new way to use your watch without touching the screen. A display that’s twice as bright.', 
    price: 399.00, 
    category: 'Wearables', 
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    stock: 42,
    rating: 4.9,
    features: ['S9 SiP', 'Double Tap Gesture', 'Blood Oxygen App', 'ECG App'],
    reviews: []
  },
  { 
    id: 'p3', 
    name: 'Herman Miller Aeron Chair', 
    shortDescription: 'The pinnacle of ergonomic seating.',
    description: 'Aeron’s innovative design provides ideal support for your back and encourages good posture. Fully adjustable and highly breathable.', 
    price: 1250.00,
    originalPrice: 1400.00, 
    category: 'Furniture', 
    images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'],
    stock: 5,
    rating: 4.7,
    features: ['PostureFit SL', 'Pellicle Suspension', 'Fully Adjustable Arms', 'Tilt Limiter'],
    reviews: []
  },
  { 
    id: 'p4', 
    name: 'Keychron Q1 Pro Mechanical Keyboard', 
    shortDescription: 'Custom wireless mechanical keyboard.',
    description: 'A fully customizable 75% layout wireless mechanical keyboard with QMK/VIA support, full aluminum CNC machined body.', 
    price: 199.00, 
    category: 'Accessories', 
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
    stock: 20,
    rating: 4.6,
    features: ['Wireless/Wired', 'QMK/VIA Support', 'Gasket Mount', 'Hot-swappable'],
    reviews: []
  },
  { 
    id: 'p5', 
    name: 'Nike Air Max 270', 
    shortDescription: 'Lifestyle meets performance.',
    description: 'Boasting the first-ever Max Air unit created specifically for Nike Sportswear, it delivers visible air under every step.', 
    price: 160.00, 
    category: 'Fashion', 
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    stock: 120,
    rating: 4.5,
    features: ['Max Air 270 unit', 'Woven fabric upper', 'Foam midsole', 'Rubber outsole'],
    reviews: []
  },
  { 
    id: 'p6', 
    name: 'Minimalist Ceramic Vase', 
    shortDescription: 'Elegant decor for modern homes.',
    description: 'Hand-crafted ceramic vase with a matte finish. Perfect for dried flowers or as a standalone architectural piece.', 
    price: 45.00, 
    originalPrice: 60.00,
    category: 'Home Decor', 
    images: ['https://images.unsplash.com/photo-1612152605347-f93296cb657d?w=800&q=80'],
    stock: 8,
    rating: 4.2,
    features: ['Handmade', 'Matte Finish', 'Water resistant interior'],
    reviews: []
  }
];

const mockOrders: Order[] = [
  { id: 'ORD-8921', customerId: '1', products: [{ productId: 'p1', quantity: 1 }], total: 348.00, status: 'processing', address: '123 Main St, NY', date: '2023-10-10' },
  { id: 'ORD-7642', customerId: '1', products: [{ productId: 'p5', quantity: 2 }], total: 320.00, status: 'out_for_delivery', deliveryPartnerId: '3', address: '456 Park Ave, NY', date: '2023-10-09' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User Profile in Zustand
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Products & Orders
      products: mockProducts,
      orders: mockOrders,
      cart: [],
      wishlist: [],
      messages: [
        { id: 'm1', orderId: 'ORD-7642', senderId: '3', text: 'Hi, I have picked up your order and am on the way!', timestamp: '10:00 AM' },
        { id: 'm2', orderId: 'ORD-7642', senderId: '1', text: 'Great, thanks! Please ring the doorbell.', timestamp: '10:05 AM' }
      ],
      
      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find(item => item.product.id === product.id);
          if (existing) {
            return { cart: state.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
          }
          return { cart: [...state.cart, { product, quantity: 1 }] };
        });
      },

      updateCartQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) return { cart: state.cart.filter(item => item.product.id !== productId) };
          return { cart: state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item) };
        });
      },
      
      removeFromCart: (productId) => {
        set((state) => ({ cart: state.cart.filter(item => item.product.id !== productId) }));
      },
      
      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.includes(productId) 
            ? state.wishlist.filter(id => id !== productId)
            : [...state.wishlist, productId]
        }));
      },
      
      placeOrder: (customerId, address) => {
        set((state) => {
          const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          const newOrder: Order = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            customerId,
            address,
            total,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            products: state.cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
          };
          return { orders: [newOrder, ...state.orders], cart: [] };
        });
      },

      updateOrderStatus: (orderId, status, deliveryPartnerId) => {
        set((state) => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              const updated = { ...order, status };
              if (deliveryPartnerId !== undefined) updated.deliveryPartnerId = deliveryPartnerId;
              return updated;
            }
            return order;
          })
        }));
      },

      sendMessage: (orderId, senderId, text) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `m${Date.now()}`,
              orderId,
              senderId,
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }));
      }
    }),
    {
      name: 'ecommerce-app-storage',
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
