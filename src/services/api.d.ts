declare module '../services/api' {
    import axios, { AxiosInstance } from 'axios';
  
    const api: AxiosInstance;
  
    export const authService: {
      login: (username: string, password: string) => Promise<any>;
      signup: (userData: any) => Promise<any>;
      logout: () => void;
      getCurrentUser: () => any | null;
    };
  
    export const assetService: {
      getAssets: () => Promise<any[]>;
      getAssetById: (id: string) => Promise<any>;
    };
  
    export const baseService: {
      getBases: () => Promise<any[]>;
    };
  
    export const dashboardService: {
      getMetrics: (baseId?: string, startDate?: string, endDate?: string, typeId?: string) => Promise<any[]>;
    };
  
    export const purchaseService: {
      addPurchase: (purchaseData: any) => Promise<any>;
    };
  
    export const transferService: {
        addTransfer: (transferData: any) => Promise<any>;
    };

    export const assignmentService: {
        addAssignment: (assignmentData: any) => Promise<any>;
    };
  
    export default api;
  } 