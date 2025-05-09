
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchProducts,
  fetchProductCategories,
  addProduct,
  updateProduct,
  deleteProduct
} from '@/services/shopService';
import { Product } from '@/types/shop';
import ProductForm from './ProductForm';

const ProductsManagement: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Load products and categories
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchProductCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        stock_count: parseInt(formData.stock_count),
      };

      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(editingProduct.id, productData);
        if (updated) {
          setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
          toast({
            title: "Success",
            description: "Product updated successfully",
          });
        }
      } else {
        // Create new product
        const created = await addProduct(productData);
        if (created) {
          setProducts([...products, created]);
          toast({
            title: "Success",
            description: "Product created successfully",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Product Management</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-card/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <ProductForm
          initialData={editingProduct || undefined}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormOpen(false)}
          categories={categories}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={handleCreateProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
          <p className="text-white/70">No products available. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-white/10"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 bg-black/20 rounded mr-4 overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="flex items-center text-sm text-white/70">
                    <span className="mr-3">${product.price.toFixed(2)}</span>
                    <span className="mr-3">Stock: {product.stock_count}</span>
                    <span>{product.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => handleDeletePrompt(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsManagement;
