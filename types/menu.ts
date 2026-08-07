export interface MenuItem {
  id: string;

  name: string;

  description: string;

  price: number;

  image: string;

  category: string;

  available: boolean;

  sort_order: number;

  created_at: string;
}

export interface CreateMenuItem {
  name: string;

  description: string;

  price: number;

  image: string;

  category: string;

  available: boolean;

  sort_order: number;
}

export interface UpdateMenuItem
  extends CreateMenuItem {
  id: string;
}