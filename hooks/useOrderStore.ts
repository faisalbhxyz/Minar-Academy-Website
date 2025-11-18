import { create } from "zustand";

interface Course {
  id: number;
  title: string;
  featured_image?: string | null;
  pricing_model: PricingModel;
  regular_price?: number | null;
  sale_price?: number | null;
}

interface Order {
  course_id: number;
  title: string;
  customer_note: string;
  invoice_id: number;
  total: number;
  payment_method?: string | null;
  transaction_id?: string | null;
}

type State = {
  item: Course | null;
  setItem: (item: Course) => void;
  clearItem: () => void;
  order: Order | null;
  setOrder: (order: Order) => void;
  clearOrder: () => void;
};

const useOrderStore = create<State>((set) => ({
  item: null,
  setItem: (item) => set({ item }),
  clearItem: () => set({ item: null }),
  order: null,
  setOrder: (order) => set({ order }),
  clearOrder: () => set({ order: null }),
}));

export default useOrderStore;
