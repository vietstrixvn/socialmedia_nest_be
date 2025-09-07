interface Category {
  id: string;
  name: string;
}

export interface DataResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  category: Category;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DetailResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  category: Category;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
