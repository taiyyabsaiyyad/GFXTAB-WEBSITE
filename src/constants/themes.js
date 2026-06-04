// GFXTAB AI Studio — Color Themes per Product
// Each product has 8 color variants

export const THEMES = {
  'tshirt-crew': [
    { id: 'white', name: 'Cloud White', hex: '#FFFFFF', textile: true },
    { id: 'black', name: 'Void Black', hex: '#111111', textile: true },
    { id: 'navy', name: 'Deep Navy', hex: '#1B2A4A', textile: true },
    { id: 'lime', name: 'Electric Lime', hex: '#C8FF00', textile: true },
    { id: 'violet', name: 'Deep Violet', hex: '#4B0082', textile: true },
    { id: 'red', name: 'Crimson', hex: '#C41E3A', textile: true },
    { id: 'sand', name: 'Desert Sand', hex: '#D4B896', textile: true },
    { id: 'forest', name: 'Forest Green', hex: '#2D5016', textile: true },
  ],
  'tshirt-oversized': [
    { id: 'black', name: 'Void Black', hex: '#111111', textile: true },
    { id: 'white', name: 'Cloud White', hex: '#FAFAFA', textile: true },
    { id: 'grey', name: 'Ash Grey', hex: '#888888', textile: true },
    { id: 'cream', name: 'Vintage Cream', hex: '#F5F0E8', textile: true },
    { id: 'blue', name: 'Sky Wash', hex: '#4A90D9', textile: true },
    { id: 'terracotta', name: 'Terracotta', hex: '#C4714A', textile: true },
    { id: 'lilac', name: 'Soft Lilac', hex: '#B8A9C9', textile: true },
    { id: 'olive', name: 'Olive Drab', hex: '#6B6B3A', textile: true },
  ],
  'book-cover': [
    { id: 'dark', name: 'Midnight', hex: '#0D0D1A', textile: false },
    { id: 'white', name: 'Parchment', hex: '#F8F4E8', textile: false },
    { id: 'red', name: 'Crimson Cloth', hex: '#8B1A1A', textile: false },
    { id: 'blue', name: 'Sapphire', hex: '#1A3A5C', textile: false },
    { id: 'green', name: 'Forest Cloth', hex: '#1A3A1A', textile: false },
    { id: 'gold', name: 'Antique Gold', hex: '#B8860B', textile: false },
    { id: 'grey', name: 'Slate', hex: '#4A4A5A', textile: false },
    { id: 'tan', name: 'Natural Linen', hex: '#C4A882', textile: false },
  ],
  'mug-ceramic': [
    { id: 'white', name: 'Pure White', hex: '#FFFFFF', textile: false },
    { id: 'black', name: 'Matte Black', hex: '#1A1A1A', textile: false },
    { id: 'navy', name: 'Deep Blue', hex: '#1B2A4A', textile: false },
    { id: 'red', name: 'Cherry Red', hex: '#C41E1E', textile: false },
    { id: 'forest', name: 'Sage Green', hex: '#4A7A3A', textile: false },
    { id: 'pink', name: 'Blush Pink', hex: '#F4C2C2', textile: false },
    { id: 'yellow', name: 'Sunny Yellow', hex: '#FFD700', textile: false },
    { id: 'purple', name: 'Lavender', hex: '#7B5EA7', textile: false },
  ],
  'poster-a3': [
    { id: 'white', name: 'Bright White', hex: '#FFFFFF', textile: false },
    { id: 'cream', name: 'Warm Cream', hex: '#F5EDD6', textile: false },
    { id: 'dark', name: 'Charcoal', hex: '#1A1A2A', textile: false },
    { id: 'kraft', name: 'Kraft Brown', hex: '#B8956A', textile: false },
    { id: 'mint', name: 'Mint', hex: '#C8F5E8', textile: false },
    { id: 'lavender', name: 'Lavender', hex: '#E8D5F5', textile: false },
    { id: 'peach', name: 'Peach', hex: '#FFD5C8', textile: false },
    { id: 'sky', name: 'Sky Blue', hex: '#C8E8FF', textile: false },
  ],
  'business-card': [
    { id: 'white', name: 'Cotton White', hex: '#FAFAFA', textile: false },
    { id: 'black', name: 'Jet Black', hex: '#0A0A0A', textile: false },
    { id: 'gold', name: 'Gold Foil', hex: '#B8860B', textile: false },
    { id: 'navy', name: 'Deep Navy', hex: '#0D1B2A', textile: false },
    { id: 'kraft', name: 'Kraft', hex: '#C4956A', textile: false },
    { id: 'cream', name: 'Linen', hex: '#F5EDD6', textile: false },
    { id: 'dark-green', name: 'Emerald', hex: '#1A3A2A', textile: false },
    { id: 'maroon', name: 'Maroon', hex: '#4A0E1A', textile: false },
  ],
};

// Default to white for products without specific themes
export const DEFAULT_THEMES = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#111111' },
  { id: 'navy', name: 'Navy', hex: '#1B2A4A' },
  { id: 'red', name: 'Red', hex: '#C41E3A' },
  { id: 'green', name: 'Green', hex: '#2D5016' },
  { id: 'purple', name: 'Purple', hex: '#4B0082' },
  { id: 'grey', name: 'Grey', hex: '#555555' },
  { id: 'beige', name: 'Beige', hex: '#D4C5A0' },
];

export const getThemes = (productId) => THEMES[productId] || DEFAULT_THEMES;

export default THEMES;
