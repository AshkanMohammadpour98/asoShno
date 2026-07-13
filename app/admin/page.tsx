"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  createCategory,
  updateCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  deleteBrand,
  getAttributes,
  createAttribute,
  deleteAttribute,
  ProductInput
} from '@/lib/actions/products';
import { getSiteSettings, updateSiteSettings } from '@/lib/actions/settings';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  createBlogCategory,
  deleteBlogCategory
} from '@/lib/actions/blog';
import type { LocalProduct, LocalCategory, LocalBrand, LocalAttribute, SiteSettings, BlogPost, BlogCategory } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [brands, setBrands] = useState<LocalBrand[]>([]);
  const [attributes, setAttributes] = useState<LocalAttribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [mainImage, setMainImage] = useState<File | string | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | string | null)[]>([null, null, null]);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([null, null, null]);

  // Dynamic Specs State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [dynamicSpecs, setDynamicSpecs] = useState<{key: string, value: string}[]>([]);

  // Accordion State
  const [openSections, setOpenSections] = useState<string[]>(['basic']);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // CMS State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [cmsFiles, setCmsFiles] = useState<{heroImage?: File, logo?: File, banners: {index: number, file: File}[]}>({banners: []});
  const [previews, setPreviews] = useState<{hero?: string, logo?: string, banners: string[]}>({banners: []});

  // Mgmt States
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newAttrName, setNewAttrName] = useState('');
  const [attrCategoryId, setAttrCategoryId] = useState('');

  // Blog State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [newBlogCatName, setNewBlogCatName] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBrands(),
      fetchAttributes(),
      fetchSettings(),
      fetchBlogPosts(),
      fetchBlogCategories()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchBlogPosts = async () => {
    const res = await getBlogPosts();
    if (res.success) setBlogPosts(res.data || []);
  };

  const fetchBlogCategories = async () => {
    const res = await getBlogCategories();
    if (res.success) setBlogCategories(res.data || []);
  };

  const fetchSettings = async () => {
    const res = await getSiteSettings();
    if (res.success) setSiteSettings(res.data || null);
  };

  const fetchProducts = async () => {
    const res = await getProducts();
    if (res.success) setProducts(res.data || []);
  };

  const fetchCategories = async () => {
    const res = await getCategories();
    if (res.success) setCategories(res.data || []);
  };

  const fetchBrands = async () => {
    const res = await getBrands();
    if (res.success) setBrands(res.data || []);
  };

  const fetchAttributes = async () => {
    const res = await getAttributes();
    if (res.success) setAttributes(res.data || []);
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...galleryImages];
      newImages[index] = file;
      setGalleryImages(newImages);

      const newPreviews = [...galleryPreviews];
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews[index] = reader.result as string;
        setGalleryPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    // Load default attributes for this category
    const catAttrs = attributes.filter(a => a.category_id === catId);
    const initialSpecs = catAttrs.map(a => ({ key: a.name, value: '' }));
    setDynamicSpecs(initialSpecs);
  };

  const handleEditButtonClick = (product: LocalProduct) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
    setSelectedCategoryId(product.category_id || '');
    setDynamicSpecs(product.specs || []);

    setMainImagePreview(product.images?.[0] || null);
    setMainImage(product.images?.[0] || null);

    const previews: (string | null)[] = [null, null, null];
    const images: (File | string | null)[] = [null, null, null];
    for (let i = 0; i < 3; i++) {
        previews[i] = product.images?.[i + 1] || null;
        images[i] = product.images?.[i + 1] || null;
    }
    setGalleryPreviews(previews);
    setGalleryImages(images);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCustomSpec = () => {
    setDynamicSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...dynamicSpecs];
    newSpecs[index][field] = val;
    setDynamicSpecs(newSpecs);
  };

  const removeSpec = (index: number) => {
    setDynamicSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const productData: ProductInput = {
      name: formData.get('name') as string,
      price: formData.get('price') as string,
      description: formData.get('description') as string,
      category_id: formData.get('category_id') as string,
      brand_id: formData.get('brand_id') as string,
      condition: formData.get('condition') as string,
      main_image: mainImage,
      gallery_images: galleryImages,
      specs: dynamicSpecs.filter(s => s.key && s.value)
    };

    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, productData);
    } else {
      res = await createProduct(productData);
    }

    if (res.success) {
      setNotification({ message: 'عملیات با موفقیت انجام شد', type: 'success' });
      setIsAddingProduct(false);
      resetForm();
      fetchProducts();
    } else {
      setNotification({ message: res.error || 'خطا در انجام عملیات', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setMainImage(null);
    setMainImagePreview(null);
    setGalleryImages([null, null, null]);
    setGalleryPreviews([null, null, null]);
    setEditingProduct(null);
    setDynamicSpecs([]);
    setSelectedCategoryId('');
    setOpenSections(['basic']);
  };

  // Mgmt Handlers
  const handleAddCategory = async () => {
    if (!newCatName) return;
    const res = await createCategory(newCatName);
    if (res.success) { setNewCatName(''); fetchCategories(); setNotification({message: 'دسته‌بندی اضافه شد', type: 'success'}); }
  };

  const handleAddAttribute = async () => {
    if (!newAttrName || !attrCategoryId) return;
    const res = await createAttribute(newAttrName, attrCategoryId);
    if (res.success) { setNewAttrName(''); fetchAttributes(); setNotification({message: 'ویژگی اضافه شد', type: 'success'}); }
  };

  const handleCmsChange = <S extends keyof SiteSettings>(section: S, field: keyof SiteSettings[S], value: string) => {
    setSiteSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleBannerChange = (index: number, field: string, value: string) => {
    setSiteSettings(prev => {
      if (!prev) return null;
      const newBanners = [...prev.home.banners];
      if (!newBanners[index]) newBanners[index] = { title: '', link: '', image: '' };
      newBanners[index] = { ...newBanners[index], [field as keyof typeof newBanners[0]]: value };
      return { ...prev, home: { ...prev.home, banners: newBanners } };
    });
  };

  const handleAddBanner = () => {
    setSiteSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        home: {
          ...prev.home,
          banners: [...prev.home.banners, { title: '', link: '', image: '' }]
        }
      };
    });
  };

  const handleRemoveBanner = (index: number) => {
    setSiteSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        home: {
          ...prev.home,
          banners: prev.home.banners.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleCmsFileUpload = (type: 'hero' | 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'hero') {
        setCmsFiles(prev => ({ ...prev, heroImage: file }));
        setPreviews(prev => ({ ...prev, hero: reader.result as string }));
      } else if (type === 'logo') {
        setCmsFiles(prev => ({ ...prev, logo: file }));
        setPreviews(prev => ({ ...prev, logo: reader.result as string }));
      } else if (type === 'banner' && index !== undefined) {
        setCmsFiles(prev => {
          const newBanners = prev.banners.filter(b => b.index !== index);
          return { ...prev, banners: [...newBanners, { index, file }] };
        });
        setPreviews(prev => {
          const newBanners = [...prev.banners];
          newBanners[index] = reader.result as string;
          return { ...prev, banners: newBanners };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    if (!siteSettings) return;
    setIsSubmitting(true);
    const res = await updateSiteSettings(siteSettings, {
      heroImage: cmsFiles.heroImage,
      logo: cmsFiles.logo,
      banners: cmsFiles.banners
    });
    if (res.success) {
      setNotification({ message: 'تنظیمات با موفقیت ذخیره شد', type: 'success' });
      fetchSettings();
    } else {
      setNotification({ message: res.error || 'خطا در ذخیره تنظیمات', type: 'error' });
    }
    setIsSubmitting(false);
  };

  // Blog Handlers
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddBlogCategory = async () => {
    if (!newBlogCatName) return;
    const res = await createBlogCategory(newBlogCatName);
    if (res.success) {
      setNewBlogCatName('');
      fetchBlogCategories();
      setNotification({ message: 'دسته‌بندی اضافه شد', type: 'success' });
    }
  };

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isFeatured = formData.get('isFeatured') === 'true';

    // Check if another post is already featured
    const existingFeatured = blogPosts.find(p => p.isFeatured && p.id !== editingPost?.id);

    if (isFeatured && existingFeatured) {
      const confirmChange = confirm(`مقاله "${existingFeatured.title}" در حال حاضر به عنوان مقاله ویژه انتخاب شده است. آیا مطمئن هستید که می‌خواهید این مقاله را جایگزین آن کنید؟`);
      if (!confirmChange) return;
    }

    setIsSubmitting(true);

    const postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.get('title') as string,
      slug: (formData.get('slug') as string).replace(/\s+/g, '-').toLowerCase(),
      excerpt: formData.get('excerpt') as string || '',
      content: formData.get('content') as string,
      category: formData.get('category') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      status: formData.get('status') as 'draft' | 'published',
      isFeatured: isFeatured,
      metaTitle: formData.get('metaTitle') as string || undefined,
      metaDescription: formData.get('metaDescription') as string || undefined,
      featuredImage: editingPost?.featuredImage || ''
    };

    let res;
    if (editingPost) {
      res = await updateBlogPost(editingPost.id, postData, postImage || undefined);
    } else {
      res = await createBlogPost(postData, postImage || undefined);
    }

    if (res.success) {
      setNotification({ message: 'عملیات با موفقیت انجام شد', type: 'success' });
      setIsAddingPost(false);
      setEditingPost(null);
      setPostImage(null);
      setPostImagePreview(null);
      fetchBlogPosts();
    } else {
      setNotification({ message: res.error || 'خطا در انجام عملیات', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostImagePreview(post.featuredImage);
    setIsAddingPost(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'overview', label: 'پیشخوان', icon: '📊' },
    { id: 'products', label: 'محصولات', icon: '💻' },
    { id: 'cms', label: 'مدیریت محتوا (CMS)', icon: '📝' },
    { id: 'magazine', label: 'مجله و مقالات', icon: '📰' },
    { id: 'management', label: 'مدیریت ساختار', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/login' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-vazir" dir="rtl">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-all text-right font-vazir relative overflow-x-hidden" dir="rtl">

      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl animate-bounce-in flex items-center gap-4 border ${
          notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
        }`}>
          <span className="font-black text-sm">{notification.message}</span>
        </div>
      )}

      {/* Sidebar Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800
        transition-transform duration-500 transform lg:static lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col shadow-2xl lg:shadow-sm
      `}>
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic">A</div>
            <span className="text-xl font-estedad text-slate-900 dark:text-white">آسو شنو ادمین</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-2xl">✕</button>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsAddingProduct(false); resetForm(); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-50 dark:border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
              <span className="text-xl">🚪</span>
              <span>خروج از پنل</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 lg:h-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-10 flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 lg:hidden flex items-center justify-center text-xl shadow-sm">☰</button>
              <h2 className="text-xl sm:text-2xl font-estedad text-slate-900 dark:text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
           </div>
           <div className="flex items-center gap-3">
              <div className="hidden sm:block text-left ml-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">خوش آمدید، ادمین</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">👑</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50/30 dark:bg-transparent">
          <div className="max-w-6xl mx-auto pb-20">

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="space-y-8 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <h3 className="text-2xl sm:text-3xl font-estedad text-slate-900 dark:text-white">فهرست محصولات</h3>
                  {!isAddingProduct && (
                    <button onClick={() => setIsAddingProduct(true)} className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all">+ افزودن محصول جدید</button>
                  )}
                </div>

                {!isAddingProduct ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map(prod => (
                      <div key={prod.id} className="p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                        <div className="aspect-square rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                          {prod.images?.[0] ? (
                            <Image
                              src={getPublicImageUrl(prod.images[0])}
                              alt=""
                              fill
                              className="object-contain p-4"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">🖼️</div>
                          )}
                        </div>
                        <h4 className="font-black text-lg text-slate-800 dark:text-white truncate">{prod.name}</h4>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="font-black text-indigo-600 text-sm sm:text-base">{Number(prod.price).toLocaleString()} تومان</span>
                          <div className="flex gap-2">
                             <button onClick={() => handleEditButtonClick(prod)} className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-50 transition-colors">✏️</button>
                             <button onClick={() => { if(confirm('آیا از حذف این محصول اطمینان دارید؟')) deleteProduct(prod.id).then(fetchProducts) }} className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-16 shadow-xl animate-fade-in">
                    <form onSubmit={handleSubmitProduct} className="space-y-8">
                      <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                         <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h4>
                         <button type="button" onClick={() => { setIsAddingProduct(false); resetForm(); }} className="h-10 sm:h-12 px-6 sm:px-8 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs">انصراف</button>
                      </div>

                      {/* --- SECTION 1: BASIC INFO --- */}
                      <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                        <button type="button" onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 transition-colors">
                           <span className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm sm:text-base text-right">
                              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs italic">01</span>
                              اطلاعات پایه محصول
                           </span>
                           <span className="text-slate-400 text-xs">{openSections.includes('basic') ? '▲' : '▼'}</span>
                        </button>
                        {openSections.includes('basic') && (
                          <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">نام محصول</label>
                                <input type="text" name="name" required defaultValue={editingProduct?.name} className="w-full h-14 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">قیمت (تومان)</label>
                                <input type="text" name="price" required defaultValue={editingProduct?.price} className="w-full h-14 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">دسته‌بندی</label>
                                <select
                                  name="category_id"
                                  required
                                  value={selectedCategoryId}
                                  onChange={(e) => handleCategoryChange(e.target.value)}
                                  className="w-full h-14 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none appearance-none"
                                >
                                   <option value="">انتخاب کنید...</option>
                                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">برند</label>
                                <select name="brand_id" required defaultValue={editingProduct?.brand_id} className="w-full h-14 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none appearance-none">
                                   <option value="">انتخاب کنید...</option>
                                   {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">وضعیت سلامت / فیزیکی</label>
                                <select name="condition" required defaultValue={editingProduct?.condition} className="w-full h-14 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none appearance-none">
                                   <option value="">انتخاب وضعیت...</option>
                                   <option value="نو">نو (New)</option>
                                   <option value="درحد نو">درحد نو (Like New)</option>
                                   <option value="استوک">استوک (Stock)</option>
                                   <option value="کارکرده">کارکرده (Used)</option>
                                   <option value="نیاز به سرویس / تعمیر">نیاز به سرویس / تعمیر</option>
                                </select>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* --- SECTION 2: IMAGES --- */}
                      <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                        <button type="button" onClick={() => toggleSection('images')} className="w-full flex items-center justify-between p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 transition-colors">
                           <span className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm sm:text-base text-right">
                              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs italic">02</span>
                              تصاویر و گالری
                           </span>
                           <span className="text-slate-400 text-xs">{openSections.includes('images') ? '▲' : '▼'}</span>
                        </button>
                        {openSections.includes('images') && (
                          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
                             <div className="lg:col-span-5 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">تصویر اصلی</label>
                                <div onClick={() => document.getElementById('main-up')?.click()} className="aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all relative overflow-hidden">
                                   <input type="file" id="main-up" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                   {mainImagePreview ? (
                                     <Image
                                       src={mainImagePreview.startsWith('data:') ? mainImagePreview : getPublicImageUrl(mainImagePreview)}
                                       alt=""
                                       fill
                                       className="object-contain p-6"
                                       sizes="(max-width: 768px) 100vw, 400px"
                                     />
                                   ) : <span className="text-4xl text-slate-300">📸</span>}
                                </div>
                             </div>
                             <div className="lg:col-span-7 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">تصاویر گالری (۳ عدد)</label>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                   {[0,1,2].map(i => (
                                     <div key={i} onClick={() => document.getElementById(`gal-up-${i}`)?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 cursor-pointer hover:border-indigo-400 transition-all relative overflow-hidden">
                                        <input type="file" id={`gal-up-${i}`} className="hidden" accept="image/*" onChange={(e) => handleGalleryImageChange(i, e)} />
                                        {galleryPreviews[i] ? (
                                          <Image
                                            src={galleryPreviews[i]!.startsWith('data:') ? galleryPreviews[i]! : getPublicImageUrl(galleryPreviews[i]!)}
                                            alt=""
                                            fill
                                            className="object-contain p-2"
                                            sizes="(max-width: 768px) 33vw, 150px"
                                          />
                                        ) : <span className="text-xl text-slate-300">+</span>}
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                        )}
                      </div>

                      {/* --- SECTION 3: DYNAMIC SPECS --- */}
                      <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                        <button type="button" onClick={() => toggleSection('specs')} className="w-full flex items-center justify-between p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 transition-colors">
                           <span className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm sm:text-base text-right">
                              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs italic">03</span>
                              مشخصات فنی و ویژگی‌های هوشمند
                           </span>
                           <span className="text-slate-400 text-xs">{openSections.includes('specs') ? '▲' : '▼'}</span>
                        </button>
                        {openSections.includes('specs') && (
                          <div className="p-5 sm:p-8 space-y-6">
                             {dynamicSpecs.length === 0 && (
                               <div className="p-8 sm:p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                  برای نمایش فیلدهای هوشمند، دسته‌بندی را انتخاب کنید<br/>یا ویژگی سفارشی اضافه کنید.
                               </div>
                             )}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {dynamicSpecs.map((spec, i) => (
                                  <div key={i} className="flex gap-2 items-end group animate-fade-in relative">
                                     <div className="flex-1 space-y-2">
                                        <input
                                          placeholder="نام ویژگی (مثلا: رم)"
                                          value={spec.key}
                                          onChange={(e) => updateSpec(i, 'key', e.target.value)}
                                          className="w-full h-11 sm:h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-xs border-2 border-transparent focus:border-indigo-600 outline-none"
                                        />
                                        <input
                                          placeholder="مقدار"
                                          value={spec.value}
                                          onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                          className="w-full h-11 sm:h-12 bg-white dark:bg-slate-900 rounded-xl px-4 font-black text-xs border border-slate-200 dark:border-slate-700 focus:border-indigo-600 outline-none"
                                        />
                                     </div>
                                     <button type="button" onClick={() => removeSpec(i)} className="h-11 sm:h-12 w-11 sm:w-12 flex-shrink-0 rounded-xl bg-red-50 text-red-500 flex items-center justify-center lg:opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                  </div>
                                ))}
                             </div>
                             <button type="button" onClick={handleAddCustomSpec} className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 font-black text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all">+ افزودن مشخصه سفارشی جدید</button>
                          </div>
                        )}
                      </div>

                      {/* --- SECTION 4: DESCRIPTION --- */}
                      <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                        <button type="button" onClick={() => toggleSection('desc')} className="w-full flex items-center justify-between p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 transition-colors">
                           <span className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm sm:text-base text-right">
                              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs italic">04</span>
                              توضیحات و بررسی محصول
                           </span>
                           <span className="text-slate-400 text-xs">{openSections.includes('desc') ? '▲' : '▼'}</span>
                        </button>
                        {openSections.includes('desc') && (
                          <div className="p-5 sm:p-8">
                             <textarea name="description" rows={8} defaultValue={editingProduct?.description} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 sm:p-8 font-black border-2 border-transparent focus:border-indigo-600 outline-none resize-none text-sm"></textarea>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
                        <button type="button" onClick={() => { setIsAddingProduct(false); resetForm(); }} className="h-14 sm:h-16 px-12 rounded-2xl font-black text-slate-400">انصراف</button>
                        <button type="submit" disabled={isSubmitting} className="h-14 sm:h-16 px-10 sm:px-20 rounded-2xl bg-indigo-600 text-white font-black text-base sm:text-lg shadow-xl disabled:bg-slate-300">
                           {isSubmitting ? 'در حال ثبت...' : (editingProduct ? 'بروزرسانی نهایی' : 'ثبت نهایی محصول')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* CMS TAB */}
            {activeTab === 'cms' && siteSettings && (
              <div className="space-y-10 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-estedad text-slate-900 dark:text-white">مدیریت محتوای سایت</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">تمام متون، تصاویر و تنظیمات سئو سایت را از اینجا تغییر دهید.</p>
                  </div>
                  <button onClick={handleSaveSettings} disabled={isSubmitting} className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all disabled:bg-slate-300">
                    {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تمام تغییرات'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* General & SEO */}
                  <section className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                      <span className="text-2xl">🌐</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">تنظیمات عمومی و سئو</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="lg:col-span-4 space-y-4">
                          <label className="text-xs font-black text-slate-400 mr-2">لوگوی سایت</label>
                          <div onClick={() => document.getElementById('logo-up')?.click()} className="h-24 w-24 rounded-2xl border-4 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all relative overflow-hidden">
                            <input type="file" id="logo-up" className="hidden" accept="image/*" onChange={(e) => handleCmsFileUpload('logo', e)} />
                            {previews.logo || siteSettings.general.logo ? (
                              <Image
                                src={previews.logo || getPublicImageUrl(siteSettings.general.logo)}
                                alt=""
                                fill
                                className="object-contain p-2"
                                sizes="96px"
                              />
                            ) : (
                              <span className="text-2xl">🖼️</span>
                            )}
                          </div>
                        </div>
                        <div className="lg:col-span-8 space-y-2">
                          <label className="text-xs font-black text-slate-400 mr-2">نام سایت (نمایش در برندینگ)</label>
                        <input value={siteSettings.general.siteName} onChange={e => handleCmsChange('general', 'siteName', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                        <p className="text-[10px] text-slate-400 mr-2">مثال: آسو شنو</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">عنوان اصلی سئو (Browser Title)</label>
                        <input value={siteSettings.general.siteTitle} onChange={e => handleCmsChange('general', 'siteTitle', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                        <p className="text-[10px] text-slate-400 mr-2">عنوانی که در گوگل نمایش داده می‌شود.</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">توضیحات متا (SEO Description)</label>
                        <textarea value={siteSettings.general.siteDescription} onChange={e => handleCmsChange('general', 'siteDescription', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600 resize-none" />
                        <p className="text-[10px] text-slate-400 mr-2">توضیح کوتاهی که در نتایج جستجو زیر عنوان قرار می‌گیرد.</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">کلمات کلیدی (جدا شده با کاما)</label>
                        <input value={siteSettings.general.siteKeywords} onChange={e => handleCmsChange('general', 'siteKeywords', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                      </div>
                    </div>
                  </section>

                  {/* Contact Info */}
                  <section className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                      <span className="text-2xl">📞</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">اطلاعات تماس و شبکه‌های اجتماعی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">شماره تماس اصلی</label>
                        <input value={siteSettings.contact.phone} onChange={e => handleCmsChange('contact', 'phone', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">ایمیل</label>
                        <input value={siteSettings.contact.email} onChange={e => handleCmsChange('contact', 'email', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">آیدی اینستاگرام</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                          <input value={siteSettings.contact.instagram} onChange={e => handleCmsChange('contact', 'instagram', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl pl-6 pr-10 font-bold outline-none border-2 border-transparent focus:border-indigo-600" dir="ltr" />
                        </div>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">آدرس فیزیکی</label>
                        <input value={siteSettings.contact.address} onChange={e => handleCmsChange('contact', 'address', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                      </div>
                    </div>
                  </section>

                  {/* Home Page Content */}
                  <section className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                      <span className="text-2xl">🏠</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">بخش هیرو و بنرهای صفحه اصلی</h4>
                    </div>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-4">
                          <label className="text-xs font-black text-slate-400 mr-2">تصویر اصلی (Hero)</label>
                          <div onClick={() => document.getElementById('hero-up')?.click()} className="aspect-video rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all relative overflow-hidden">
                            <input type="file" id="hero-up" className="hidden" accept="image/*" onChange={(e) => handleCmsFileUpload('hero', e)} />
                            {previews.hero || siteSettings.home.heroImage ? (
                              <Image
                                src={previews.hero || getPublicImageUrl(siteSettings.home.heroImage)}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 400px"
                              />
                            ) : (
                              <span className="text-4xl">🖼️</span>
                            )}
                          </div>
                        </div>
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">عنوان بزرگ هیرو</label>
                            <input value={siteSettings.home.heroTitle} onChange={e => handleCmsChange('home', 'heroTitle', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">زیرعنوان هیرو</label>
                            <input value={siteSettings.home.heroSubtitle} onChange={e => handleCmsChange('home', 'heroSubtitle', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">متن دکمه</label>
                            <input value={siteSettings.home.heroButtonText} onChange={e => handleCmsChange('home', 'heroButtonText', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">لینک دکمه</label>
                            <input value={siteSettings.home.heroButtonLink} onChange={e => handleCmsChange('home', 'heroButtonLink', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none border-2 border-transparent focus:border-indigo-600" dir="ltr" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-50 dark:border-slate-800 pt-8">
                        <div className="flex justify-between items-center mb-6">
                          <h5 className="font-black text-slate-800 dark:text-slate-200">بنرهای تبلیغاتی</h5>
                          <button onClick={handleAddBanner} className="text-xs font-black text-indigo-600">+ افزودن بنر جدید</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {siteSettings.home.banners.map((banner, idx) => (
                            <div key={idx} className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4 relative group">
                              <button onClick={() => handleRemoveBanner(idx)} className="absolute -top-2 -left-2 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">✕</button>
                              <div onClick={() => document.getElementById(`banner-up-${idx}`)?.click()} className="aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-900 cursor-pointer overflow-hidden relative">
                                <input type="file" id={`banner-up-${idx}`} className="hidden" accept="image/*" onChange={(e) => handleCmsFileUpload('banner', e, idx)} />
                                {previews.banners[idx] || banner.image ? (
                                  <Image
                                    src={previews.banners[idx] || getPublicImageUrl(banner.image)}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                  />
                                ) : (
                                  <span className="text-slate-300">انتخاب تصویر بنر</span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <input placeholder="عنوان بنر" value={banner.title} onChange={e => handleBannerChange(idx, 'title', e.target.value)} className="h-12 bg-white dark:bg-slate-900 rounded-xl px-4 text-xs font-bold outline-none border border-slate-200 dark:border-slate-700" />
                                <input placeholder="لینک (URL)" value={banner.link} onChange={e => handleBannerChange(idx, 'link', e.target.value)} className="h-12 bg-white dark:bg-slate-900 rounded-xl px-4 text-xs font-bold outline-none border border-slate-200 dark:border-slate-700" dir="ltr" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Features & Messages */}
                  <section className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                      <span className="text-2xl">✨</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">ویژگی‌ها و پیام‌های اطلاع‌رسانی</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">پیام ارسال (Shipping)</label>
                        <input value={siteSettings.features.shipping} onChange={e => handleCmsChange('features', 'shipping', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">پیام ضمانت (Warranty)</label>
                        <input value={siteSettings.features.warranty} onChange={e => handleCmsChange('features', 'warranty', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">پیام پرداخت (Payment)</label>
                        <input value={siteSettings.features.payment} onChange={e => handleCmsChange('features', 'payment', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">پیام پشتیبانی (Support)</label>
                        <input value={siteSettings.features.support} onChange={e => handleCmsChange('features', 'support', e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-bold outline-none" />
                      </div>
                    </div>
                  </section>

                  {/* Static Pages Content */}
                  <section className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                      <span className="text-2xl">📄</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">محتوای صفحات ثابت (بزودی)</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">متن صفحه درباره ما</label>
                        <textarea value={siteSettings.pages.aboutUs} onChange={e => handleCmsChange('pages', 'aboutUs', e.target.value)} rows={5} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 font-bold outline-none resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 mr-2">متن فوتر (About Section)</label>
                        <textarea value={siteSettings.footer.aboutText} onChange={e => handleCmsChange('footer', 'aboutText', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 font-bold outline-none resize-none" />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex justify-end pt-10">
                  <button onClick={handleSaveSettings} disabled={isSubmitting} className="h-16 px-20 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-xl disabled:bg-slate-300">
                    {isSubmitting ? 'در حال ذخیره تغییرات...' : 'ذخیره نهایی تمامی بخش‌ها'}
                  </button>
                </div>
              </div>
            )}

            {/* MAGAZINE TAB */}
            {activeTab === 'magazine' && (
              <div className="space-y-10 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <h3 className="text-2xl sm:text-3xl font-estedad text-slate-900 dark:text-white">مدیریت مجله</h3>
                  {!isAddingPost && (
                    <button onClick={() => { setIsAddingPost(true); setEditingPost(null); setPostImagePreview(null); }} className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all">+ افزودن مقاله جدید</button>
                  )}
                </div>

                {!isAddingPost ? (
                  <div className="space-y-6">
                    {/* Blog Stats / Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">تعداد کل مقالات</p>
                          <h4 className="text-4xl font-black">{blogPosts.length}</h4>
                       </div>
                       <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">پیش‌نویس‌ها</p>
                          <h4 className="text-4xl font-black text-slate-800 dark:text-white">{blogPosts.filter(p => p.status === 'draft').length}</h4>
                       </div>
                       <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">دسته‌بندی‌ها</p>
                          <h4 className="text-4xl font-black text-slate-800 dark:text-white">{blogCategories.length}</h4>
                       </div>
                    </div>

                    {/* Posts List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogPosts.map(post => (
                        <div key={post.id} className={`p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border ${post.isFeatured ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800'} shadow-sm flex flex-col gap-4 relative`}>
                          {post.isFeatured && <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full z-10">ویژه / بنر اصلی</span>}
                          <div className="aspect-video rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                            {post.featuredImage ? (
                              <Image
                                src={getPublicImageUrl(post.featuredImage)}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-slate-300">🖼️</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-indigo-500 uppercase">{post.category}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${post.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                {post.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                              </span>
                            </div>
                            <h4 className="font-black text-lg text-slate-800 dark:text-white line-clamp-2">{post.title}</h4>
                          </div>
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                            <div className="flex gap-2">
                               <button onClick={() => handleEditPost(post)} className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-50 transition-colors">✏️</button>
                               <button onClick={() => { if(confirm('آیا از حذف این مقاله اطمینان دارید؟')) deleteBlogPost(post.id).then(fetchBlogPosts) }} className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-xl animate-fade-in">
                    <form onSubmit={handleSubmitPost} className="space-y-10">
                      <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                         <h4 className="text-2xl font-black text-slate-900 dark:text-white">{editingPost ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}</h4>
                         <button type="button" onClick={() => { setIsAddingPost(false); setEditingPost(null); }} className="h-12 px-8 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs">انصراف</button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Right Side: Content */}
                        <div className="lg:col-span-8 space-y-8">
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 mr-2">عنوان مقاله</label>
                             <input name="title" required defaultValue={editingPost?.title} className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-lg border-2 border-transparent focus:border-indigo-600 outline-none" placeholder="عنوانی جذاب بنویسید..." />
                          </div>

                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 mr-2">نامک (Slug) - برای آدرس URL</label>
                             <div className="relative group">
                                <input name="slug" required defaultValue={editingPost?.slug} className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-6 font-bold text-sm border-2 border-transparent focus:border-indigo-600 outline-none" dir="ltr" placeholder="example-article-slug" />
                                <div className="absolute right-0 top-full mt-2 w-full p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 opacity-0 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none">
                                   <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                      📌 **نامک چیست؟** آدرس اینترنتی مقاله شماست.
                                      <br/>مثال: برای مقاله‌ای با عنوان "راهنمای خرید لپ‌تاپ"، نامک بهتر است `buying-laptop-guide` باشد.
                                      <br/>**قوانین:** فقط حروف انگلیسی، اعداد و خط تیره (-) مجاز است. فاصله نگذارید.
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 mr-2">خلاصه کوتاه (Excerpt)</label>
                             <textarea name="excerpt" rows={3} defaultValue={editingPost?.excerpt} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 font-bold text-sm border-2 border-transparent focus:border-indigo-600 outline-none resize-none" placeholder="توضیح کوتاهی برای نمایش در کارت مقاله..."></textarea>
                          </div>

                          <div className="space-y-4">
                             <label className="text-xs font-black text-slate-400 mr-2">محتوای اصلی مقاله</label>
                             <div className="relative group">
                                <textarea name="content" rows={18} defaultValue={editingPost?.content} className="w-full bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 font-medium text-base border-2 border-transparent focus:border-indigo-600 outline-none resize-y leading-loose" placeholder="محتوای مقاله را با استفاده از تگ‌های راهنما بنویسید..."></textarea>

                                {/* Professional HTML Guide UI */}
                                <div className="mt-6 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                                   <div className="flex items-center gap-3 mb-2">
                                      <span className="text-xl">🎨</span>
                                      <h5 className="text-sm font-black text-slate-800 dark:text-white">راهنمای حرفه‌ای نگارش و قالب‌بندی مقاله</h5>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Row 1: Headings */}
                                      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                         <p className="text-[10px] font-black text-indigo-600 uppercase mb-3">تیترهای اصلی و فرعی</p>
                                         <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;h2&gt;عنوان&lt;/h2&gt;</code>
                                               <span className="text-xs font-bold text-slate-500">تیتر بزرگ</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;h3&gt;عنوان&lt;/h3&gt;</code>
                                               <span className="text-xs font-bold text-slate-500">تیتر متوسط</span>
                                            </div>
                                         </div>
                                      </div>

                                      {/* Row 2: Formatting */}
                                      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                         <p className="text-[10px] font-black text-indigo-600 uppercase mb-3">تأکید و استایل متن</p>
                                         <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;strong&gt;متن&lt;/strong&gt;</code>
                                               <span className="text-xs font-bold text-slate-800 dark:text-white font-black">متن ضخیم</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;a href="لینک"&gt;متن&lt;/a&gt;</code>
                                               <span className="text-xs font-bold text-indigo-500 underline">لینک دادن</span>
                                            </div>
                                         </div>
                                      </div>

                                      {/* Row 3: Lists */}
                                      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                         <p className="text-[10px] font-black text-indigo-600 uppercase mb-3">لیست‌های نشانه‌دار</p>
                                         <div className="space-y-2">
                                            <code className="block text-[9px] bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 leading-relaxed">
                                               &lt;ul&gt;<br/>
                                               &nbsp;&nbsp;&lt;li&gt;مورد اول&lt;/li&gt;<br/>
                                               &nbsp;&nbsp;&lt;li&gt;مورد دوم&lt;/li&gt;<br/>
                                               &lt;/ul&gt;
                                            </code>
                                         </div>
                                      </div>

                                      {/* Row 4: Images & Quotes */}
                                      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                         <p className="text-[10px] font-black text-indigo-600 uppercase mb-3">نقل‌قول و تصویر</p>
                                         <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;blockquote&gt;متن&lt;/blockquote&gt;</code>
                                               <span className="text-[10px] font-bold text-slate-500">باکس نقل‌قول</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                               <code className="text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">&lt;img src="آدرس" /&gt;</code>
                                               <span className="text-[10px] font-bold text-slate-500">درج تصویر داخلی</span>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>

                        {/* Left Side: Settings & Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                           <div className="space-y-4">
                              <label className="text-xs font-black text-slate-400 mr-2">تصویر شاخص</label>
                              <div onClick={() => document.getElementById('post-up')?.click()} className="aspect-video rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all relative overflow-hidden">
                                 <input type="file" id="post-up" className="hidden" accept="image/*" onChange={handlePostImageChange} />
                                 {postImagePreview ? (
                                   <Image
                                     src={postImagePreview.startsWith('data:') ? postImagePreview : getPublicImageUrl(postImagePreview)}
                                     alt=""
                                     fill
                                     className="object-cover"
                                     sizes="(max-width: 768px) 100vw, 400px"
                                   />
                                 ) : <span className="text-4xl">📸</span>}
                              </div>
                           </div>

                           <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-6">
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-black text-slate-400 mr-2">دسته‌بندی</label>
                                    <button type="button" onClick={() => setActiveTab('management')} className="text-[9px] font-black text-indigo-600">+ مدیریت دسته‌ها</button>
                                 </div>
                                 <select name="category" required defaultValue={editingPost?.category} className="w-full h-12 bg-white dark:bg-slate-900 rounded-xl px-4 font-bold text-xs border border-slate-200 dark:border-slate-700 outline-none">
                                    <option value="">انتخاب کنید...</option>
                                    {blogCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                 </select>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 mr-2">برچسب‌ها (با کاما جدا کنید)</label>
                                 <input name="tags" defaultValue={editingPost?.tags?.join(', ')} className="w-full h-12 bg-white dark:bg-slate-900 rounded-xl px-4 font-bold text-xs border border-slate-200 dark:border-slate-700 outline-none" placeholder="لپ‌تاپ، اشنویه، استوک..." />
                              </div>

                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 mr-2">وضعیت انتشار</label>
                                 <select name="status" defaultValue={editingPost?.status || 'published'} className="w-full h-12 bg-white dark:bg-slate-900 rounded-xl px-4 font-bold text-xs border border-slate-200 dark:border-slate-700 outline-none">
                                    <option value="published">منتشر شده</option>
                                    <option value="draft">پیش‌نویس</option>
                                 </select>
                              </div>

                              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                                 <input type="checkbox" name="isFeatured" value="true" defaultChecked={editingPost?.isFeatured} id="feat-check" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                 <label htmlFor="feat-check" className="text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer">نمایش به عنوان مقاله ویژه (بنر بالا)</label>
                              </div>
                           </div>

                           <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-3xl space-y-6 border border-indigo-100/50 dark:border-indigo-900/30">
                              <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">تنظیمات سئو (Meta Data)</h5>
                              <div className="space-y-2 group relative">
                                 <label className="text-xs font-bold text-slate-500">عنوان سئو (Meta Title)</label>
                                 <input name="metaTitle" defaultValue={editingPost?.metaTitle} className="w-full h-11 bg-white dark:bg-slate-900 rounded-xl px-4 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none" placeholder="عنوانی که در گوگل نمایش داده می‌شود" />
                                 <div className="absolute right-0 top-full mt-2 w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 shadow-xl opacity-0 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none">
                                   <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                      💡 **عنوان سئو:** متنی است که در نتایج جستجوی گوگل به عنوان تیتر لینک شما نمایش داده می‌شود.
                                      <br/>مثال: `بهترین لپ‌تاپ‌های گیمینگ ۲۰۲۴ | آسو شنو`
                                      <br/>**نکته:** بهتر است شامل نام سایت هم باشد.
                                   </p>
                                 </div>
                              </div>
                              <div className="space-y-2 group relative">
                                 <label className="text-xs font-bold text-slate-500">توضیحات سئو (Meta Desc)</label>
                                 <textarea name="metaDescription" rows={3} defaultValue={editingPost?.metaDescription} className="w-full bg-white dark:bg-slate-900 rounded-xl p-4 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none resize-none" placeholder="توضیح کوتاهی که در گوگل زیر عنوان نمایش داده می‌شود" />
                                 <div className="absolute right-0 top-full mt-2 w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 shadow-xl opacity-0 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none">
                                   <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                      💡 **توضیحات سئو:** متنی است که کاربر در گوگل زیر تیتر شما می‌خواند.
                                      <br/>**مثال:** `در این مقاله به بررسی تخصصی لپ‌تاپ‌های استوک وارداتی از دبی پرداخته‌ایم تا بهترین انتخاب را برای بودجه خود داشته باشید.`
                                   </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
                        <button type="button" onClick={() => { setIsAddingPost(false); setEditingPost(null); }} className="h-16 px-12 rounded-2xl font-black text-slate-400">انصراف</button>
                        <button type="submit" disabled={isSubmitting} className="h-16 px-20 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-xl disabled:bg-slate-300">
                           {isSubmitting ? 'در حال ثبت...' : (editingPost ? 'بروزرسانی نهایی' : 'انتشار مقاله')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* MANAGEMENT TAB */}
            {activeTab === 'management' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                 {/* Categories */}
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-2xl font-estedad text-slate-800 dark:text-white">مدیریت دسته‌بندی‌ها (فروشگاه)</h3>
                    <div className="flex gap-4">
                       <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="نام دسته‌بندی..." className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600" />
                       <button onClick={handleAddCategory} className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black">+</button>
                    </div>
                    <div className="space-y-3">
                       {categories.map(cat => (
                         <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="font-black text-slate-700 dark:text-slate-200">{cat.name}</span>
                            <button onClick={() => { if(confirm('حذف شود؟')) deleteCategory(cat.id).then(fetchCategories) }} className="text-red-400 text-xs font-black">حذف</button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Attributes */}
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-2xl font-estedad text-slate-800 dark:text-white">ویژگی‌های داینامیک</h3>
                    <div className="space-y-4">
                       <select value={attrCategoryId} onChange={e => setAttrCategoryId(e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-sm outline-none">
                          <option value="">انتخاب دسته‌بندی...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <div className="flex gap-4">
                          <input value={newAttrName} onChange={e => setNewAttrName(e.target.value)} placeholder="نام ویژگی..." className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600" />
                          <button onClick={handleAddAttribute} className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black">+</button>
                       </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                       {categories.map(cat => (
                         <div key={cat.id} className="space-y-2">
                            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mr-2">{cat.name}</h5>
                            {attributes.filter(a => a.category_id === cat.id).map(attr => (
                               <div key={attr.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{attr.name}</span>
                                  <button onClick={() => { if(confirm('حذف شود؟')) deleteAttribute(attr.id).then(fetchAttributes) }} className="text-red-400 text-xs font-black">حذف</button>
                               </div>
                            ))}
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Brands */}
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-2xl font-estedad text-slate-800 dark:text-white">مدیریت برندها</h3>
                    <div className="flex gap-4">
                       <input value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="نام برند..." className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600" />
                       <button onClick={async () => { const res = await createBrand(newBrandName); if(res.success) { setNewBrandName(''); fetchBrands(); setNotification({message: 'برند اضافه شد', type: 'success'}); } }} className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black">+</button>
                    </div>
                    <div className="space-y-3">
                       {brands.map(brand => (
                         <div key={brand.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="font-black text-slate-700 dark:text-slate-200">{brand.name}</span>
                            <button onClick={() => { if(confirm('حذف شود؟')) deleteBrand(brand.id).then(fetchBrands) }} className="text-red-400 text-xs font-black">حذف</button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Blog Categories Management */}
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-2xl font-estedad text-slate-800 dark:text-white">دسته‌بندی‌های مجله</h3>
                    <div className="flex gap-4">
                       <input value={newBlogCatName} onChange={e => setNewBlogCatName(e.target.value)} placeholder="نام دسته‌بندی مجله..." className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600" />
                       <button onClick={handleAddBlogCategory} className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black">+</button>
                    </div>
                    <div className="space-y-3">
                       {blogCategories.map(cat => (
                         <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="font-black text-slate-700 dark:text-slate-200">{cat.name}</span>
                            <button onClick={() => { if(confirm('حذف شود؟')) deleteBlogCategory(cat.id).then(fetchBlogCategories) }} className="text-red-400 text-xs font-black">حذف</button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}
