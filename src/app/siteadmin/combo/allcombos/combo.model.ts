// combo.model.ts
export class Combo {
  id: string;
  name: string;
  discount_price: number;
  combo_size: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  products?: any[];
 
  constructor(combo: Partial<Combo> = {}) {
    this.id = combo.id || this.getRandomID();
    this.name = combo.name || '';
    this.discount_price = combo.discount_price || 0;
    this.combo_size = combo.combo_size || 0;
    this.active = combo.active !== undefined ? combo.active : true;
    this.created_at = combo.created_at || '';
    this.updated_at = combo.updated_at || '';
    this.products = combo.products || [];
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}

export interface ComboProduct {
  product_id: string;
  quantity: number;
}