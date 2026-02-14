import { User, LayoutItem, ThemeConfig, DURATION_OPTIONS, Product } from './types';

const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_Base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Cookies
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  register: async (name: string, email: string, password: string, phone: string, age: number): Promise<User> => {
    const res = await fetch(`${API_Base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, phone, age })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  getProfile: async (): Promise<User> => {
    const res = await fetch(`${API_Base}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }
    return res.json();
  },

  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_Base}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Verification failed');
    }
    return res.json();
  },

  resetPassword: async (email: string): Promise<void> => {
    const res = await fetch(`${API_Base}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send reset email');
    }
  },

  confirmResetPassword: async (token: string, newPassword: string): Promise<void> => {
    const res = await fetch(`${API_Base}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset password');
    }
  },

  updateProfile: async (data: { name: string, phone: string, age: number }): Promise<void> => {
    const res = await fetch(`${API_Base}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
  },

  submitSupportQuery: async (data: { name: string, email: string, subject: string, message: string }) => {
    const res = await fetch(`${API_Base}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to submit query");
    return res.json();
  },

  logout: async () => {
    await fetch(`${API_Base}/auth/logout`, { method: 'POST', credentials: 'include' });
  },

  // --- DATA ---
  getPurchases: async (): Promise<any[]> => {
    const res = await fetch(`${API_Base}/purchases`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Failed to fetch purchases");
    return res.json();
  },

  getLayouts: async (): Promise<LayoutItem[]> => {
    const res = await fetch(`${API_Base}/layouts`);
    if (!res.ok) throw new Error("Failed to fetch layouts");
    return res.json();
  },

  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_Base}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await fetch(`${API_Base}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  },

  // --- GLOBAL SUBSCRIPTION & TRIAL ---
  getAccessStatus: async (): Promise<{ hasAccess: boolean; accessType: 'SUBSCRIPTION' | 'TRIAL' | 'NONE'; expiry: string | null }> => {
    const res = await fetch(`${API_Base}/access-status`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Failed to check access status");
    return res.json();
  },

  startTrial: async (): Promise<{ success: boolean; expiry: string }> => {
    const res = await fetch(`${API_Base}/trial/start`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to start trial");
    }
    return res.json();
  },

  getSubscriptionPlans: async (): Promise<any[]> => {
    const res = await fetch(`${API_Base}/subscription-plans`);
    if (!res.ok) throw new Error("Failed to fetch plans");
    return res.json();
  },

  verifyCoupon: async (code: string, context: { productId?: string, planId?: string, layoutId?: string }): Promise<{ success: boolean; discount_type: string; discount_value: number; code: string }> => {
    const res = await fetch(`${API_Base}/coupons/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...context })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid Coupon');
    }
    return res.json();
  },

  createPaymentOrder: async (planId: string, customerPhone: string, couponCode?: string): Promise<any> => {
    const res = await fetch(`${API_Base}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planId, customerPhone, couponCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to initiate payment");
    }
    return res.json();
  },

  verifyPayment: async (data: any): Promise<any> => {
    const res = await fetch(`${API_Base}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  createProductOrder: async (productId: string, customerPhone: string, couponCode?: string): Promise<any> => {
    const res = await fetch(`${API_Base}/payment/create-product-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, customerPhone, couponCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to initiate payment");
    }
    return res.json();
  },

  verifyProductPayment: async (data: any): Promise<any> => {
    const res = await fetch(`${API_Base}/payment/verify-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Payment verification failed");
    return res.json();
  },

  saveThemeConfig: async (layoutId: string, config: ThemeConfig): Promise<User | null> => {
    const storedUser = localStorage.getItem('streamtheme_user');
    if (!storedUser) return null;
    const user = JSON.parse(storedUser) as User;

    await fetch(`${API_Base}/purchases/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: user.id, layoutId, config })
    });

    // Fetch fresh profile to get the publicToken created by the backend
    return await api.getProfile();
  },

  getPublicLayout: async (token: string, sessionId: string): Promise<{ layoutId: string, config: ThemeConfig | null, isExpired: boolean } | null> => {
    const res = await fetch(`${API_Base}/public/${token}?sessionId=${sessionId}`);
    if (res.status === 409) throw new Error("SESSION_LOCKED");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }
    return res.json();
  },

  sendHeartbeat: async (token: string, sessionId: string) => {
    const res = await fetch(`${API_Base}/public/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sessionId })
    });
    if (res.status === 409) throw new Error("LOCK_LOST");
  },

  getSettings: async (): Promise<Record<string, string>> => {
    const res = await fetch(`${API_Base}/settings`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  },

  getInstallationVideos: async (): Promise<any[]> => {
    const res = await fetch(`${API_Base}/installation-videos`);
    if (!res.ok) throw new Error("Failed to fetch videos");
    return res.json();
  },

  // --- ADMIN ---
  admin: {
    login: async (username: string, password: string): Promise<{ token: string }> => {
      const res = await fetch(`${API_Base}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Invalid admin credentials");
      return res.json();
    },

    getSettings: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },

    getStats: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },

    getUsers: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },

    deleteUser: async (token: string, id: string) => {
      const res = await fetch(`${API_Base}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },

    updateUserPassword: async (token: string, id: string, newPassword: string) => {
      const res = await fetch(`${API_Base}/admin/users/${id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) throw new Error("Failed to update password");
      return res.json();
    },

    toggleUserStatus: async (token: string, id: string, isActive: boolean) => {
      const res = await fetch(`${API_Base}/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      return res.json();
    },

    grantSubscription: async (token: string, id: string, months: number = 1) => {
      const res = await fetch(`${API_Base}/admin/users/${id}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ layoutId: 'master-standard', months })
      });
      if (!res.ok) throw new Error("Failed to grant subscription");
      return res.json();
    },

    revokeSubscription: async (token: string, id: string) => {
      const res = await fetch(`${API_Base}/admin/users/${id}/subscription/revoke`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to revoke subscription");
      return res.json();
    },

    getLayouts: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/layouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch layouts");
      return res.json();
    },

    updateLayout: async (token: string, id: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/layouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update layout");
      return res.json();
    },

    getTransactions: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },

    getCoupons: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      return res.json();
    },

    createCoupon: async (token: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create coupon");
      return res.json();
    },

    deleteCoupon: async (token: string, code: string) => {
      const res = await fetch(`${API_Base}/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      return res.json();
    },

    getSupportQueries: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/support`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch support queries");
      return res.json();
    },

    updateSupportStatus: async (token: string, id: string, status: string) => {
      const res = await fetch(`${API_Base}/admin/support/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },

    getProducts: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },

    createProduct: async (token: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },

    updateProduct: async (token: string, id: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },

    deleteProduct: async (token: string, id: string) => {
      const res = await fetch(`${API_Base}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },

    getPlans: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },

    updatePlan: async (token: string, id: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update plan");
      return res.json();
    },

    updateSettings: async (token: string, settings: Record<string, string>) => {
      const res = await fetch(`${API_Base}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },

    getInstallationVideos: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/installation-videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json();
    },

    addInstallationVideo: async (token: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/installation-videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add video");
      return res.json();
    },

    updateInstallationVideo: async (token: string, id: number, data: any) => {
      const res = await fetch(`${API_Base}/admin/installation-videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update video");
      return res.json();
    },

    deleteInstallationVideo: async (token: string, id: number) => {
      const res = await fetch(`${API_Base}/admin/installation-videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete video");
      return res.json();
    },

    // Changelogs
    getChangelogs: async (token: string) => {
      const res = await fetch(`${API_Base}/admin/changelogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch changelogs");
      return res.json();
    },

    addChangelog: async (token: string, data: any) => {
      const res = await fetch(`${API_Base}/admin/changelogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to add changelog");
      return res.json();
    },

    deleteChangelog: async (token: string, id: number) => {
      const res = await fetch(`${API_Base}/admin/changelogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete changelog");
      return res.json();
    }
  },

  // Public
  public: {
    getChangelogs: async () => {
      const res = await fetch(`${API_Base}/changelogs`);
      if (!res.ok) throw new Error("Failed to fetch changelogs");
      return res.json();
    }
  }
};
