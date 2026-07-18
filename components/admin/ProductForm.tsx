'use client';

import React, { useState } from 'react';
import { createProduct } from '@/lib/actions/products';
import { formatPrice, parsePrice, toEnglishDigits } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ categories, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category_id = formData.get('category_id') as string;
    const image_file = formData.get('image') as File;

    try {
      const result = await createProduct({
        name,
        price: parsePrice(price),
        description,
        category_id: category_id || undefined,
        main_image: image_file.size > 0 ? image_file : null,
        gallery_images: [],
        shippingType: 'PAID', // Default value
      });
// ... (omitted rest for brevity, but I will replace the whole block)

      if (result.success) {
        setMessage({ type: 'success', text: 'محصول با موفقیت ثبت شد.' });
        (e.target as HTMLFormElement).reset();
        setImagePreview(null);
        onSuccess();
      } else {
        setMessage({ type: 'error', text: result.error || 'خطا در ثبت محصول.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'یک خطای غیرمنتظره رخ داد.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">افزودن محصول جدید</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نام محصول</label>
        <input name="name" required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان)</label>
          <input
            name="price"
            type="text"
            required
            value={price}
            onChange={(e) => {
              const engVal = toEnglishDigits(e.target.value);
              const numeric = engVal.replace(/[^0-9]/g, '');
              setPrice(formatPrice(numeric));
            }}
            placeholder="مثلا: 1,200,000"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
          <select name="category_id" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">انتخاب کنید...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
        <textarea name="description" rows={3} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">تصویر محصول</label>
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded border" />
          </div>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-bold text-white transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'در حال ثبت...' : 'ثبت محصول'}
      </button>
    </form>
  );
};

export default ProductForm;
